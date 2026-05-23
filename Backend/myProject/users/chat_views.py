from rest_framework import generics, permissions, status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Chat, Message, Property, LandlordUser
from .chat_serializers import ChatSerializer, ChatCreateSerializer, MessageSerializer, MessageCreateSerializer


# =====================================================
# CHAT VIEWS
# =====================================================

class UserChatListView(generics.ListAPIView):
    """
    Get all chats for the current user.
    User can see all their conversations with landlords.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by('-updated_at')


class LandlordChatListView(generics.ListAPIView):
    """
    Get all chats for the current landlord.
    Landlord can see all their conversations with users.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        landlord_id = self.request.auth.payload.get('landlord_id')
        if not landlord_id:
            return Chat.objects.none()
        return Chat.objects.filter(landlord_id=landlord_id).order_by('-updated_at')


class ChatDetailView(generics.RetrieveAPIView):
    """
    Get a specific chat with all its messages.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        landlord_id = self.request.auth.payload.get('landlord_id')
        
        if landlord_id:
            # Landlord accessing their chats
            return Chat.objects.filter(landlord_id=landlord_id)
        else:
            # User accessing their chats
            return Chat.objects.filter(user=user)


class ChatCreateView(generics.CreateAPIView):
    """
    Start a new chat between a user and landlord about a property.
    Automatically creates or retrieves existing chat if one exists.
    """
    serializer_class = ChatCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        user = self.request.user
        landlord_id = serializer.validated_data.get('landlord')
        property_id = serializer.validated_data.get('property')
        subject = serializer.validated_data.get('subject', '')
        
        try:
            landlord = LandlordUser.objects.get(id=landlord_id)
        except LandlordUser.DoesNotExist:
            raise serializers.ValidationError({'error': 'Landlord not found'})
        
        property_obj = None
        if property_id:
            try:
                property_obj = Property.objects.get(id=property_id)
            except Property.DoesNotExist:
                raise serializers.ValidationError({'error': 'Property not found'})
        
        # Get or create chat
        chat, created = Chat.objects.get_or_create(
            user=user,
            landlord=landlord,
            property=property_obj,
            defaults={'subject': subject}
        )
        
        self.instance = chat
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatSerializer


class SendMessageView(generics.CreateAPIView):
    """
    Send a message in a chat.
    Works for both users and landlords.
    """
    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        chat_id = kwargs.get('chat_id')
        
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Response(
                {'error': 'Chat not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify user has access to this chat
        landlord_id = request.auth.payload.get('landlord_id')
        
        if landlord_id:
            # Landlord sending message
            if chat.landlord_id != landlord_id:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            sender_landlord = LandlordUser.objects.get(id=landlord_id)
            message = Message.objects.create(
                chat=chat,
                sender_landlord=sender_landlord,
                content=request.data.get('content')
            )
        else:
            # User sending message
            if chat.user_id != request.user.id:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            message = Message.objects.create(
                chat=chat,
                sender_user=request.user,
                content=request.data.get('content')
            )
        
        # Update chat's updated_at timestamp
        chat.save(update_fields=['updated_at'])
        
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED
        )


class GetChatMessagesView(generics.ListAPIView):
    """
    Get all messages in a specific chat.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        chat_id = self.kwargs.get('chat_id')
        user = self.request.user
        landlord_id = self.request.auth.payload.get('landlord_id')
        
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Message.objects.none()
        
        # Verify access
        if landlord_id:
            if chat.landlord_id != landlord_id:
                return Message.objects.none()
        else:
            if chat.user_id != user.id:
                return Message.objects.none()
        
        # Mark messages as read for this user/landlord
        if landlord_id:
            # Landlord viewing messages sent by user
            chat.messages.filter(sender_user__isnull=False, is_read=False).update(is_read=True)
        else:
            # User viewing messages sent by landlord
            chat.messages.filter(sender_landlord__isnull=False, is_read=False).update(is_read=True)
        
        return chat.messages.all().order_by('created_at')


