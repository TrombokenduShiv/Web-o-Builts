from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'username', 'business_name', 'package_tier', 'status', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Business Info', {'fields': ('business_name', 'industry', 'phone_number', 'package_tier', 'status')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
