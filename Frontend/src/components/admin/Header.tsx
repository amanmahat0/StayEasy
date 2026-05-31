import React, { useState } from 'react';
import { Bell, LogOut, Settings, ChevronDown, Home, Menu, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatar = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AD";

  return (
    <header className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 relative">
        
        {/* Left: Brand */}
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">StayEasy</span>
        </Link>

        {/* Center: Label */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <span className="text-[11px] font-bold text-[#A989C8] uppercase tracking-[0.2em]">Admin Panel</span>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-[#A989C8] transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Right: User Actions (hidden on mobile when nav is open) */}
        <div className={`items-center gap-4 ${isMobileNavOpen ? 'hidden' : 'flex'}`}>
          <button className="relative p-2 text-gray-400 hover:text-[#A989C8]">
            <Bell size={22} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 bg-[#A989C8] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                {avatar}
              </div>
              <span className="hidden sm:block font-bold text-gray-700 text-sm">Admin</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"><Settings size={16} /> Settings</Link>
                <hr className="my-1 border-gray-50" />
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left font-bold"><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden border-t border-gray-100 mt-3 pt-3 pb-4 space-y-2">
          <Link
            to="/admin"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/agreements"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Agreements
          </Link>
          <Link
            to="/admin/settings"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={() => { handleLogout(); setIsMobileNavOpen(false); }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};