import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/users/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Chat Service - Handle conversation management
 * Works with both socket.io for real-time and REST for persistence
 */
export const chatService = {
  /**
   * Get all conversations for current user/landlord
   * Returns list of conversations with last message and participant info
   */
async getConversations() {
  try {
    const response = await API.get("/chat/conversations/");
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
},

async createConversation(userId: number) {
  try {
    const response = await API.post(
      "/chat/conversations/create/",
      {
        user_id: userId,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error creating conversation:",
      error
    );
    return null;
  }
},

  /**
   * Get specific conversation with all messages
   * Used when opening a chat from the inbox
   */
  async getConversation(conversationId: string) {
    try {
      const response = await API.get(`/chat/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  },

  /**
   * Get conversation between specific user and landlord
   * Creates one if it doesn't exist
   */
  async getOrCreateConversation(userId: number, landlordId: number, propertyId?: number) {
    try {
      const response = await API.post("/chat/get-or-create/", {
        user_id: userId,
        landlord_id: landlordId,
        property_id: propertyId,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      return null;
    }
  },

  /**
   * Save message to database
   * Called after socket broadcasts for persistence
   */
  async saveMessage(conversationId: string, content: string) {
    try {
      const response = await API.post(`/chat/conversations/${conversationId}/messages/`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  },

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string) {
    try {
      await API.patch(`/chat/conversations/${conversationId}/mark-read/`);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  },

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string) {
    try {
      await API.delete(`/chat/conversations/${conversationId}/`);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  },

  /**
   * Search conversations by participant name
   */
  async searchConversations(query: string) {
    try {
      const response = await API.get("/chat/conversations/", {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching conversations:", error);
      return [];
    }
  },

  /**
   * Generate conversation ID (matches socket.io room format)
   */
  generateConversationId(userId: number, landlordId: number) {
    const sorted = [userId, landlordId].sort();
    return `conv_user_${sorted[0]}_landlord_${sorted[1]}`;
  },

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string) {
    try {
      const response = await API.get(`/chat/conversations/${conversationId}/messages/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      return [];
    }
  },

  /**
   * Generate socket room ID
   */
  generateRoomId(userId: number, landlordId: number, propertyId?: number) {
    if (propertyId) {
      return `property_${propertyId}_user_${userId}_landlord_${landlordId}`;
    }
    return `conv_user_${userId}_landlord_${landlordId}`;
  },
};

export default chatService;
