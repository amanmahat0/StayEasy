import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* ========== LOGO ========== */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              StayEasy
            </span>
          </Link>

          {/* ========== CENTER NAV LINKS ========== */}
          <div className="hidden md:flex items-center gap-12">
            <NavItem to="/features" label="Features" />
            <NavItem to="/properties" label="Properties" />
            <NavItem to="/how-it-works" label="How It Works" />
            <NavItem to="/about" label="About" />
          </div>

          {/* ========== RIGHT ACTION BUTTONS ========== */}
          <div className="flex items-center gap-4">
            {/* Login Button */}
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border-2 border-[#A989C8] text-[#A989C8] font-medium hover:bg-[#A989C8] hover:text-white transition-all"
            >
              Login
            </Link>

            {/* Sign Up Button */}
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-[#A989C8] text-white font-medium hover:bg-[#8d6aa9] transition-all shadow-md"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}

/* ---------- Helper Component ---------- */

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <Link
      to={to}
      className="relative text-gray-700 font-medium transition-colors hover:text-[#A989C8]
      after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0
      after:bg-[#A989C8] after:transition-all hover:after:w-full"
    >
      {label}
    </Link>
  );
}
