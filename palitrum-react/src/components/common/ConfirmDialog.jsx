// components/common/ConfirmDialog.jsx
import React from 'react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Да", cancelText = "Нет" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-[#e09515] text-white rounded-lg hover:shadow-md transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}