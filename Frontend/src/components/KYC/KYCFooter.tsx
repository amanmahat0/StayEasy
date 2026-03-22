import { Lock, Eye, Zap } from 'lucide-react';

export const KYCFooter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-[#A989C8]">
          <Lock size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">256-bit Encryption</p>
          <p className="text-xs text-gray-500">Your data is secure</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-[#A989C8]">
          <Eye size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Privacy Protected</p>
          <p className="text-xs text-gray-500">We never share your info</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-[#A989C8]">
          <Zap size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Quick Review</p>
          <p className="text-xs text-gray-500">Verified in 24-48 hours</p>
        </div>
      </div>
    </div>
  );
};