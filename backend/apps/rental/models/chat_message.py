"""
ChatMessage model.
Represents a direct message exchanged between users about a product.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class ChatMessage(models.Model):
    """A single chat message in a product-specific conversation thread."""

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_chat_messages",
        verbose_name=_("sender"),
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_chat_messages",
        verbose_name=_("recipient"),
    )
    product = models.ForeignKey(
        "rental.Product",
        on_delete=models.CASCADE,
        related_name="chat_messages",
        verbose_name=_("product"),
    )
    text = models.TextField(_("message text"))
    is_read = models.BooleanField(_("is read"), default=False)
    created_at = models.DateTimeField(_("created at"), auto_now_add=True)

    class Meta:
        db_table = "rental_chat_message"
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Msg from {self.sender.email} to {self.recipient.email} re: {self.product.name}"
