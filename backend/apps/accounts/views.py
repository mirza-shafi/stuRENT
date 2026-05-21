"""
Accounts views.
Provides endpoints for registration, token management, and current user info.
"""

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Create a new user account. No authentication required.
    Automatically creates a linked Customer profile for the student.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        from apps.rental.models import Customer  # avoid circular import at module level

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Auto-create a Customer profile linked to this user
        Customer.objects.create(
            user=user,
            name=user.username,
            email=user.email,
        )

        return Response(
            {
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Returns access + refresh JWT tokens.
    """
    permission_classes = (permissions.AllowAny,)


class TokenRefreshView(TokenRefreshView):
    """
    POST /api/v1/auth/token/refresh/
    Returns a new access token given a valid refresh token.
    """
    permission_classes = (permissions.AllowAny,)


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — Blacklists the refresh token."""

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """GET /api/v1/auth/me/ — Returns the authenticated user's profile."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminRequestView(APIView):
    """
    POST /api/v1/auth/admin-request/ — Submit an admin registration request.
    GET  /api/v1/auth/admin-request/ — List pending requests (admin only).
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def post(self, request):
        from apps.accounts.models import AdminRequest
        from django.contrib.auth.models import User

        username         = request.data.get('username', '').strip()
        email            = request.data.get('email', '').strip()
        password         = request.data.get('password', '')
        password_confirm = request.data.get('password_confirm', '')

        if not all([username, email, password]):
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response({'password_confirm': ['Passwords do not match.']}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'username': ['Username already taken.']}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'email': ['Email already registered.']}, status=status.HTTP_400_BAD_REQUEST)

        # Create inactive user (cannot login until approved)
        user = User.objects.create_user(username=username, email=email, password=password, is_active=False)
        AdminRequest.objects.create(user=user)

        return Response({'message': 'Admin request submitted. Awaiting approval.'}, status=status.HTTP_201_CREATED)

    def get(self, request):
        from apps.accounts.models import AdminRequest
        requests = AdminRequest.objects.filter(status='pending').values(
            'id', 'user__username', 'user__email', 'requested_at', 'status'
        )
        return Response(list(requests))


class AdminRequestActionView(APIView):
    """
    POST /api/v1/auth/admin-request/<pk>/approve/ — Approve an admin request.
    POST /api/v1/auth/admin-request/<pk>/reject/  — Reject an admin request.
    """

    permission_classes = (permissions.IsAdminUser,)

    def post(self, request, pk, action):
        from apps.accounts.models import AdminRequest

        try:
            req = AdminRequest.objects.get(pk=pk)
        except AdminRequest.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'approve':
            req.status      = AdminRequest.Status.APPROVED
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save()
            # Activate user and grant staff
            req.user.is_active = True
            req.user.is_staff  = True
            req.user.save()
            return Response({'message': f'{req.user.username} approved as admin.'})

        elif action == 'reject':
            req.status      = AdminRequest.Status.REJECTED
            req.reviewed_by = request.user
            req.reviewed_at = timezone.now()
            req.save()
            req.user.delete()
            return Response({'message': 'Request rejected and user removed.'})

        return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)
