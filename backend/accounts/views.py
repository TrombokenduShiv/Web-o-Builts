from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
import random
import logging
import os

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserRegistrationSerializer, UserProfileSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


# ─── Custom Throttles ───
class AuthRateThrottle(AnonRateThrottle):
    rate = '10/minute'

class OTPRateThrottle(AnonRateThrottle):
    rate = '5/minute'

class RegisterRateThrottle(AnonRateThrottle):
    rate = '5/hour'


# ─── Registration ───
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [RegisterRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)

        # Sync to Google Sheets (non-blocking)
        try:
            from webcraft_sutra.sheets_sync import sync_row_to_sheet
            sync_row_to_sheet('Users', {
                'id': user.id,
                'email': user.email,
                'business_name': user.business_name,
                'industry': user.industry,
                'phone_number': user.phone_number,
                'registered_at': str(user.date_joined),
                'source': 'Email Registration',
            }, user.id)
        except Exception as e:
            logger.warning(f"Sheets sync failed for user {user.email}: {e}")

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'business_name': user.business_name,
                'industry': user.industry,
                'phone_number': user.phone_number,
                'package_tier': user.package_tier,
                'status': user.status,
            }
        }, status=status.HTTP_201_CREATED)


# ─── Profile ───
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


# ─── Google OAuth (server-side flow via allauth) ───
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = os.environ.get('GOOGLE_OAUTH_CALLBACK_URL', 'http://localhost:5173')
    client_class = OAuth2Client


# ─── Google ID Token Login (frontend sends Google ID token) ───
class GoogleTokenLoginView(views.APIView):
    """
    Accept a Google ID token from the frontend (obtained via Google Identity Services),
    validate it, create or get the user, sync to sheets, and return JWT tokens.
    """
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        credential = request.data.get('credential')  # The Google ID token
        if not credential:
            return Response(
                {'error': 'Google credential is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            client_id = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '')
            if not client_id:
                return Response(
                    {'error': 'Google OAuth is not configured on the server'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )

            # Extract user info
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')

            if not email:
                return Response(
                    {'error': 'Email not found in Google token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split(' ')[0] if name else '',
                    'last_name': ' '.join(name.split(' ')[1:]) if name else '',
                }
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Sync to Google Sheets if new user
            if created:
                try:
                    from webcraft_sutra.sheets_sync import sync_row_to_sheet
                    sync_row_to_sheet('Users', {
                        'id': user.id,
                        'email': user.email,
                        'business_name': user.business_name,
                        'name': name,
                        'registered_at': str(user.date_joined),
                        'source': 'Google OAuth',
                    }, user.id)
                except Exception as e:
                    logger.warning(f"Sheets sync failed for Google user {email}: {e}")

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'business_name': user.business_name,
                    'industry': user.industry,
                    'phone_number': user.phone_number,
                    'package_tier': user.package_tier,
                    'status': user.status,
                    'is_new': created,
                }
            })

        except ValueError as e:
            logger.warning(f"Invalid Google token: {e}")
            return Response(
                {'error': 'Invalid Google credential'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Google token login error: {e}")
            return Response(
                {'error': 'Authentication failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─── OTP Generation (sends real email) ───
class GenerateOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [OTPRateThrottle]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp = str(random.randint(100000, 999999))
        # Store OTP in cache for 5 minutes
        cache.set(f'otp_{email}', otp, 300)

        # Send OTP via email
        try:
            send_mail(
                subject='Your Web-o-Builts Verification Code',
                message=(
                    f'Hi there!\n\n'
                    f'Your one-time verification code is: {otp}\n\n'
                    f'This code expires in 5 minutes. Do not share it with anyone.\n\n'
                    f'— Web-o-Builts Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info(f"OTP sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send OTP to {email}: {e}")
            # In development, log it to console as fallback
            if settings.DEBUG:
                logger.info(f"[DEV] OTP for {email}: {otp}")
            else:
                return Response(
                    {'error': 'Failed to send OTP. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response({'message': 'OTP sent successfully. Check your email.'})


# ─── OTP Verification ───
class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cached_otp = cache.get(f'otp_{email}')
        if cached_otp and cached_otp == otp:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email.split('@')[0]}
            )
            refresh = RefreshToken.for_user(user)

            # Clear OTP (single-use)
            cache.delete(f'otp_{email}')

            # Sync new user to sheets
            if created:
                try:
                    from webcraft_sutra.sheets_sync import sync_row_to_sheet
                    sync_row_to_sheet('Users', {
                        'id': user.id,
                        'email': user.email,
                        'registered_at': str(user.date_joined),
                        'source': 'OTP Login',
                    }, user.id)
                except Exception as e:
                    logger.warning(f"Sheets sync failed for OTP user {email}: {e}")

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'business_name': user.business_name,
                    'industry': user.industry,
                    'phone_number': user.phone_number,
                    'package_tier': user.package_tier,
                    'status': user.status,
                    'is_new': created,
                }
            })

        return Response(
            {'error': 'Invalid or expired OTP'},
            status=status.HTTP_400_BAD_REQUEST
        )
