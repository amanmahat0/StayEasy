import { Home, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= NAVBAR ================= */}
        <div className="flex items-center justify-between h-20">
          
          {/* ========== LOGO ========== */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <span className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              StayEasy
            </span>
          </Link>

          {/* ========== DESKTOP NAV LINKS ========== */}
          <div className="hidden lg:flex items-center gap-10">
            <NavItem to="/features" label="Features" />
            <NavItem to="/properties" label="Properties" />
            <NavItem to="/how-it-works" label="How It Works" />
            <NavItem to="/about" label="About" />
          </div>

          {/* ========== DESKTOP ACTION BUTTONS ========== */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Login */}
            <Link
              to="/login"
              className="
                px-4
                lg:px-6
                py-2.5
                rounded-xl
                border-2
                border-[#A989C8]
                text-[#A989C8]
                font-medium
                text-sm
                lg:text-base
                hover:bg-[#A989C8]
                hover:text-white
                transition-all
                whitespace-nowrap
              "
            >
              Login
            </Link>

            {/* Sign Up */}
            <Link
              to="/signup"
              className="
                px-4
                lg:px-6
                py-2.5
                rounded-xl
                bg-[#A989C8]
                text-white
                font-medium
                text-sm
                lg:text-base
                hover:bg-[#8d6aa9]
                transition-all
                shadow-md
                whitespace-nowrap
              "
            >
              Sign Up
            </Link>
          </div>

          {/* ========== MOBILE MENU BUTTON ========== */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              sm:hidden
              p-2
              rounded-lg
              hover:bg-gray-100
              transition
            "
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-gray-100 animate-fadeIn">
            
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-4 mb-6">
              <MobileNavItem
                to="/features"
                label="Features"
                setMobileMenuOpen={setMobileMenuOpen}
              />

              <MobileNavItem
                to="/properties"
                label="Properties"
                setMobileMenuOpen={setMobileMenuOpen}
              />

              <MobileNavItem
                to="/how-it-works"
                label="How It Works"
                setMobileMenuOpen={setMobileMenuOpen}
              />

              <MobileNavItem
                to="/about"
                label="About"
                setMobileMenuOpen={setMobileMenuOpen}
              />
            </div>

            {/* Mobile Buttons */}
            <div className="flex flex-col gap-3">
              
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  w-full
                  text-center
                  px-4
                  py-3
                  rounded-xl
                  border-2
                  border-[#A989C8]
                  text-[#A989C8]
                  font-medium
                  hover:bg-[#A989C8]
                  hover:text-white
                  transition-all
                "
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="
                  w-full
                  text-center
                  px-4
                  py-3
                  rounded-xl
                  bg-[#A989C8]
                  text-white
                  font-medium
                  hover:bg-[#8d6aa9]
                  transition-all
                  shadow-md
                "
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ================= DESKTOP NAV ITEM ================= */

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  return (
    <Link
      to={to}
      className="
        relative
        text-gray-700
        font-medium
        transition-colors
        hover:text-[#A989C8]
        after:absolute
        after:left-0
        after:-bottom-2
        after:h-[2px]
        after:w-0
        after:bg-[#A989C8]
        after:transition-all
        hover:after:w-full
        whitespace-nowrap
      "
    >
      {label}
    </Link>
  );
}

/* ================= MOBILE NAV ITEM ================= */

interface MobileNavItemProps {
  to: string;
  label: string;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MobileNavItem({
  to,
  label,
  setMobileMenuOpen,
}: MobileNavItemProps) {
  return (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className="
        text-gray-700
        font-medium
        py-2
        hover:text-[#A989C8]
        transition-colors
      "
    >
      {label}
    </Link>
  );
}