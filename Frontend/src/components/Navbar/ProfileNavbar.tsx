import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProfileNavbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.user_type === "owner";

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(window.location.pathname, { replace: true }); }} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#A989C8] flex items-center justify-center text-white">
            <Home size={18} />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            StayEasy
          </span>
        </a>

        {/* Right: Back */}
        <button
          onClick={() => navigate(isOwner ? "/dashboard" : "/home")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#A989C8] transition"
        >
          <ArrowLeft size={16} />
          {isOwner ? "Back to Dashboard" : "Back to Home"}
        </button>
      </div>
    </header>
  );
};

export default ProfileNavbar;
