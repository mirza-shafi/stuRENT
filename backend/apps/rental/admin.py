"""
Rental app admin configuration.
"""

from django.contrib import admin
from apps.rental.models import Customer, Product, Tag, Order


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "date_created")
    search_fields = ("name", "email")
    ordering = ("-date_created",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_available", "date_created")
    list_filter = ("category", "is_available")
    search_fields = ("name", "description")
    filter_horizontal = ("tags",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("__str__", "status", "customer", "product", "date_created")
    list_filter = ("status",)
    search_fields = ("customer__name", "product__name", "note")
    ordering = ("-date_created",)
