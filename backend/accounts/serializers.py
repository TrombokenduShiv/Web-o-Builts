from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'username', 'business_name', 'industry', 'phone_number')
        extra_kwargs = {
            'username': {'required': False} # Can be generated or optional if email is main
        }

    def create(self, validated_data):
        # Generate username from email if not provided
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email'].split('@')[0]
            
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
        fields = ('id', 'email', 'business_name', 'industry', 'phone_number', 'package_tier', 'status')
        read_only_fields = ('email', 'package_tier', 'status') # User shouldn't change these directly via profile update
