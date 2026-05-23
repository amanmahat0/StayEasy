import io, { Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
const UPLOAD_URL = "http://localhost:3001/api/upload-image";

class SocketService {
  private socket: Socket | null = null;

  /**
   * Initialize socket connection
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // Connection event listeners
    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    this.socket.on("connect_error", (error: any) => {
      console.error("🔴 Connection error:", error);
    });

    return this.socket;
  }

  /**
   * Join a chat room
   */
  joinRoom(data: {
    propertyId: number;
    userId: number;
    landlordId: number;
    userName: string;
    userType: "user" | "landlord";
  }) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit("join-room", data);
  }

  /**
   * Send text message to room
   */
  sendMessage(data: {
    roomId: string;
    message: string;
    userId: number;
    userName: string;
    userType: "user" | "landlord";
  }) {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("send-message", data);
  }

  /**
   * Send image message to room
   */
  sendImage(data: {
    roomId: string;
    imageUrl: string;
    userId: number;
    userName: string;
    userType: "user" | "landlord";
    caption?: string;
  }) {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("send-image", data);
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: File): Promise<{ imageUrl: string; size: number; width: number; height: number }> {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      return {
        imageUrl: result.imageUrl,
        size: result.size,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  setTyping(data: {
    roomId: string;
    userId: number;
    userName: string;
    isTyping: boolean;
  }) {
    if (!this.socket) return;
    this.socket.emit("user-typing", data);
  }

  /**
   * Request online users list
   */
  requestOnlineUsers(data: { roomId: string }) {
    if (!this.socket) return;
    this.socket.emit("request-online-users", data);
  }

  /**
   * Request chat history
   */
  requestHistory(data: { roomId: string; limit?: number }) {
    if (!this.socket) return;
    this.socket.emit("request-history", data);
  }

  /**
   * Leave chat room
   */
  leaveRoom(data: { roomId: string; userId: number; userName: string }) {
    if (!this.socket) return;
    this.socket.emit("leave-room", data);
  }

  /**
   * Listen for incoming text messages
   */
  onMessageReceived(callback: (message: any) => void) {
    if (!this.socket) return;
    this.socket.on("receive-message", callback);
  }

  /**
   * Listen for incoming image messages
   */
  onImageReceived(callback: (message: any) => void) {
    if (!this.socket) return;
    this.socket.on("receive-image", callback);
  }

  /**
   * Listen for user joined notification
   */
  onUserJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("user-joined", callback);
  }

  /**
   * Listen for user left notification
   */
  onUserLeft(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("user-left", callback);
  }

  /**
   * Listen for online users list
   */
  onOnlineUsersList(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("online-users-list", callback);
  }

  /**
   * Listen for typing indicator
   */
  onUserTyping(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("user-typing-indicator", callback);
  }

  /**
   * Listen for room joined confirmation
   */
  onRoomJoined(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("room-joined", callback);
  }

  /**
   * Listen for chat history
   */
  onHistoryReceived(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on("chat-history", callback);
  }

  /**
   * Listen for errors
   */
  onError(callback: (error: any) => void) {
    if (!this.socket) return;
    this.socket.on("error", callback);
  }

  /**
   * Remove all listeners for a specific event
   */
  removeListener(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new SocketService();
