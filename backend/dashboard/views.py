from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import CallBooking, Agreement, PaymentTransaction, SEOAnalytics, TrafficData, KeywordPerformance, MaintenanceLog
from .serializers import (
    CallBookingSerializer, AgreementSerializer, PaymentTransactionSerializer,
    SEOAnalyticsSerializer, TrafficDataSerializer, KeywordPerformanceSerializer, MaintenanceLogSerializer
)

class CallBookingListCreateView(generics.ListCreateAPIView):
    serializer_class = CallBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CallBooking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CallBookingDetailView(generics.RetrieveAPIView):
    serializer_class = CallBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CallBooking.objects.filter(user=self.request.user)

class AgreementListView(generics.ListAPIView):
    serializer_class = AgreementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Agreement.objects.filter(user=self.request.user)

class AgreementSignView(generics.UpdateAPIView):
    serializer_class = AgreementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Agreement.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        signature_name = request.data.get('signature_name')
        if signature_name:
            instance.signature_name = signature_name
            instance.is_signed = True
            instance.signed_at = timezone.now()
            instance.save()
            return Response(self.get_serializer(instance).data)
        return Response({'error': 'Signature name required'}, status=status.HTTP_400_BAD_REQUEST)

class AnalyticsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if request.user.package_tier != 'Pro':
            raise PermissionDenied("This feature is restricted to Pro Package Users Only.")

        seo_data = SEOAnalytics.objects.filter(user=request.user)
        traffic_data = TrafficData.objects.filter(user=request.user)
        keyword_data = KeywordPerformance.objects.filter(user=request.user)
        maintenance_logs = MaintenanceLog.objects.filter(user=request.user)

        return Response({
            'high_level_metrics': SEOAnalyticsSerializer(seo_data, many=True).data,
            'traffic_growth': TrafficDataSerializer(traffic_data, many=True).data,
            'top_keywords': KeywordPerformanceSerializer(keyword_data, many=True).data,
            'maintenance_log': MaintenanceLogSerializer(maintenance_logs, many=True).data
        })
