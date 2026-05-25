"""
Student-facing views.
These endpoints are for logged-in students (not admins).
They browse products and manage their own orders only.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rental.models import Product, Order, Customer
from apps.rental.serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
)
from apps.rental.filters import ProductFilter


class StudentProductListView(generics.ListAPIView):
    """
    GET /api/v1/student/products/
    Browse available rental products. Authentication optional — public catalog.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductListSerializer
    filterset_class = ProductFilter
    search_fields = ("name", "description", "tags__name")
    ordering_fields = ("name", "price", "date_created")

    def get_queryset(self):
        return (
            Product.objects.filter(
                is_available=True,
                approval_status=Product.ApprovalStatus.APPROVED,
            )
            .prefetch_related("tags")
            .order_by("-date_created")
        )



class StudentProductDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/student/products/<pk>/
    View full product details. Public.
    """

    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.prefetch_related("tags")


class StudentRentView(APIView):
    """
    POST /api/v1/student/rent/
    Student places a rental order for themselves.
    Requires authentication — uses logged-in user's customer profile.
    Body: { product_id, note }
    """

    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Get the customer profile linked to this user
        try:
            customer = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {"error": "No customer profile found. Please contact support."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_id = request.data.get("product_id")
        note = request.data.get("note", "")

        if not product_id:
            return Response(
                {"error": "product_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(pk=product_id, is_available=True)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found or currently unavailable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        order = Order.objects.create(
            customer=customer,
            product=product,
            status=Order.Status.PENDING,
            note=note,
        )

        serializer = OrderListSerializer(order)
        return Response(
            {"message": "Rental order placed successfully!", "order": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class StudentMyOrdersView(generics.ListAPIView):
    """
    GET /api/v1/student/my-orders/
    Returns only the logged-in student's own orders.
    """

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = OrderListSerializer

    def get_queryset(self):
        try:
            customer = self.request.user.customer_profile
            return (
                Order.objects.filter(customer=customer)
                .select_related("product", "customer")
                .order_by("-date_created")
            )
        except Customer.DoesNotExist:
            return Order.objects.none()
