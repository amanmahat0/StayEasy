import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Search } from "lucide-react";
import socketService from "../../services/socketService";
import chatService from "../../services/chatService";
import { AuthContext } from "../../context/AuthContext";
import ConversationWindow from "./ConversationWindow";

// Helper to get chat partner info
function getChatPartner(conversation: any, currentUser: any) {
  // If you have user data, replace this with a lookup by ID
  const partnerId =
    conversation.user1_id === currentUser.id
      ? conversation.user2_id
      : conversation.user1_id;
  let partnerName =
    conversation.user1_id === currentUser.id
      ? conversation.user2_name
      : conversation.user1_name;
  if (!partnerName) partnerName = `User ${partnerId}`;
  return { partnerId, partnerName };
}

export default function ChatInbox() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};

  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    socketService.connect();
    loadChats();
    const handleMessage = (msg: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.room_id === msg.roomId
            ? { ...c, last_message: msg.message, updated_at: msg.timestamp }
            : c
        )
      );
    };
    socketService.onMessageReceived(handleMessage);
    return () => {
      socketService.removeListener("receive-message");
    };
  }, [user]);

  const loadChats = async () => {
    setLoading(true);
    try {
  // Use chatService for unified logic
  const data = await chatService.getConversations();
  setConversations(data.conversations || data || []);
    } catch (err) {
      console.error("Failed to load chats", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter((c) => {
    if (!user) return false;
    const { partnerName } = getChatPartner(c, user);
    return partnerName.toLowerCase().includes(search.toLowerCase());
  });

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center bg-gray-100 p-2 rounded-full mt-3">
            <Search size={16} />
            <input
              className="ml-2 bg-transparent outline-none text-sm"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center text-gray-400">
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400">
              No conversations
            </div>
          ) : (
            filtered.map((c) => {
              const { partnerId, partnerName } = getChatPartner(c, user);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="p-3 border-b cursor-pointer hover:bg-gray-50"
                >
                  <div className="font-semibold">{partnerName}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {c.last_message || "No messages yet"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(c.updated_at).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          (() => {
            const { partnerName } = getChatPartner(selected, user);
            return (
              <ConversationWindow
                conversation={{
                  id: selected.room_id,
                  participantId: selected.user1_id === user.id ? selected.user2_id : selected.user1_id,
                  participantName: partnerName,
                  lastMessage: selected.last_message,
                  unreadCount: 0,
                  isOnline: false,
                  userType: "user",
                }}
                currentUser={user}
                onClose={() => setSelected(null)}
                onDelete={() =>
                  setConversations((prev) =>
                    prev.filter((c) => c.room_id !== selected.room_id)
                  )
                }
              />
            );
          })()
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}