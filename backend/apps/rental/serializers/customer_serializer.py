"""
Customer serializers.
"""

from rest_framework import serializers
from apps.rental.models import Customer


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    total_orders = serializers.IntegerField(read_only=True)

    class Meta:
        model = Customer
        fields = ("id", "name", "email", "phone", "total_orders", "date_created", "avatar_url")
        read_only_fields = ("id", "date_created", "total_orders")


class CustomerDetailSerializer(serializers.ModelSerializer):
    """Full serializer for create / retrieve / update."""

    total_orders = serializers.IntegerField(read_only=True)

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("id", "date_created", "updated_at")
