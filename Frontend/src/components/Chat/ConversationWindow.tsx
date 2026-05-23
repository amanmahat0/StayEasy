
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Send,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  X,
  Smile,
} from "lucide-react";
import socketService from "../../services/socketService";
import chatService from "../../services/chatService";

function ImageUploader({
  roomId,
  userId,
  userName,
  userType,
  onUploadStart,
  onUploadComplete,
}: {
  roomId: string;
  userId: number;
  userName: string;
  userType: string;
  onUploadStart?: () => void;
  onUploadComplete?: (file?: File, caption?: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) {
      onUploadComplete && onUploadComplete();
      return;
    }
    onUploadStart && onUploadStart();

    // Simulate a quick upload; replace with real upload logic if needed.
    setTimeout(() => {
      onUploadComplete && onUploadComplete(file);
    }, 500);
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="p-2 text-gray-500 hover:text-blue-500"
      >
        📷
      </button>
    </div>
  );
}

function EmojiPicker({
  onEmojiSelect,
  onClose,
}: {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const emojis = ["😀", "😂", "😍", "😢", "👍", "🙏", "🎉", "❤️"];
  return (
    <div className="p-2 bg-white border rounded shadow">
      <div className="grid grid-cols-6 gap-2">
        {emojis.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              onEmojiSelect(e);
            }}
            className="text-2xl"
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mt-2 text-right">
        <button onClick={onClose} className="text-sm text-gray-500">
          Close
        </button>
      </div>
    </div>
  );
}

interface Conversation {
  id: string;
  participantId: number;
  participantName: string;
  lastMessage: string;
  unreadCount: number;
  isOnline: boolean;
  userType: "user" | "landlord";
}

interface Message {
  id: string;
  senderId?: number;
  content?: string;
  imageUrl?: string;
  caption?: string;
  timestamp: string;
  type?: "text" | "image";
}

interface Props {
  conversation: Conversation;
  currentUser: any;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export default function ConversationWindow({
  conversation,
  currentUser,
  onClose,
  onDelete,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roomId = chatService.generateRoomId(
    currentUser.id,
    conversation.participantId
  );

  // SOCKET + HISTORY
  useEffect(() => {
    if (!conversation) return;

    socketService.connect();

    // join room
    socketService.joinRoom({
      propertyId: 0,
      userId: currentUser.id,
      landlordId: conversation.participantId,
      userName: currentUser.name,
      userType: currentUser.user_type,
    });

    // ✅ FIXED: only valid fields here
    socketService.requestHistory({
      roomId,
      limit: 50,
    });

    const handleMessage = (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || Date.now().toString(),
          senderId: msg.userId,
          content: msg.message || msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
          type: "text",
        },
      ]);
    };

    socketService.onMessageReceived(handleMessage);

    return () => {
      socketService.leaveRoom({
        roomId,
        userId: currentUser.id,
        userName: currentUser.name,
      });

      socketService.removeListener("receive-message");
    };
  }, [conversation]);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: input,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, newMsg]);

    socketService.sendMessage({
      roomId,
      message: input,
      userId: currentUser.id,
      userName: currentUser.name,
      userType: currentUser.user_type,
    });

    // Persist message to backend
    if (conversation?.id) {
      try {
        await chatService.saveMessage(conversation.id, input);
      } catch (e) {
        // handle error
      }
    }

    setInput("");
    setShowEmoji(false);
  };

  // Handle image upload
  const handleImageSend = async (file: File, caption?: string) => {
    setUploading(true);
    try {
      const res = await socketService.uploadImage(file);
      if (res && res.imageUrl) {
        const msg: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          imageUrl: res.imageUrl,
          caption,
          timestamp: new Date().toISOString(),
          type: "image",
        };
        setMessages((prev) => [...prev, msg]);
        socketService.sendImage({
          roomId,
          imageUrl: res.imageUrl,
          caption,
          userId: currentUser.id,
          userName: currentUser.name,
          userType: currentUser.user_type,
        });
        // Persist image message to backend (optional: extend backend to support image/caption)
        if (conversation?.id) {
          try {
            await chatService.saveMessage(conversation.id, caption ? `${caption} [image: ${res.imageUrl}]` : `[image: ${res.imageUrl}]`);
          } catch (e) {
            // handle error
          }
        }
      }
    } catch (e) {
      // handle error
    }
    setUploading(false);
  };

  return (
    <div className="hidden md:flex flex-1 flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 border-b bg-[#A989C8] text-white flex justify-between">
        <div>
          <h2 className="font-bold">{conversation.participantName}</h2>
          <p className="text-xs opacity-80">
            {conversation.isOnline ? "Online" : "Offline"}
          </p>
        </div>

        <div className="flex gap-2 relative">
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />

          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 bg-white text-black rounded shadow">
              <button
                onClick={() => onDelete(conversation.id)}
                className="flex items-center gap-2 px-3 py-2 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  isOwn
                    ? "bg-[#A989C8] text-white"
                    : "bg-white border text-black"
                }`}
              >
                {msg.type === "image" && msg.imageUrl ? (
                  <>
                    <img
                      src={msg.imageUrl}
                      alt="chat-img"
                      className="max-h-48 rounded mb-1 cursor-pointer"
                    />
                    {msg.caption && <div className="text-xs text-gray-700 mt-1">{msg.caption}</div>}
                  </>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2 items-center">
        <ImageUploader
          roomId={roomId}
          userId={currentUser.id}
          userName={currentUser.name}
          userType={currentUser.user_type}
          onUploadStart={() => setUploading(true)}
          onUploadComplete={(file, caption) => {
            setUploading(false);
            if (file) handleImageSend(file, caption);
          }}
        />
        <div className="relative">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-blue-500"
            onClick={() => setShowEmoji((v) => !v)}
            disabled={uploading}
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker
                onEmojiSelect={(emoji) => setInput((prev) => prev + emoji)}
                onClose={() => setShowEmoji(false)}
              />
            </div>
          )}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          className="flex-1 border rounded-full px-4 py-2"
          disabled={uploading}
        />
        <button
          onClick={handleSend}
          className="bg-[#A989C8] text-white px-4 rounded-full"
          disabled={!input.trim() || uploading}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}