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
            "description", "image", "is_available", "approval_status", "posted_by", "tags", "date_created",
            "city", "area", "house_type", "flat_size", "rooms", "bathrooms", "ac_included", "furnished",
        )
        read_only_fields = ("id", "date_created", "approval_status")


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
        read_only_fields = ("id", "date_created", "updated_at", "approval_status")

    def validate(self, attrs):
        listing_type = attrs.get("listing_type", self.instance.listing_type if self.instance else Product.ListingType.RENT)
        price = attrs.get("price", self.instance.price if self.instance else None)
        buy_price = attrs.get("buy_price", self.instance.buy_price if self.instance else None)

        if listing_type == Product.ListingType.BUY:
            attrs["price"] = None
            if not buy_price and "buy_price" not in attrs:
                raise serializers.ValidationError({"buy_price": "Purchase price is required for buy-only listings."})
        elif listing_type == Product.ListingType.RENT:
            attrs["buy_price"] = None
            if price is None and "price" not in attrs:
                raise serializers.ValidationError({"price": "Daily rental price is required for rent-only listings."})
        elif listing_type == Product.ListingType.BOTH:
            if price is None and "price" not in attrs:
                raise serializers.ValidationError({"price": "Daily rental price is required."})
            if not buy_price and "buy_price" not in attrs:
                raise serializers.ValidationError({"buy_price": "Purchase price is required."})

        # Clear housing fields if category is not Housing
        category = attrs.get("category", self.instance.category if self.instance else Product.Category.INDOOR)
        if category != Product.Category.HOUSING:
            attrs["city"] = None
            attrs["area"] = None
            attrs["house_type"] = None
            attrs["flat_size"] = None
            attrs["rooms"] = None
            attrs["bathrooms"] = None
            attrs["ac_included"] = False
            attrs["furnished"] = False

        return attrs
