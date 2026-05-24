"""Accounts URL configuration."""

from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/",     views.RegisterView.as_view(),            name="register"),
    path("login/",        views.LoginView.as_view(),               name="login"),
    path("admin-login/",  views.AdminLoginView.as_view(),          name="admin-login"),
    path("token/refresh/",views.TokenRefreshView.as_view(),        name="token_refresh"),
    path("logout/",       views.LogoutView.as_view(),              name="logout"),
    path("me/",           views.CurrentUserView.as_view(),         name="me"),

    # Admin approval workflow
    path("admin-request/",                      views.AdminRequestView.as_view(),       name="admin-request"),
    path("admin-request/<int:pk>/<str:action>/",views.AdminRequestActionView.as_view(), name="admin-request-action"),
]
