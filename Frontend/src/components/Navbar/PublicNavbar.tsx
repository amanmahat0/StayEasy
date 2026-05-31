import { useEffect, useState, useCallback } from "react";
import { Home, ChevronDown, LogOut, Settings, MessageCircle, Menu, X, FileText } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import chatService from "../../services/chatService";
import socketService from "../../services/socketService";
import NotificationsDropdown from "./NotificationsDropdown";
import type { MessagePayload } from "../../type";

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    if (!user?.id) return;
    chatService.getConversations().then((conversations) => {
      const count = conversations.reduce(
        (sum, c) => sum + (c.unread_count || 0), 0
      );
      setUnread(count);
    });
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    refreshUnread();
  }, [user, refreshUnread]);

  useEffect(() => {
    if (!user?.id) return;
    socketService.connect();
    socketService.joinUserRoom(user.id);

    const handleMessage = (msg: MessagePayload) => {
      if (msg.userId !== user.id) {
        refreshUnread();
      }
    };
    const handleNotification = () => refreshUnread();

    socketService.onMessageReceived(handleMessage);
    socketService.onNewNotification(handleNotification);

    const pollInterval = setInterval(() => refreshUnread(), 10000);

    return () => {
      socketService.removeListener("receive-message");
      socketService.removeListener("new-notification");
      clearInterval(pollInterval);
    };
  }, [user, refreshUnread]);

  const role = user?.user_type;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatar = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "U";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "User";

  const navLinks = role === "owner"
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/properties", label: "Properties" },
        { to: "/about", label: "About Us" },
      ]
    : [
        { to: "/home", label: "Home" },
        ...(role === "tenant"
          ? [
              { to: "/my-bookings", label: "My Bookings" },
              { to: "/favorites", label: "Favorites" },
            ]
          : []),
        { to: "/about", label: "About Us" },
      ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* LOGO */}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(window.location.pathname, { replace: true }); }} className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-800">StayEasy</span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            {navLinks.map((link) => (
              <NavItem key={link.to} to={link.to} label={link.label} currentPath={location.pathname} />
            ))}
          </div>

          {/* USER SECTION */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <>
                <Link
                  to="/chat"
                  className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition relative group"
                  title="Chat"
                >
                  <MessageCircle className="w-5 h-5 text-gray-700 group-hover:text-[#A989C8]" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {unread}
                    </span>
                  )}
                </Link>
                <div className="hidden sm:block"><NotificationsDropdown /></div>
              </>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-8 h-8 bg-[#A989C8] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {avatar}
                  </div>
                  <span className="hidden lg:block font-medium text-gray-800 text-sm">
                    {fullName}
                  </span>
                  <ChevronDown className="text-gray-400 w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg text-sm"
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg font-medium text-sm"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#A989C8] text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-[#9b7bb8]"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            {user && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && user && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    location.pathname === link.to || location.pathname.startsWith(link.to + "/")
                      ? "text-[#A989C8] bg-[#F3E8FF]"
                      : "text-gray-700 hover:text-[#A989C8] hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
              <Link
                to="/chat"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#A989C8] hover:bg-gray-50"
              >
                <MessageCircle size={18} />
                Messages
                {unread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">{unread}</span>
                )}
              </Link>
              <Link
                to={role === "owner" ? "/landlord/agreements" : "/agreements"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#A989C8] hover:bg-gray-50"
              >
                <FileText size={18} />
                Agreements
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#A989C8] hover:bg-gray-50"
              >
                <Settings size={18} />
                Profile Settings
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* NAV ITEM */
function NavItem({ to, label, currentPath }: { to: string; label: string; currentPath?: string }) {
  const isActive = currentPath === to || currentPath?.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`font-medium transition text-sm lg:text-base ${
        isActive ? "text-[#A989C8]" : "text-gray-700 hover:text-[#A989C8]"
      }`}
    >
      {label}
    </Link>
  );
}