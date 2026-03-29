from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Profile, KYC, Property, PropertyImage, Booking


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


class KYCListSerializer(serializers.ModelSerializer):
    """Serializer for admin to view all KYC requests with user info"""
    user_info = serializers.SerializerMethodField()
    verified_by_info = serializers.SerializerMethodField()

    class Meta:
        model = KYC
        fields = [
            "id",
            "user_info",
            "full_name",
            "phone_number",
            "citizenship_number",
            "document_image",
            "status",
            "submitted_at",
            "verified_by_info",
            "verified_at",
        ]
        read_only_fields = ["submitted_at", "verified_at", "verified_by_info"]

    def get_user_info(self, obj):
        """Return user details"""
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "user_type": obj.user.profile.user_type,
        }

    def get_verified_by_info(self, obj):
        """Return admin who verified this KYC"""
        if obj.verified_by:
            return {
                "id": obj.verified_by.id,
                "username": obj.verified_by.username,
                "email": obj.verified_by.email,
            }
        return None


class KYCUpdateStatusSerializer(serializers.ModelSerializer):
    """Serializer for admin to update KYC status"""

    class Meta:
        model = KYC
        fields = ["status"]

    def validate_status(self, value):
        """Validate status is one of the allowed choices"""
        if value not in ['pending', 'approved', 'rejected']:
            raise serializers.ValidationError("Invalid status. Must be 'pending', 'approved', or 'rejected'")
        return value


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

        property_instance = Property.objects.create(
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


# =====================================================
# BOOKING SERIALIZERS
# =====================================================
class BookingSerializer(serializers.ModelSerializer):
    """Basic booking serializer for create/update"""
    
    class Meta:
        model = Booking
        fields = ["id", "property", "check_in", "check_out", "total_price", "status"]
        read_only_fields = ["id", "status"]


class BookingDetailSerializer(serializers.ModelSerializer):
    """Detailed booking serializer with property and user info"""
    property_info = serializers.SerializerMethodField()
    user_info = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "user_info",
            "property_info",
            "check_in",
            "check_out",
            "total_price",
            "status",
            "created_at",
            "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_property_info(self, obj):
        """Return property details"""
        return {
            "id": obj.property.id,
            "title": obj.property.title,
            "address": obj.property.address,
            "city": obj.property.city,
            "price": obj.property.price,
            "property_type": obj.property.property_type,
        }

    def get_user_info(self, obj):
        """Return user (tenant) details"""
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
        }


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""

    class Meta:
        model = Booking
        fields = ["property", "check_in", "check_out", "total_price"]

    def validate(self, attrs):
        """Validate booking dates"""
        if attrs["check_in"] >= attrs["check_out"]:
            raise serializers.ValidationError("Check-out date must be after check-in date")
        return attrs