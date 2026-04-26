from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.conf import settings
import razorpay
from .models import CallBooking, Agreement, PaymentTransaction, SEOAnalytics, TrafficData, KeywordPerformance, MaintenanceLog
from .serializers import (
    CallBookingSerializer, AgreementSerializer, PaymentTransactionSerializer,
    SEOAnalyticsSerializer, TrafficDataSerializer, KeywordPerformanceSerializer, MaintenanceLogSerializer
)

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

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

class CreateRazorpayOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        amount = int(request.data.get('amount', 0))
        purpose = request.data.get('purpose')
        
        if not amount or not purpose:
            return Response({'error': 'Amount and purpose required'}, status=status.HTTP_400_BAD_REQUEST)
            
        payment_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': f'receipt_{request.user.id}_{timezone.now().timestamp()}'
        }
        
        try:
            order = razorpay_client.order.create(data=payment_data)
            PaymentTransaction.objects.create(
                user=request.user,
                amount=amount/100, # Assuming amount is in paise
                purpose=purpose,
                razorpay_order_id=order['id'],
                status='Pending'
            )
            return Response({'order_id': order['id'], 'amount': amount, 'currency': 'INR'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyRazorpayPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            transaction = PaymentTransaction.objects.get(razorpay_order_id=razorpay_order_id)
            transaction.razorpay_payment_id = razorpay_payment_id
            transaction.razorpay_signature = razorpay_signature
            transaction.status = 'Success'
            transaction.save()
            
            # Logic to unlock features based on transaction.purpose
            
            return Response({'status': 'Payment verified successfully'})
        except Exception as e:
            # If verification fails
            try:
                transaction = PaymentTransaction.objects.get(razorpay_order_id=razorpay_order_id)
                transaction.status = 'Failed'
                transaction.save()
            except PaymentTransaction.DoesNotExist:
                pass
            return Response({'error': 'Signature verification failed'}, status=status.HTTP_400_BAD_REQUEST)

class GoogleSheetWebhookView(views.APIView):
    permission_classes = [permissions.AllowAny] # Ideally secure with a secret token

    def post(self, request, *args, **kwargs):
        # We expect JSON like: {"sheet": "CallBookings", "id": 1, "updates": {"status": "Completed"}}
        data = request.data
        sheet = data.get('sheet')
        record_id = data.get('id')
        updates = data.get('updates', {})
        
        if not sheet or not record_id:
            return Response({'error': 'Missing sheet or id'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            if sheet == 'CallBookings':
                booking = CallBooking.objects.get(id=record_id)
                if 'status' in updates:
                    booking.status = updates['status']
                booking.save()
            elif sheet == 'Payments':
                payment = PaymentTransaction.objects.get(id=record_id)
                if 'status' in updates:
                    payment.status = updates['status']
                payment.save()
            else:
                return Response({'error': 'Unknown sheet'}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({'status': 'Sync successful'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
