from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'email', 'source', 'created_at')
    list_filter = ('source', 'created_at')
    search_fields = ('business_name', 'email')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
