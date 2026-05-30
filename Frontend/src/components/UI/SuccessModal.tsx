import { useEffect } from 'react';
import { Check, Home, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onViewProperty?: () => void;
  isUpdate?: boolean;
}

const SuccessModal = ({
  isOpen,
  title,
  message,
  onClose,
  onViewProperty,
  isUpdate = false,
}: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in scale-in duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-purple-50 to-[#A87DC2]/10" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <div className="relative z-10 px-8 py-12 pt-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-[#A87DC2]/20 rounded-full blur-lg opacity-50" />

              <div className="relative w-24 h-24 bg-gradient-to-br from-[#A87DC2] to-purple-700 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                <Home size={48} className="text-white" />

                <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-4 border-white">
                  <Check size={20} className="text-[#A87DC2] font-bold" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>

          <p className="text-gray-600 leading-relaxed mb-8 text-sm">{message}</p>

          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-[#A87DC2]/30">
              <div className="w-2 h-2 bg-[#A87DC2] rounded-full" />
              <span className="text-xs font-medium text-purple-700">Successfully Completed</span>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            {onViewProperty && !isUpdate && (
              <button
                onClick={onViewProperty}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A87DC2] to-purple-700 text-white font-semibold rounded-xl hover:shadow-lg hover:opacity-95 transition-all transform active:scale-95"
              >
                View Property
              </button>
            )}

            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 ${
                onViewProperty && !isUpdate
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gradient-to-r from-[#A87DC2] to-purple-700 text-white'
              } font-semibold rounded-xl hover:shadow-lg transition-all transform active:scale-95`}
            >
              {onViewProperty && !isUpdate ? 'Close' : 'Done'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {isUpdate
                ? 'Your changes have been saved and are live on your listing.'
                : 'Your property is now visible to potential tenants.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
