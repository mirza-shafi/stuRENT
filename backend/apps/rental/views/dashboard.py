"""
Dashboard view.
Returns aggregate stats for the admin dashboard.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.rental.services.order_service import OrderService


class DashboardStatsView(APIView):
    """
    GET /api/v1/dashboard/
    Returns summary statistics. Requires authentication.
    """

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        stats = OrderService.get_dashboard_stats()
        recent_orders_qs = OrderService.get_recent_orders(limit=5)

        # Import here to avoid circular imports at module level
        from apps.rental.serializers import OrderListSerializer
        recent = OrderListSerializer(recent_orders_qs, many=True).data

        return Response(
            {"stats": stats, "recent_orders": recent},
            status=status.HTTP_200_OK,
        )
