import React from 'react';
import { User, Lock, Globe } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'security', label: 'Login & Security', icon: Lock },
    { id: 'preferences', label: 'Languages & Currency', icon: Globe },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit sticky top-24">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-[#A989C8] text-white shadow-md shadow-[#A989C8]/20' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#A989C8]'
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;