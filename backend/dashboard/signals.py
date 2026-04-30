from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import CallBooking, PaymentTransaction
from webcraft_sutra.sheets_sync import sync_row_to_sheet
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=CallBooking)
def sync_call_booking_to_sheets(sender, instance, created, **kwargs):
    try:
        row_data = {
            'id': instance.id,
            'user': instance.user.email,
            'call_type': instance.call_type,
            'scheduled_time': str(instance.scheduled_time),
            'status': instance.status,
        }
        sync_row_to_sheet('CallBookings', row_data, instance.id)
    except Exception as e:
        logger.warning(f"Sheets sync failed for CallBooking {instance.id}: {e}")


@receiver(post_save, sender=PaymentTransaction)
def sync_payment_to_sheets(sender, instance, created, **kwargs):
    try:
        row_data = {
            'id': instance.id,
            'user': instance.user.email,
            'amount': str(instance.amount),
            'purpose': instance.purpose,
            'status': instance.status,
        }
        sync_row_to_sheet('Payments', row_data, instance.id)
    except Exception as e:
        logger.warning(f"Sheets sync failed for Payment {instance.id}: {e}")
