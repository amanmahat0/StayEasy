import React from 'react';

interface Props {
  formData: any;
  setFormData: any;
}

const Step3Details: React.FC<Props> = ({ formData, setFormData }) => {
  const amenitiesList = ["Parking", "WiFi", "Water", "Electricity", "Balcony", "Garden"];

  const handleAmenityToggle = (amenity: string) => {
    const current = formData.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((item: string) => item !== amenity)
      : [...current, amenity];
    setFormData({ ...formData, amenities: updated });
  };

  const inputClass = "w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A87DC2] outline-none";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Details</h2>
        <p className="text-gray-500">Specific property features</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <input type="number" placeholder="Bedrooms" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} className={inputClass} />
        <input type="number" placeholder="Bathrooms" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} className={inputClass} />
        <input type="number" placeholder="Sq Ft" value={formData.areaSize} onChange={(e) => setFormData({...formData, areaSize: e.target.value})} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">Amenities</label>
        <div className="flex flex-wrap gap-3">
          {amenitiesList.map((amenity) => (
            <button
              key={amenity}
              onClick={() => handleAmenityToggle(amenity)}
              className={`px-6 py-2 rounded-full border text-sm font-medium transition-all
                ${formData.amenities?.includes(amenity)
                  ? 'bg-[#A87DC2]/10 border-[#A87DC2] text-[#A87DC2]'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#A87DC2]/50'
                }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3Details;