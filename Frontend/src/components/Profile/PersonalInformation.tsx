import { User, CheckCircle, ShieldCheck, PenSquare } from 'lucide-react';
import { useState } from 'react';

const PersonalInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [kycVerified] = useState(false); // only show verified after KYC

  const [personalInfo, setPersonalInfo] = useState({
    legalName: '',
    preferredName: '',
    email: '',
    phone: '',
    residentialAddress: '',
    mailingAddress: '',
  });

  const handleChange = (field: string, value: string) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // call backend API to save data if needed
  };

  return (
    <div className="space-y-6">

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-20 h-20 bg-[#A989C8]/20 rounded-2xl flex items-center justify-center text-[#A989C8]">
          <User size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{personalInfo.legalName || 'Your Name'}</h2>
          <p className="text-gray-500 text-sm mb-2">Landlord Account</p>
          {kycVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
              <ShieldCheck size={14} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            <p className="text-gray-500 text-sm">Update your personal details and contact information</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#A989C8] text-white rounded-lg text-sm font-medium hover:bg-[#9676b5] transition-colors"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <PenSquare size={16} /> {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="space-y-6">
          <EditableField label="Legal Name" value={personalInfo.legalName} isEditing={isEditing} onChange={(val) => handleChange('legalName', val)} />
          <EditableField label="Preferred Name" value={personalInfo.preferredName} isEditing={isEditing} onChange={(val) => handleChange('preferredName', val)} />
          <EditableField label="Email Address" value={personalInfo.email} isEditing={isEditing} onChange={(val) => handleChange('email', val)} />
          <EditableField label="Phone Number" value={personalInfo.phone} isEditing={isEditing} onChange={(val) => handleChange('phone', val)} />
          <EditableField label="Residential Address" value={personalInfo.residentialAddress} isEditing={isEditing} onChange={(val) => handleChange('residentialAddress', val)} />
          <EditableField label="Mailing Address" value={personalInfo.mailingAddress} isEditing={isEditing} onChange={(val) => handleChange('mailingAddress', val)} />
        </div>
      </div>

      {/* Identity Verification */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#A989C8]/10 rounded-lg text-[#A989C8]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Identity Verification</h3>
            </div>
            <p className="text-gray-500 text-sm">Verify your identity to build trust and unlock all features</p>
          </div>
          {kycVerified && (
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-semibold border border-green-100">
              Verified
            </span>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-gray-800 mb-4">Required Documents</h4>
          <div className="space-y-3">
            <DocumentRow label="Citizenship Card" />
            <DocumentRow label="PAN Card" />
            <DocumentRow label="Bank Account Details" />
            <DocumentRow label="Property Ownership Documents" />
          </div>
        </div>

        <button
          className={`w-full py-3 font-semibold rounded-xl ${
            kycVerified ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-[#A989C8]/50 text-white cursor-not-allowed'
          }`}
          disabled
        >
          {kycVerified ? 'Verified' : 'Update Verification'}
        </button>
      </div>
    </div>
  );
};

/* --- Sub-Components --- */

const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  subtext,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (val: string) => void;
  subtext?: string;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
    </div>
    {subtext && <p className="text-xs text-gray-400 mb-2">{subtext}</p>}
    {isEditing ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3.5 border border-gray-300 rounded-xl text-gray-800 text-sm"
      />
    ) : (
      <div className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 text-sm font-medium">
        {value || '-'}
      </div>
    )}
  </div>
);

const DocumentRow = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
    <span className="text-sm text-gray-700 font-medium">{label}</span>
    <CheckCircle size={18} className="text-green-500" />
  </div>
);

export default PersonalInformation;
