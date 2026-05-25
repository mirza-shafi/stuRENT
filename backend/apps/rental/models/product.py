"""
Product model.
Represents a rental item available in the stuRENT system.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    """Searchable tag applied to products."""

    name = models.CharField(_("tag name"), max_length=100, unique=True)

    class Meta:
        db_table = "rental_tag"
        ordering = ["name"]
        verbose_name = _("Tag")
        verbose_name_plural = _("Tags")

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    """An item available for rent."""

    class Category(models.TextChoices):
        INDOOR  = "Indoor",  _("Indoor")
        OUTDOOR = "Outdoor", _("Outdoor")
        HOUSING = "Housing", _("Housing")

    class ListingType(models.TextChoices):
        RENT = "Rent", _("Rent Only")
        BUY  = "Buy",  _("Buy Only")
        BOTH = "Both", _("Rent & Buy")

    name         = models.CharField(_("product name"),  max_length=200)
    price        = models.DecimalField(_("price per day"), max_digits=10, decimal_places=2)
    buy_price    = models.DecimalField(_("buy price"), max_digits=10, decimal_places=2, null=True, blank=True)
    category     = models.CharField(_("category"), max_length=20, choices=Category.choices, db_index=True)
    listing_type = models.CharField(_("listing type"), max_length=4, choices=ListingType.choices, default=ListingType.RENT)
    description  = models.TextField(_("description"), blank=True, default="")
    image        = models.ImageField(_("product image"), upload_to="products/", null=True, blank=True)
    posted_by    = models.ForeignKey(
        "rental.Customer",
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="posted_products",
        verbose_name=_("posted by"),
    )
    tags         = models.ManyToManyField(Tag, blank=True, related_name="products")
    is_available = models.BooleanField(_("available for rent"), default=True)
    date_created = models.DateTimeField(_("date created"), auto_now_add=True)
    updated_at   = models.DateTimeField(_("last updated"), auto_now=True)

    class Meta:
        db_table = "rental_product"
        ordering = ["-date_created"]
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def __str__(self) -> str:
        return f"{self.name} (${self.price}/day)"
