"""
Serializers package — single import point.
"""

from .customer_serializer import CustomerListSerializer, CustomerDetailSerializer
from .product_serializer import ProductListSerializer, ProductDetailSerializer, TagSerializer
from .order_serializer import OrderListSerializer, OrderDetailSerializer

__all__ = [
    "CustomerListSerializer",
    "CustomerDetailSerializer",
    "ProductListSerializer",
    "ProductDetailSerializer",
    "TagSerializer",
    "OrderListSerializer",
    "OrderDetailSerializer",
]
