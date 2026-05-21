"""
Product serializers.
"""

from rest_framework import serializers
from apps.rental.models import Product, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name")


class PostedBySerializer(serializers.Serializer):
    """Nested mini-serializer for the customer who posted the product."""
    id    = serializers.IntegerField()
    name  = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()


class ProductListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views — includes poster info."""

    tags      = TagSerializer(many=True, read_only=True)
    posted_by = PostedBySerializer(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "price", "buy_price", "category", "listing_type",
            "description", "image", "is_available", "posted_by", "tags", "date_created",
        )
        read_only_fields = ("id", "date_created")


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full serializer with description, tags, and poster info."""

    tags = TagSerializer(many=True, read_only=True)
    posted_by = PostedBySerializer(read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        source="tags",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("id", "date_created", "updated_at")
