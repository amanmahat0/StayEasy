import React from 'react';
import { Eye } from 'lucide-react';

interface KycListItemProps {
  name: string;
  role: 'Tenant' | 'Landlord';
  email: string;
  phone: string;
  citizenship: string;
  docsCount: number;
  submittedAt: string;
  avatarUrl: string;
}

export const KycListItem: React.FC<KycListItemProps> = ({
  name, role, email, phone, citizenship, docsCount, submittedAt, avatarUrl
}) => {
  const isTenant = role === 'Tenant';
  
  return (
    <div className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow">
      <img src={avatarUrl} alt={name} className="w-14 h-14 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-base font-bold text-gray-900">{name}</h4>
          <span className={`${isTenant ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'} text-[10px] px-2 py-0.5 rounded font-medium`}>
            {role}
          </span>
          <span className="bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded font-medium border border-amber-100">
            Needs Review
          </span>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <p>{email}</p>
          <p>{phone}</p>
          <p>Citizenship: {citizenship} • {docsCount} document{docsCount > 1 ? 's' : ''}</p>
          <p className="text-gray-400 mt-2">Submitted: {submittedAt}</p>
        </div>
      </div>
      <button className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
        <Eye size={16} /> Review
      </button>
    </div>
  );
};