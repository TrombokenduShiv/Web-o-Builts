from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import UserRegistrationView, UserProfileView, GoogleLogin, GenerateOTPView, VerifyOTPView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('otp/generate/', GenerateOTPView.as_view(), name='generate_otp'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),
]
