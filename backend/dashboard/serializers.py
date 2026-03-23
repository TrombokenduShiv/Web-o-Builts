from rest_framework import serializers
from .models import CallBooking, Agreement, PaymentTransaction, SEOAnalytics, TrafficData, KeywordPerformance, MaintenanceLog

class CallBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallBooking
        fields = '__all__'
        read_only_fields = ('user', 'is_paid', 'status')

class AgreementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agreement
        fields = '__all__'
        read_only_fields = ('user', 'package', 'agreed_price', 'terms_text', 'signed_at', 'advance_paid')

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = '__all__'
        read_only_fields = ('user', 'status', 'amount', 'purpose')

class SEOAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOAnalytics
        fields = '__all__'

class TrafficDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficData
        fields = '__all__'

class KeywordPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeywordPerformance
        fields = '__all__'

class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLog
        fields = '__all__'
