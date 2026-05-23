from rest_framework import serializers
from .models import Chat, Message, Property


# =====================================================
# PROPERTY (NESTED INSIDE CHAT)
# =====================================================
class PropertyMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "city",
            "address",
            "bedrooms",
            "bathrooms",
            "sq_ft",
            "parking",
            "price",
        ]


# =====================================================
# MESSAGE SERIALIZER
# =====================================================
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_type = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "content",
            "sender_user",
            "sender_landlord",
            "sender_name",
            "sender_type",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_sender_name(self, obj):
        if obj.sender_user:
            return obj.sender_user.first_name or obj.sender_user.username
        if obj.sender_landlord:
            return obj.sender_landlord.name
        return "Unknown"

    def get_sender_type(self, obj):
        if obj.sender_user:
            return "user"
        if obj.sender_landlord:
            return "landlord"
        return "unknown"


# =====================================================
# CHAT SERIALIZER (FIXED)
# =====================================================
class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    user_name = serializers.CharField(source="user.first_name", read_only=True)
    landlord_name = serializers.CharField(source="landlord.name", read_only=True)

    # ✅ FIX: full property object instead of just title
    property = PropertyMiniSerializer(read_only=True)

    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "user",
            "user_name",
            "landlord",
            "landlord_name",
            "property",
            "subject",
            "is_active",
            "messages",
            "last_message",
            "unread_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False).count()


# =====================================================
# CHAT CREATE SERIALIZER
# =====================================================
class ChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["landlord", "property", "subject"]


# =====================================================
# MESSAGE CREATE SERIALIZER
# =====================================================
class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["content"]