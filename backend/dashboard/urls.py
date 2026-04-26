from django.urls import path
from .views import (
    CallBookingListCreateView, CallBookingDetailView,
    AgreementListView, AgreementSignView,
    AnalyticsView, CreateRazorpayOrderView, VerifyRazorpayPaymentView,
    GoogleSheetWebhookView
)

urlpatterns = [
    path('calls/', CallBookingListCreateView.as_view(), name='call-list-create'),
    path('calls/<int:pk>/', CallBookingDetailView.as_view(), name='call-detail'),
    path('agreements/', AgreementListView.as_view(), name='agreement-list'),
    path('agreements/<int:pk>/sign/', AgreementSignView.as_view(), name='agreement-sign'),
    path('analytics/', AnalyticsView.as_view(), name='analytics-view'),
    path('payments/create-order/', CreateRazorpayOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', VerifyRazorpayPaymentView.as_view(), name='payment-verify'),
    path('webhooks/google-sheet-sync/', GoogleSheetWebhookView.as_view(), name='webhook-sheet-sync'),
]
