"""
Rental app filters.
Used by DjangoFilterBackend in views.
"""

import django_filters
from django_filters import DateFilter, CharFilter

from apps.rental.models import Order, Customer, Product


class OrderFilter(django_filters.FilterSet):
    """Filter orders by date range, status, customer, and note."""

    start_date = DateFilter(field_name="date_created", lookup_expr="gte", label="From date")
    end_date = DateFilter(field_name="date_created", lookup_expr="lte", label="To date")
    note = CharFilter(field_name="note", lookup_expr="icontains")
    customer_name = CharFilter(field_name="customer__name", lookup_expr="icontains")

    class Meta:
        model = Order
        fields = ("status", "customer", "product", "start_date", "end_date", "note")


class CustomerFilter(django_filters.FilterSet):
    """Filter customers by name or email."""

    name = CharFilter(lookup_expr="icontains")
    email = CharFilter(lookup_expr="icontains")

    class Meta:
        model = Customer
        fields = ("name", "email")


class ProductFilter(django_filters.FilterSet):
    """Filter products by category, availability, price range."""

    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ("category", "is_available", "min_price", "max_price")
