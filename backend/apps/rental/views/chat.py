"""
Chat views.
Handles direct messaging endpoints.
"""

from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User

from apps.rental.models import ChatMessage, Customer, Product
from apps.rental.serializers import ChatMessageSerializer


class ChatConversationsView(APIView):
    """
    GET /api/v1/chat/conversations/
    Lists unique conversation summaries for the logged-in user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.email:
            return Response(
                {"error": "User does not have an email address configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get all messages where user is either sender or recipient
        messages = (
            ChatMessage.objects.filter(Q(sender=user) | Q(recipient=user))
            .select_related("sender", "recipient", "product")
            .order_by("created_at")
        )

        convos_dict = {}
        for msg in messages:
            other_user = msg.recipient if msg.sender == user else msg.sender
            if not other_user.email:
                continue

            convo_key = (msg.product.id, other_user.email)

            if convo_key not in convos_dict:
                # Resolve names
                other_cust = Customer.objects.filter(email=other_user.email).first()
                other_name = (
                    other_cust.name
                    if other_cust
                    else (other_user.get_full_name() or other_user.username)
                )

                user_cust = Customer.objects.filter(email=user.email).first()
                user_name = (
                    user_cust.name
                    if user_cust
                    else (user.get_full_name() or user.username)
                )

                sorted_emails = sorted([user.email, other_user.email])
                convo_id = f"{msg.product.id}::{sorted_emails[0]}::{sorted_emails[1]}"

                # Stable color selection based on email hash
                colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]
                color = colors[sum(ord(c) for c in other_user.email) % len(colors)]

                convos_dict[convo_key] = {
                    "id": convo_id,
                    "productId": msg.product.id,
                    "productName": msg.product.name,
                    "participants": [user.email, other_user.email],
                    "participantNames": {
                        user.email: user_name,
                        other_user.email: other_name,
                    },
                    "color": color,
                    "messages": [],
                    "unread": 0,
                }

            convos_dict[convo_key]["messages"].append(msg)
            if msg.recipient == user and not msg.is_read:
                convos_dict[convo_key]["unread"] += 1

        # Format and sort by last message time
        results = []
        for key, convo in convos_dict.items():
            last_msg = convo["messages"][-1]
            convo["lastMessage"] = last_msg.text
            convo["lastMessageTime"] = last_msg.created_at.isoformat()
            del convo["messages"]
            results.append(convo)

        results.sort(key=lambda x: x["lastMessageTime"], reverse=True)
        return Response(results)


class ChatMessagesView(APIView):
    """
    GET /api/v1/chat/messages/ — Fetch conversation thread.
    POST /api/v1/chat/messages/ — Post a new message.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        convo_id = request.query_params.get("convo_id")
        if not convo_id:
            return Response(
                {"error": "convo_id query param is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        parts = convo_id.split("::")
        if len(parts) != 3:
            return Response(
                {"error": "Invalid convo_id format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_id = parts[0]
        email1 = parts[1]
        email2 = parts[2]

        user_email = request.user.email
        if not user_email:
            return Response(
                {"error": "User does not have an email address configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user_email != email1 and user_email != email2:
            return Response(
                {"error": "You are not a participant in this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        other_email = email2 if user_email == email1 else email1
        other_user = User.objects.filter(email=other_email).first()

        # Fallback helper for admin if name differs slightly or user not found
        if not other_user and other_email == "admin@sturent.com":
            other_user = User.objects.filter(is_staff=True).first()

        if not other_user:
            return Response(
                {"error": "Other participant user not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get all thread messages
        messages = ChatMessage.objects.filter(
            product_id=product_id,
            sender__in=[request.user, other_user],
            recipient__in=[request.user, other_user],
        ).order_by("created_at")

        # Mark received messages as read
        unread_received = messages.filter(recipient=request.user, is_read=False)
        if unread_received.exists():
            unread_received.update(is_read=True)

        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        convo_id = request.data.get("convo_id")
        text = request.data.get("text")

        if not text or not text.strip():
            return Response(
                {"error": "text is required and cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_email = request.user.email
        if not user_email:
            return Response(
                {"error": "User does not have an email address configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not convo_id:
            # Fallback if starting chat directly with product details fields
            product_id = request.data.get("product_id")
            recipient_email = request.data.get("recipient_email")
            if not product_id or not recipient_email:
                return Response(
                    {"error": "convo_id or (product_id and recipient_email) is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            parts = convo_id.split("::")
            if len(parts) != 3:
                return Response(
                    {"error": "Invalid convo_id format."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            product_id = parts[0]
            email1 = parts[1]
            email2 = parts[2]

            if user_email != email1 and user_email != email2:
                return Response(
                    {"error": "You are not a participant in this conversation."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            recipient_email = email2 if user_email == email1 else email1

        recipient_user = User.objects.filter(email=recipient_email).first()
        if not recipient_user and recipient_email == "admin@sturent.com":
            recipient_user = User.objects.filter(is_staff=True).first()

        if not recipient_user:
            return Response(
                {"error": f"Recipient user with email '{recipient_email}' not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Create message record
        message = ChatMessage.objects.create(
            sender=request.user,
            recipient=recipient_user,
            product=product,
            text=text.strip(),
        )

        serializer = ChatMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
