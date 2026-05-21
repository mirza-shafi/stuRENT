"""
Customer views.
Thin controllers — delegate business logic to CustomerService.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.rental.models import Customer
from apps.rental.serializers import CustomerListSerializer, CustomerDetailSerializer
from apps.rental.serializers import OrderListSerializer
from apps.rental.services.customer_service import CustomerService
from apps.rental.filters import CustomerFilter


class CustomerListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/customers/   → paginated list with order count
    POST /api/v1/customers/   → create a new customer
    """

    permission_classes = (permissions.IsAuthenticated,)
    filterset_class = CustomerFilter
    search_fields = ("name", "email", "phone")
    ordering_fields = ("name", "date_created")

    def get_queryset(self):
        return CustomerService.get_all_with_order_count()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CustomerDetailSerializer
        return CustomerListSerializer


class CustomerRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/customers/<pk>/  → customer detail + orders
    PUT    /api/v1/customers/<pk>/  → full update
    PATCH  /api/v1/customers/<pk>/  → partial update
    DELETE /api/v1/customers/<pk>/  → delete
    """

    permission_classes = (permissions.IsAuthenticated,)
    queryset = Customer.objects.all()
    serializer_class = CustomerDetailSerializer


class CustomerOrdersView(generics.ListAPIView):
    """
    GET /api/v1/customers/<pk>/orders/
    List all orders for a specific customer.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderListSerializer

    def get_queryset(self):
        return CustomerService.get_orders_for_customer(
            customer_id=self.kwargs["pk"]
        )
