"""
AdminRequest model — tracks pending admin registration requests.
"""
from django.db import models
from django.contrib.auth.models import User


class AdminRequest(models.Model):
    class Status(models.TextChoices):
        PENDING  = 'pending',  'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    user        = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_request')
    status      = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_requests')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"AdminRequest({self.user.username}, {self.status})"
