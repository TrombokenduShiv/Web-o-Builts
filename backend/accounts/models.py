from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    PACKAGE_TIERS = (
        ('None', 'None'),
        ('Standard', 'Standard'),
        ('Pro', 'Pro'),
    )

    STATUS_CHOICES = (
        ('Awaiting 1st Call', 'Awaiting 1st Call'),
        ('Contract Pending', 'Contract Pending'),
        ('Website Live', 'Website Live'),
    )

    business_name = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    package_tier = models.CharField(max_length=20, choices=PACKAGE_TIERS, default='None')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Awaiting 1st Call')

    # Fix email to be unique for authentication
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'business_name']

    def __str__(self):
        return self.email
