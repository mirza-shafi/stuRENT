"""
Order serializers.
"""

from rest_framework import serializers
from apps.rental.models import Order
from .customer_serializer import CustomerListSerializer
from .product_serializer import ProductListSerializer


class OrderListSerializer(serializers.ModelSerializer):
    """Flat serializer for list views — embeds names only."""

    customer_name = serializers.CharField(source="customer.name", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Order
        fields = (
            "id", "customer", "customer_name",
            "product", "product_name", "product_price",
            "status", "note", "date_created",
        )
        read_only_fields = ("id", "date_created", "customer_name", "product_name")


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full nested serializer for create / retrieve / update."""

    customer = CustomerListSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("apps.rental.models", fromlist=["Customer"]).Customer.objects.all(),
        source="customer",
        write_only=True,
    )
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("apps.rental.models", fromlist=["Product"]).Product.objects.all(),
        source="product",
        write_only=True,
    )

    class Meta:
        model = Order
        fields = (
            "id", "customer", "customer_id",
            "product", "product_id",
            "status", "note", "date_created", "updated_at",
        )
        read_only_fields = ("id", "date_created", "updated_at")
