from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.cache import cache
import random
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from .serializers import UserRegistrationSerializer, UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173"
    client_class = OAuth2Client

class GenerateOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        # Store OTP in cache for 5 minutes
        cache.set(f'otp_{email}', otp, 300)
        
        # TODO: Integrate Twilio or SendGrid here to send OTP
        print(f"--- MOCK EMAIL --- Sent OTP {otp} to {email}")
        
        return Response({'message': 'OTP sent successfully'})

class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        if not email or not otp:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        cached_otp = cache.get(f'otp_{email}')
        if cached_otp and cached_otp == otp:
            user, created = User.objects.get_or_create(email=email, defaults={'username': email.split('@')[0]})
            refresh = RefreshToken.for_user(user)
            
            # Clear OTP
            cache.delete(f'otp_{email}')
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {'email': user.email, 'is_new': created}
            })
            
        return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
