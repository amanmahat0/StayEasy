import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const ProfileNavbar = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#A989C8] flex items-center justify-center text-white">
            <Home size={18} />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            StayEasy
          </span>
        </div>

        {/* Right: Back to Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#A989C8] transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </header>
  );
};

export default ProfileNavbar;
