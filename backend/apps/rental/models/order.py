"""
Order model.
Represents a rental order linking a customer to a product.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _

from .customer import Customer
from .product import Product


class Order(models.Model):
    """A rental order placed by a customer for a product."""

    class Status(models.TextChoices):
        PENDING = "Pending", _("Pending")
        OUT_FOR_DELIVERY = "Out for delivery", _("Out for delivery")
        DELIVERED = "Delivered", _("Delivered")

    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
        verbose_name=_("customer"),
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
        verbose_name=_("product"),
    )
    status = models.CharField(
        _("status"),
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    note = models.TextField(_("note"), blank=True, default="")
    date_created = models.DateTimeField(_("date created"), auto_now_add=True)
    updated_at = models.DateTimeField(_("last updated"), auto_now=True)

    class Meta:
        db_table = "rental_order"
        ordering = ["-date_created"]
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")

    def __str__(self) -> str:
        product_name = self.product.name if self.product else "N/A"
        customer_name = self.customer.name if self.customer else "N/A"
        return f"Order #{self.pk} — {product_name} for {customer_name}"
