"""
Order service layer.
All order-related business logic lives here — views stay thin.
"""

from django.db.models import QuerySet, Count, Sum
from apps.rental.models import Order, Customer, Product


class OrderService:
    """Encapsulates all business rules for the Order domain."""

    @staticmethod
    def get_dashboard_stats() -> dict:
        """
        Return aggregate statistics for the dashboard.
        Single DB query using annotations.
        """
        total_orders = Order.objects.count()
        total_customers = Customer.objects.count()
        total_products = Product.objects.count()
        
        # Calculate estimated revenue by summing the price of all products in orders
        total_revenue = Order.objects.aggregate(total=Sum('product__price'))['total'] or 0.0
        
        delivered = Order.objects.filter(status=Order.Status.DELIVERED).count()
        pending = Order.objects.filter(status=Order.Status.PENDING).count()
        out_for_delivery = Order.objects.filter(
            status=Order.Status.OUT_FOR_DELIVERY
        ).count()

        return {
            "total_orders": total_orders,
            "total_customers": total_customers,
            "total_products": total_products,
            "total_revenue": float(total_revenue),
            "delivered": delivered,
            "pending": pending,
            "out_for_delivery": out_for_delivery,
        }

    @staticmethod
    def get_orders_for_customer(customer_id: int) -> QuerySet:
        """Return all orders for a specific customer with related data pre-fetched."""
        return (
            Order.objects.filter(customer_id=customer_id)
            .select_related("product", "customer")
            .order_by("-date_created")
        )

    @staticmethod
    def get_recent_orders(limit: int = 10) -> QuerySet:
        """Return the most recent N orders."""
        return (
            Order.objects.select_related("customer", "product")
            .order_by("-date_created")[:limit]
        )
