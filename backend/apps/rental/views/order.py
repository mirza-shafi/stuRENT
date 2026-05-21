"""
Order views.
"""

from rest_framework import generics, permissions

from apps.rental.models import Order
from apps.rental.serializers import OrderListSerializer, OrderDetailSerializer
from apps.rental.filters import OrderFilter


class OrderListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/orders/   → paginated order list
    POST /api/v1/orders/   → create order
    """

    permission_classes = (permissions.IsAuthenticated,)
    filterset_class = OrderFilter
    search_fields = ("customer__name", "product__name", "note")
    ordering_fields = ("date_created", "status")

    def get_queryset(self):
        return (
            Order.objects.select_related("customer", "product")
            .order_by("-date_created")
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrderDetailSerializer
        return OrderListSerializer


class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/orders/<pk>/
    PUT    /api/v1/orders/<pk>/
    PATCH  /api/v1/orders/<pk>/
    DELETE /api/v1/orders/<pk>/
    """

    permission_classes = (permissions.IsAuthenticated,)
    queryset = Order.objects.select_related("customer", "product")
    serializer_class = OrderDetailSerializer
