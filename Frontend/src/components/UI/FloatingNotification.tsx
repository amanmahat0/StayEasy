import { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface FloatingNotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose: () => void;
}

const FloatingNotification = ({
  message,
  type = 'success',
  duration = 4000,
  onClose,
}: FloatingNotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-8 py-6 ${bgColor} text-white rounded-lg shadow-2xl animate-in fade-in scale-in duration-300 z-50 max-w-md`}
    >
      <Icon size={20} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default FloatingNotification;
