import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500'
  };

  return (
    <div className={`
      flex items-center gap-3 w-full max-w-sm bg-white p-4 rounded-lg shadow-lg border border-slate-100 border-l-4 
      ${borderColors[notification.type]} 
      animate-slide-up mb-3
    `}>
      <div className="flex-shrink-0">
        {icons[notification.type]}
      </div>
      <p className="flex-1 text-sm font-medium text-slate-700">{notification.message}</p>
      <button 
        onClick={() => onClose(notification.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;