from .dashboard import DashboardStatsView
from .customer import CustomerListCreateView, CustomerRetrieveUpdateDestroyView, CustomerOrdersView
from .product import ProductListCreateView, ProductRetrieveUpdateDestroyView, ProductApproveRejectView
from .order import OrderListCreateView, OrderRetrieveUpdateDestroyView
from .student import (
    StudentProductListView,
    StudentProductDetailView,
    StudentRentView,
    StudentMyOrdersView,
    StudentMyProductsView,
)
from .chat import ChatConversationsView, ChatMessagesView

__all__ = [
    "DashboardStatsView",
    "CustomerListCreateView",
    "CustomerRetrieveUpdateDestroyView",
    "CustomerOrdersView",
    "ProductListCreateView",
    "ProductRetrieveUpdateDestroyView",
    "ProductApproveRejectView",
    "OrderListCreateView",
    "OrderRetrieveUpdateDestroyView",
    "StudentProductListView",
    "StudentProductDetailView",
    "StudentRentView",
    "StudentMyOrdersView",
    "StudentMyProductsView",
    "ChatConversationsView",
    "ChatMessagesView",
]

