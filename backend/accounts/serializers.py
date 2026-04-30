from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'username',
            'business_name', 'industry', 'phone_number'
        )
        extra_kwargs = {
            'username': {'required': False},
            'business_name': {'required': False},
            'industry': {'required': False},
            'phone_number': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower().strip()

    def create(self, validated_data):
        # Generate username from email if not provided
        if 'username' not in validated_data or not validated_data['username']:
            base_username = validated_data['email'].split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            validated_data['username'] = username

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            business_name=validated_data.get('business_name', ''),
            industry=validated_data.get('industry', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'business_name', 'industry', 'phone_number',
            'package_tier', 'status'
        )
        read_only_fields = ('email', 'package_tier', 'status')
