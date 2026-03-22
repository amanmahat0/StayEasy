import { Home, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
  <footer className="bg-[#111827] mt-20">

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#A989C8] rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                StayEasy
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              StayEasy helps you find rooms, flats, and properties easily and safely.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><Link to="/" className="hover:text-[#A989C8]">Home</Link></li>
              <li><Link to="/properties" className="hover:text-[#A989C8]">Properties</Link></li>
              <li><Link to="/about" className="hover:text-[#A989C8]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#A989C8]">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> support@stayeasy.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +977 98XXXXXXX
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Nepal
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
<div className="mt-12 pt-6 border-t border-gray-700 text-center">
  <p className="text-sm text-gray-400">
    © 2025 StayEasy. All rights reserved. Made with care in Nepal.
  </p>
</div>

      </div>
    </footer>
  );
}
