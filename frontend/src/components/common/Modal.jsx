import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#161B22] border border-[#1F2937] rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1F2937]">
          <h2 className="text-[#E5E7EB] text-2xl font-bold font-Spline-Sans">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#9CA3AF] hover:text-[#E5E7EB]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
