from django.contrib import admin
from .models import CallBooking, Agreement, PaymentTransaction, SEOAnalytics, TrafficData, KeywordPerformance, MaintenanceLog

admin.site.register(CallBooking)
admin.site.register(Agreement)
admin.site.register(PaymentTransaction)
admin.site.register(SEOAnalytics)
admin.site.register(TrafficData)
admin.site.register(KeywordPerformance)
admin.site.register(MaintenanceLog)
