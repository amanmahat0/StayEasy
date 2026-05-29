import type { ConversationData, ConversationView, User } from "../type";

export function toConversationView(c: ConversationData, currentUserId: number, _currentUserType?: string): ConversationView {
  const landlordId = getJwtPayload()?.landlord_id as number | undefined;

  const isUserSide = c.user === currentUserId;
  // Detect landlord side: JWT landlord_id match, OR user is not the regular User FK
  const isLandlordSide = !!(landlordId && c.landlord === landlordId) || (!isUserSide && !!c.landlord);
  const selfLandlordId = isLandlordSide ? c.landlord : landlordId || undefined;

  const partnerId = isUserSide ? c.landlord : c.user;
  const partnerName = isUserSide ? c.landlord_name : c.user_name;
  const currentUserName = isUserSide ? c.user_name : c.landlord_name;

  // The partner's REGULAR User ID (not LandlordUser ID) for socket notification routing
  const participantUserId = isUserSide
    ? (c.landlord_user_id ?? c.landlord)   // landlord's regular User ID via email match
    : c.user;                                // tenant's regular User ID directly

  return {
    id: String(c.id),
    participantId: partnerId,
    participantName: partnerName || `User ${partnerId}`,
    participantUserId,
    lastMessage: c.last_message?.content || c.last_message?.image_url || "",
    unreadCount: c.unread_count || 0,
    isOnline: false,
    userType: isUserSide ? "user" : "landlord",
    roomId: c.room_id,
    currentUserName,
    myLandlordId: selfLandlordId,
  };
}

export function canChat(user: User | null | undefined): boolean {
  if (!user) return false;

  // Regular user with tenant or owner (landlord) role
  if (user.user_type === "tenant" || user.user_type === "owner") return true;

  // LandlordUser via separate JWT — decode token to check
  const payload = getJwtPayload();
  if (payload?.landlord_id) return true;

  return false;
}

export function getJwtPayload(): Record<string, unknown> | null {
  try {
    const token = localStorage.getItem("access");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}
