"""
Product views.
"""

from rest_framework import generics, permissions

from apps.rental.models import Product
from apps.rental.serializers import ProductListSerializer, ProductDetailSerializer
from apps.rental.filters import ProductFilter


class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/products/   → paginated product list
    POST /api/v1/products/   → create product
    """

    permission_classes = (permissions.IsAuthenticated,)
    queryset = Product.objects.prefetch_related("tags").order_by("-date_created")
    filterset_class = ProductFilter
    search_fields = ("name", "description", "tags__name")
    ordering_fields = ("name", "price", "date_created")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProductDetailSerializer
        return ProductListSerializer

    def perform_create(self, serializer):
        from apps.rental.models import Customer
        import traceback
        import sys
        try:
            customer = self.request.user.customer_profile
            print(f"[DEBUG] perform_create: user has customer profile: {customer}", file=sys.stderr)
            serializer.save(posted_by=customer)
        except (AttributeError, Customer.DoesNotExist) as e:
            print(f"[DEBUG] perform_create: user has NO customer profile. Exception: {e}", file=sys.stderr)
            try:
                serializer.save()
            except Exception as save_err:
                print(f"[DEBUG] Error during serializer.save() without profile: {save_err}", file=sys.stderr)
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
