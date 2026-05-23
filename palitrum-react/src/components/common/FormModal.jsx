import React from 'react';
import { X } from 'lucide-react';

export default function FormModal({
  title,
  onClose,
  status = null,
  statusColor = "text-gray-600",
  className = "",
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative">
        {/* Фиксированная шапка */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 border-b border-gray-200">
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                  {status && (
                    <div className={`font-medium ${statusColor}`}>{status}</div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Скроллируемое содержимое с кастомным скроллбаром */}
        <div className={`overflow-y-auto flex-1 custom-scrollbar ${className}`}>
          {children}
        </div>
      </div>

      {/* Стили для скрытия скроллбара (но скролл остаётся) */}
      <style jsx>{`
        .custom-scrollbar {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #f6a623;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}