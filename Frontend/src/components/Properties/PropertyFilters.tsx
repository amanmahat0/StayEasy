import React from 'react';
import { Search } from 'lucide-react';

interface PropertyFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'all', label: 'All Properties', count: 0 },
    { id: 'draft', label: 'Draft', count: 0 },
    { id: 'published', label: 'Published', count: 0 },
    { id: 'available', label: 'Available', count: 0 },
    { id: 'occupied', label: 'Occupied', count: 0 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search properties by title or location..." 
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A989C8] focus:border-transparent transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#A989C8] text-white shadow-md shadow-[#A989C8]/20'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyFilters;