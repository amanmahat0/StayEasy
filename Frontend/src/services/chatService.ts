import axios from "axios";
import type { ConversationData, MessageData } from "../type";
import { API_BASE } from "../config";

const API = axios.create({
  baseURL: `${API_BASE}/api/users/`,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const chatService = {
  async getConversations(): Promise<ConversationData[]> {
    try {
      const res = await API.get("/chat/conversations/");
      return res.data?.results || res.data || [];
    } catch {
      return [];
    }
  },

  async getConversation(conversationId: number): Promise<ConversationData | null> {
    try {
      const res = await API.get(`/chat/conversations/${conversationId}/`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getConversationMessages(conversationId: number): Promise<MessageData[]> {
    try {
      const res = await API.get(`/chat/conversations/${conversationId}/messages/`);
      return res.data?.results || res.data || [];
    } catch {
      return [];
    }
  },

  async saveMessage(
    conversationId: number,
    content: string,
    imageUrl?: string,
    caption?: string
  ): Promise<MessageData | null> {
    try {
      const payload: Record<string, string> = {};
      if (content) payload.content = content;
      if (imageUrl) payload.image_url = imageUrl;
      if (caption) payload.caption = caption;
      const res = await API.post(`/chat/conversations/${conversationId}/messages/`, payload);
      return res.data;
    } catch {
      return null;
    }
  },

  async getOrCreateConversation(
    userId: number,
    landlordId: number | null | undefined,
    propertyId?: number
  ): Promise<ConversationData | null> {
    try {
      const res = await API.post("/chat/get-or-create/", {
        user_id: userId,
        landlord_id: landlordId,
        property_id: propertyId,
      });
      return res.data;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status: number; data: unknown } };
        console.error("getOrCreateConversation error:", axiosErr.response?.status, axiosErr.response?.data);
      }
      return null;
    }
  },

  async markAsRead(conversationId: number) {
    try {
      await API.patch(`/chat/conversations/${conversationId}/`);
    } catch {
      // silently fail
    }
  },

  async deleteConversation(conversationId: number) {
    try {
      await API.delete(`/chat/conversations/${conversationId}/`);
    } catch {
      // silently fail
    }
  },

  generateRoomId(userId: number, otherId: number): string {
    const sorted = [userId, otherId].sort((a, b) => a - b);
    return `conv_${sorted[0]}_${sorted[1]}`;
  },
};

export default chatService;
