import React from 'react';

interface Props {
  formData: any;
  setFormData: any;
}

const Step2BasicInfo: React.FC<Props> = ({ formData, setFormData }) => {
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const inputClass = "w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A87DC2] focus:border-transparent outline-none transition-all";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-500">Provide basic details about your property</p>
      </div>

      <input
        type="text"
        placeholder="Property Title *"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        className={inputClass}
      />

      <textarea
        placeholder="Description *"
        rows={4}
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        className={`${inputClass} resize-none`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" placeholder="City *" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClass} />
        <input type="text" placeholder="Area/Locality *" value={formData.area} onChange={(e) => handleChange('area', e.target.value)} className={inputClass} />
      </div>

      <input
        type="text"
        placeholder="Full Address *"
        value={formData.fullAddress}
        onChange={(e) => handleChange('fullAddress', e.target.value)}
        className={inputClass}
      />
    </div>
  );
};

export default Step2BasicInfo;