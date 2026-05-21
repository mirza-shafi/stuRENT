from .dashboard import DashboardStatsView
from .customer import CustomerListCreateView, CustomerRetrieveUpdateDestroyView, CustomerOrdersView
from .product import ProductListCreateView, ProductRetrieveUpdateDestroyView
from .order import OrderListCreateView, OrderRetrieveUpdateDestroyView
from .student import (
    StudentProductListView,
    StudentProductDetailView,
    StudentRentView,
    StudentMyOrdersView,
)

__all__ = [
    "DashboardStatsView",
    "CustomerListCreateView",
    "CustomerRetrieveUpdateDestroyView",
    "CustomerOrdersView",
    "ProductListCreateView",
    "ProductRetrieveUpdateDestroyView",
    "OrderListCreateView",
    "OrderRetrieveUpdateDestroyView",
    "StudentProductListView",
    "StudentProductDetailView",
    "StudentRentView",
    "StudentMyOrdersView",
]
