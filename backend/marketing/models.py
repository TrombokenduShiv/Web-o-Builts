from django.db import models

class Lead(models.Model):
    business_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=100, default='Landing Page Analyzer')

    def __str__(self):
        return self.business_name
