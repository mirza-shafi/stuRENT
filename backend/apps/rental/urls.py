"""
Rental app URL configuration.
"""

from django.urls import path
from apps.rental import views

app_name = "rental"

urlpatterns = [
    # ── Admin / Dashboard ─────────────────────────────────────
    path("dashboard/", views.DashboardStatsView.as_view(), name="dashboard"),

    # ── Admin: Customers ──────────────────────────────────────
    path("customers/", views.CustomerListCreateView.as_view(), name="customer-list"),
    path("customers/<int:pk>/", views.CustomerRetrieveUpdateDestroyView.as_view(), name="customer-detail"),
    path("customers/<int:pk>/orders/", views.CustomerOrdersView.as_view(), name="customer-orders"),

    # ── Admin: Products ───────────────────────────────────────
    path("products/", views.ProductListCreateView.as_view(), name="product-list"),
    path("products/<int:pk>/", views.ProductRetrieveUpdateDestroyView.as_view(), name="product-detail"),

    # ── Admin: Orders ─────────────────────────────────────────
    path("orders/", views.OrderListCreateView.as_view(), name="order-list"),
    path("orders/<int:pk>/", views.OrderRetrieveUpdateDestroyView.as_view(), name="order-detail"),

    # ── Student-facing (public catalog + personal orders) ─────
    path("student/products/", views.StudentProductListView.as_view(), name="student-product-list"),
    path("student/products/<int:pk>/", views.StudentProductDetailView.as_view(), name="student-product-detail"),
    path("student/rent/", views.StudentRentView.as_view(), name="student-rent"),
    path("student/my-orders/", views.StudentMyOrdersView.as_view(), name="student-my-orders"),
]

