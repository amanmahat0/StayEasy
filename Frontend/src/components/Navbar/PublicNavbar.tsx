import { useState } from "react";
import { Home, ChevronDown, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.user_type;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatar = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "U";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "User";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              StayEasy
            </span>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-12">

            {/* LANDLORD NAV */}
            {role === "owner" ? (
              <>
                <NavItem to="/dashboard" label="Dashboard" />
                <NavItem to="/properties" label="Properties" />
              </>
            ) : (
              /* TENANT & GUEST NAV */
              <>
                <NavItem to="/home" label="Home" />
                {role === "tenant" && (
                  <>
                    <NavItem to="/my-bookings" label="My Bookings" />
                    <NavItem to="/favorites" label="Favorites" />
                  </>
                )}
              </>
            )}

            {/* COMMON LINK */}
            <NavItem to="/about" label="About Us" />

          </div>

          {/* USER SECTION */}
          <div className="flex items-center gap-4">

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="w-9 h-9 bg-[#A989C8] text-white rounded-xl flex items-center justify-center font-bold">
                    {avatar}
                  </div>

                  <span className="hidden sm:block font-medium text-gray-800">
                    {fullName}
                  </span>

                  <ChevronDown className="text-gray-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">

                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg font-medium"
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
                className="bg-[#A989C8] text-white px-5 py-2 rounded-xl font-medium hover:bg-[#9b7bb8]"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}

/* NAV ITEM HELPER */
interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <Link
      to={to}
      className="relative text-gray-700 font-medium hover:text-[#A989C8] transition"
    >
      {label}
    </Link>
  );
}