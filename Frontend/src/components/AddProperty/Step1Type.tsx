import React from 'react';
import { Home, Building2, Building, Landmark } from 'lucide-react';

interface Props {
  formData: any;
  setFormData: any;
}

const Step1Type: React.FC<Props> = ({ formData, setFormData }) => {
  const types = [
    { id: 'room', label: 'Room', desc: 'Single or shared room', icon: Home },
    { id: 'apartment', label: 'Flat/Apartment', desc: '1BHK, 2BHK, 3BHK+', icon: Building2 },
    { id: 'house', label: 'House', desc: 'Independent house', icon: Building },
    { id: 'land', label: 'Land', desc: 'Commercial/Residential', icon: Landmark },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Property Type</h2>
      <p className="text-gray-500 mb-6">Choose the type of property you want to list</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {types.map((item) => {
          const isSelected = formData.propertyType === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setFormData({ ...formData, propertyType: item.id })}
                className={`flex flex-col items-start p-4 sm:p-6 rounded-2xl border-2 transition-all text-left
                ${isSelected 
                  ? "border-[#A87DC2] bg-[#A87DC2]/5 ring-1 ring-[#A87DC2]" 
                  : "border-gray-200 hover:border-[#A87DC2]/50"}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                ${isSelected ? "bg-[#A87DC2]/20 text-[#A87DC2]" : "bg-gray-100 text-gray-400"}`}>
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className={`font-bold text-lg ${isSelected ? "text-[#A87DC2]" : "text-gray-900"}`}>
                {item.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step1Type;