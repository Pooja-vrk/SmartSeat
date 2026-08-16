// Toast notification component
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      textColor: 'text-green-800'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      iconColor: 'text-red-600',
      textColor: 'text-red-800'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = types[type];

  return (
    <div
      className={`fixed ${positions[position]} z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md`}>
        <Icon className={`${iconColor} w-5 h-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`text-gray-400 hover:text-gray-600 transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
