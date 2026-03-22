import { Building2, Plus } from 'lucide-react';

const EmptyPropertyState = () => {
  return (
    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
      
      {/* Icon Circle */}
      <div className="w-20 h-20 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
        <Building2 size={32} className="text-[#A989C8]" strokeWidth={1.5} />
      </div>

      {/* Text Content */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">No Properties Listed Yet</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        Start building your rental portfolio by adding your first property. It only takes a few minutes!
      </p>

      {/* Action Button */}
      <button className="flex items-center gap-2 bg-[#A989C8] hover:bg-[#9b7bb8] text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-[#A989C8]/20 hover:shadow-xl hover:-translate-y-0.5">
        <Plus size={20} />
        Add Your First Property
      </button>
    </div>
  );
};

export default EmptyPropertyState;