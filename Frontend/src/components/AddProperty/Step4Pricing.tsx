import React from 'react';

interface Props {
  formData: any;
  setFormData: any;
}

const Step4Pricing: React.FC<Props> = ({ formData, setFormData }) => {
  const inputClass = "w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A87DC2] outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h2>
        <p className="text-gray-500">Set your financial details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Monthly Rent</label>
          <input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({...formData, monthlyRent: e.target.value})} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Security Deposit</label>
          <input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({...formData, securityDeposit: e.target.value})} className={inputClass} />
        </div>
      </div>

      <div className="bg-[#A87DC2]/10 p-4 rounded-xl text-[#A87DC2] text-sm">
        <p><strong>Tip:</strong> Most landlords in your area charge 2 months rent as security deposit.</p>
      </div>
    </div>
  );
};

export default Step4Pricing;