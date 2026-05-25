"""
Product views.
"""

import sys
import traceback
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.rental.models import Product
from apps.rental.serializers import ProductListSerializer, ProductDetailSerializer
from apps.rental.filters import ProductFilter


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/   → paginated product list (all statuses — admin only)
    POST /api/v1/products/   → create product
    """

    permission_classes = (permissions.IsAuthenticated,)
    queryset = Product.objects.prefetch_related("tags").order_by("-date_created")
    filterset_class = ProductFilter
    search_fields = ("name", "description", "tags__name")
    ordering_fields = ("name", "price", "date_created")

    def get_queryset(self):
        qs = Product.objects.prefetch_related("tags").order_by("-date_created")
        # Admin sees all; students only see their own pending + approved
        if self.request.user.is_staff:
            approval_filter = self.request.query_params.get("approval_status")
            if approval_filter:
                qs = qs.filter(approval_status=approval_filter)
        else:
            qs = qs.filter(approval_status=Product.ApprovalStatus.APPROVED)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductDetailSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        from apps.rental.models import Customer
        try:
            # Admin-added products are auto-approved
            if self.request.user.is_staff:
                serializer.save(approval_status=Product.ApprovalStatus.APPROVED)
            else:
                customer = self.request.user.customer_profile
                serializer.save(
                    posted_by=customer,
                    approval_status=Product.ApprovalStatus.PENDING
                )
        except (AttributeError, Customer.DoesNotExist) as e:
            print(f"[DEBUG] perform_create: user has NO customer profile. Exception: {e}", file=sys.stderr)
            try:
                serializer.save(approval_status=Product.ApprovalStatus.PENDING)
            except Exception as save_err:
                print(f"[DEBUG] Error during serializer.save(): {save_err}", file=sys.stderr)
                traceback.print_exc(file=sys.stderr)
                raise
        except Exception as e:
            print(f"[DEBUG] Unexpected error in perform_create: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            raise


class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/products/<pk>/
    PUT    /api/v1/products/<pk>/
    PATCH  /api/v1/products/<pk>/
    DELETE /api/v1/products/<pk>/
    """

    permission_classes = (permissions.IsAuthenticated,)
    queryset = Product.objects.prefetch_related("tags")
    serializer_class = ProductDetailSerializer


class ProductApproveRejectView(APIView):
    """
    POST /api/v1/products/<pk>/approve/  → approve a pending product
    POST /api/v1/products/<pk>/reject/   → reject a pending product
    Admin only.
    """
    permission_classes = (permissions.IsAuthenticated, IsAdmin)

    def post(self, request, pk, action):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        if action == "approve":
            product.approval_status = Product.ApprovalStatus.APPROVED
            product.save()
            return Response({
                "message": f'Product "{product.name}" approved and is now live.',
                "approval_status": product.approval_status,
            })
        elif action == "reject":
            product.approval_status = Product.ApprovalStatus.REJECTED
            product.save()
            return Response({
                "message": f'Product "{product.name}" has been rejected.',
                "approval_status": product.approval_status,
            })
        else:
            return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
