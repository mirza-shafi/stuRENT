"""
ChatMessage serializer.
Serializes ChatMessage model instance data for API responses.
"""

from rest_framework import serializers
from apps.rental.models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage details."""

    senderEmail = serializers.EmailField(source="sender.email", read_only=True)
    time = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "senderEmail", "text", "time"]
