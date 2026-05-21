"""
Customer model.
Represents a student renter in the stuRENT system.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class Customer(models.Model):
    """A student customer who places rental orders."""

    # Links this customer profile to a Django auth User (optional — admin-created
    # customers may not have a user account)
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customer_profile",
        verbose_name=_("user account"),
    )

    name = models.CharField(_("full name"), max_length=200)
    phone = models.CharField(_("phone number"), max_length=20, blank=True, default="")
    email = models.EmailField(_("email address"), unique=True)
    date_created = models.DateTimeField(_("date created"), auto_now_add=True)
    updated_at = models.DateTimeField(_("last updated"), auto_now=True)

    class Meta:
        db_table = "rental_customer"
        ordering = ["-date_created"]
        verbose_name = _("Customer")
        verbose_name_plural = _("Customers")

    def __str__(self) -> str:
        return self.name

    @property
    def total_orders(self) -> int:
        """Return the total number of orders placed by this customer."""
        return self.order_set.count()