class StartChatFromPropertyView(generics.CreateAPIView):
    """
    Convenience endpoint to start a chat directly from a property view.
    POST /api/users/chats/start-from-property/
    Body: { "property_id": 1, "message": "I'm interested in this property" }
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        property_id = request.data.get('property_id')
        initial_message = request.data.get('message', '')
        
        try:
            property_obj = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {'error': 'Property not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not property_obj.landlord:
            return Response(
                {'error': 'Property has no landlord assigned'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create chat
        chat, created = Chat.objects.get_or_create(
            user=user,
            landlord=property_obj.landlord,
            property=property_obj,
            defaults={'subject': f'Inquiry about {property_obj.title}'}
        )
        
        # Send initial message if provided
        if initial_message:
            Message.objects.create(
                chat=chat,
                sender_user=user,
                content=initial_message
            )
            chat.save(update_fields=['updated_at'])
        
        return Response(
            ChatSerializer(chat).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# =====================================================
# NEW CONVERSATION ENDPOINTS (Frontend Compatibility)
# =====================================================

class ConversationListView(generics.ListAPIView):
    """
    Get all conversations for the current user/landlord.
    Compatible with Socket.IO frontend expectations.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Return all chats where user is either the user or landlord
        return Chat.objects.filter(
            Q(user=user) | Q(landlord__user=user)
        ).order_by('-updated_at')


class ConversationDetailView(generics.RetrieveAPIView):
    """
    Get a specific conversation with all messages.
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(
            Q(user=user) | Q(landlord__user=user)
        )


class ConversationMessagesView(generics.ListAPIView):
    """
    Get all messages in a specific conversation.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs.get('id')
        user = self.request.user
        
        # Verify user has access to this conversation
        chat = get_object_or_404(
            Chat,
            id=conversation_id
        )
        
        if chat.user != user and chat.landlord.user != user:
            return Message.objects.none()
        
        return Message.objects.filter(chat_id=conversation_id).order_by('created_at')


class CreateConversationMessageView(generics.CreateAPIView):
    """
    Send a message in a conversation.
    """
    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('id')
        user = self.request.user
        
        # Get the conversation
        chat = get_object_or_404(Chat, id=conversation_id)
        
        # Verify user has access
        if chat.user != user and chat.landlord.user != user:
            raise serializers.ValidationError("You don't have access to this conversation")
        
        # Create message
        if chat.user == user:
            Message.objects.create(
                chat=chat,
                sender_user=user,
                content=serializer.validated_data['content']
            )
        else:
            Message.objects.create(
                chat=chat,
                sender_landlord=chat.landlord,
                content=serializer.validated_data['content']
            )
        
        # Update conversation timestamp
        chat.save(update_fields=['updated_at'])


class GetOrCreateConversationView(generics.GenericAPIView):
    """
    Get or create a conversation between user and landlord.
    """
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        landlord_id = request.data.get('landlord_id')
        property_id = request.data.get('property_id')
        
        user = request.user
        
        # Verify user_id matches current user
        if user_id and user_id != user.id:
            return Response(
                {'error': 'Cannot create conversation for another user'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get landlord
        landlord = get_object_or_404(LandlordUser, id=landlord_id)
        
        # Get property if specified
        property_obj = None
        if property_id:
            property_obj = get_object_or_404(Property, id=property_id)
        
        # Get or create conversation
        chat, created = Chat.objects.get_or_create(
            user=user,
            landlord=landlord,
            property=property_obj,
            defaults={'subject': f"Chat with {landlord.name}"}
        )
        
        return Response(
            ChatSerializer(chat).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class MarkConversationReadView(generics.UpdateAPIView):
    """
    Mark all messages in a conversation as read.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        conversation_id = kwargs.get('id')
        user = request.user
        
        # Get conversation
        chat = get_object_or_404(Chat, id=conversation_id)
        
        # Verify access
        if chat.user != user and chat.landlord.user != user:
            return Response(
                {'error': 'You don\'t have access to this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark messages as read
        Message.objects.filter(chat=chat).update(is_read=True)
        
        return Response(
            {'status': 'Conversation marked as read'},
            status=status.HTTP_200_OK
        )


class DeleteConversationView(generics.DestroyAPIView):
    """
    Delete a conversation.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        conversation_id = kwargs.get('id')
        user = request.user
        
        # Get conversation
        chat = get_object_or_404(Chat, id=conversation_id)
        
        # Verify access
        if chat.user != user and chat.landlord.user != user:
            return Response(
                {'error': 'You don\'t have access to this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete conversation and its messages
        chat.delete()
        
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

