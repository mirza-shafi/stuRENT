"""
Root URL configuration for stuRENT API.
All routes are prefixed with /api/ to cleanly separate from the React SPA.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("apps.accounts.urls", namespace="accounts")),
    path("api/v1/", include("apps.rental.urls", namespace="rental")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
