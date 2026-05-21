"""
Customer service layer.
All customer-related business logic.
"""

from django.db.models import QuerySet, Count, Prefetch
from apps.rental.models import Customer, Order


class CustomerService:
    """Encapsulates all business rules for the Customer domain."""

    @staticmethod
    def get_all_with_order_count() -> QuerySet:
        """Return all customers annotated with their order count."""
        return Customer.objects.annotate(
            order_count=Count("orders")
        ).order_by("-date_created")

    @staticmethod
    def get_with_orders(customer_id: int) -> Customer:
        """Return a single customer with their orders pre-fetched."""
        return (
            Customer.objects.prefetch_related(
                Prefetch(
                    "orders",
                    queryset=Order.objects.select_related("product").order_by("-date_created"),
                )
            )
            .get(pk=customer_id)
        )
