import React from 'react';
import { Home, Shield, Bell, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Home size={20} className="text-purple-600" />
        </div>
        StayEasy <span className="text-sm text-purple-400 font-medium ml-1 mt-1">Admin Panel</span>
      </div>
      
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
          <a href="#" className="flex items-center gap-2 hover:text-purple-600 transition-colors">
            <Shield size={16} /> Verifications
          </a>
          <a href="#" className="hover:text-purple-600 transition-colors">View Site</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors">
            <User size={16} /> Admin
          </button>
        </div>
      </div>
    </header>
  );
};