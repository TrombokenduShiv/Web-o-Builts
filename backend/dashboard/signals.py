from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CallBooking, PaymentTransaction
from webcraft_sutra.sheets_sync import sync_row_to_sheet

@receiver(post_save, sender=CallBooking)
def sync_call_booking_to_sheets(sender, instance, created, **kwargs):
    row_data = {
        'id': instance.id,
        'user': instance.user.email,
        'call_type': instance.call_type,
        'scheduled_time': str(instance.scheduled_time),
        'status': instance.status,
    }
    sync_row_to_sheet('CallBookings', row_data, instance.id)

@receiver(post_save, sender=PaymentTransaction)
def sync_payment_to_sheets(sender, instance, created, **kwargs):
    row_data = {
        'id': instance.id,
        'user': instance.user.email,
        'amount': str(instance.amount),
        'purpose': instance.purpose,
        'status': instance.status,
    }
    sync_row_to_sheet('Payments', row_data, instance.id)
