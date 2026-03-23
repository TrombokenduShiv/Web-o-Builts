from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class CallBooking(models.Model):
    CALL_TYPES = (
        ('1st Free', '1st Free Call'),
        ('2nd Paid', '2nd Paid Strategy Call'),
    )
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='call_bookings')
    call_type = models.CharField(max_length=20, choices=CALL_TYPES)
    scheduled_time = models.DateTimeField()
    discussion_topics = models.TextField(blank=True)
    meeting_link = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.call_type} at {self.scheduled_time}"

class Agreement(models.Model):
    PACKAGE_CHOICES = (
        ('Standard', 'Standard'),
        ('Pro', 'Pro'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agreements')
    package = models.CharField(max_length=20, choices=PACKAGE_CHOICES)
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)
    terms_text = models.TextField()
    is_signed = models.BooleanField(default=False)
    signature_name = models.CharField(max_length=255, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    advance_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agreement for {self.user} - {self.package}"

class PaymentTransaction(models.Model):
    PURPOSE_CHOICES = (
        ('2nd Call', 'Strategy Call Fee'),
        ('30% Advance', 'Project Advance Payment'),
        ('Monthly Sub', 'Monthly Subscription'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    razorpay_order_id = models.CharField(max_length=255, unique=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class SEOAnalytics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seo_analytics')
    month = models.DateField()
    visitors = models.IntegerField(default=0)
    impressions = models.IntegerField(default=0)
    avg_position = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

class TrafficData(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='traffic_data')
    date = models.DateField()
    visitors = models.IntegerField(default=0)

class KeywordPerformance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='keywords')
    keyword = models.CharField(max_length=255)
    position = models.IntegerField()

class MaintenanceLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_logs')
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField()
