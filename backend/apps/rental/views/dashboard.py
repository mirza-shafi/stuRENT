"""
Dashboard view.
Returns aggregate stats for the admin dashboard.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.rental.services.order_service import OrderService


class IsAdmin(permissions.BasePermission):
    """Custom permission to check if user is admin (is_staff)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class DashboardStatsView(APIView):
    """
    GET /api/v1/dashboard/
    Returns summary statistics. Requires admin authentication.
    """

    permission_classes = (permissions.IsAuthenticated, IsAdmin)

    def get(self, request):
        try:
            stats = OrderService.get_dashboard_stats()
            recent_orders_qs = OrderService.get_recent_orders(limit=5)

            # Import here to avoid circular imports at module level
            from apps.rental.serializers import OrderListSerializer
            recent = OrderListSerializer(recent_orders_qs, many=True).data

            return Response(
                {"stats": stats, "recent_orders": recent},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": str(e), "stats": {
                    "total_orders": 0,
                    "total_customers": 0,
                    "total_products": 0,
                    "total_revenue": 0,
                    "delivered": 0,
                    "pending": 0,
                    "out_for_delivery": 0,
                }, "recent_orders": []},
                status=status.HTTP_200_OK,
            )
