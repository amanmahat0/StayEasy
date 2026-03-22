from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, KYC, Property, PropertyImage


# =====================================================
# REGISTER SERIALIZER
# =====================================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True)

    # stored in Profile (not User)
    user_type = serializers.ChoiceField(
        choices=Profile.USER_TYPES,
        write_only=True
    )

    # returned from Profile
    user_type_display = serializers.CharField(
        source="profile.user_type",
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
            "user_type",
            "user_type_display",
        ]

    # ---------------- VALIDATION ----------------
    def validate(self, attrs):
        email = attrs.get("email")

        # ⭐ FIX 1 — prevent duplicate email (case insensitive)
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({
                "email": "An account with this email already exists."
            })

        # ⭐ FIX 2 — password match check
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })

        return attrs

    # ---------------- CREATE USER ----------------
    def create(self, validated_data):
        validated_data.pop("password2")

        user_type = validated_data.pop("user_type")
        password = validated_data.pop("password")

        # ⭐ extra safety check (prevents race condition)
        email = validated_data["email"]
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({
                "email": "Email already registered."
            })

        user = User.objects.create(
            username=validated_data["username"],
            email=email,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        user.set_password(password)
        user.save()

        # create profile
        Profile.objects.create(
            user=user,
            user_type=user_type
        )

        return user


# =====================================================
# VERIFY EMAIL SERIALIZER
# =====================================================
class VerifyEmailSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


# =====================================================
# KYC SERIALIZERS
# =====================================================
class KYCSerializer(serializers.ModelSerializer):

    class Meta:
        model = KYC
        fields = [
            "full_name",
            "phone_number",
            "citizenship_number",
            "document_image",
            "status",
            "submitted_at",
        ]
        read_only_fields = ["status", "submitted_at"]


class KYCStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = KYC
        fields = ["status", "submitted_at"]


# =====================================================
# PROPERTY IMAGE SERIALIZER
# =====================================================
class PropertyImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = PropertyImage
        fields = ["id", "image"]


# =====================================================
# PROPERTY CREATE SERIALIZER
# =====================================================
class PropertyCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Property
        exclude = ["owner", "created_at"]

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        user = self.context["request"].user

        property_instance = Property.objects.create(
            owner=user,
            **validated_data
        )

        for image in images:
            PropertyImage.objects.create(
                property=property_instance,
                image=image
            )

        return property_instance


# =====================================================
# PROPERTY SERIALIZER (READ)
# =====================================================
class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = "__all__"
        read_only_fields = ["owner", "created_at"]