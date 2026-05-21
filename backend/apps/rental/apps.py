"""
Rental app configuration.
Core business domain: customers, products, orders.
"""

from django.apps import AppConfig


class RentalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.rental"
    label = "rental"
    verbose_name = "Rental"
