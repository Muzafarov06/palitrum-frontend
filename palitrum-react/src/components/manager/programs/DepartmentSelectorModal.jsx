import React, { useState } from "react";
import { X, FolderOpen } from "lucide-react";

export default function DepartmentSelectorModal({ isOpen, onClose, departments, onSelectDepartment }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  const handleSelect = () => {
    if (selectedId) onSelectDepartment(selectedId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] relative shadow-2xl overflow-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition" onClick={handleClose}>
          <X size={22} />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-5">Выберите отделение</h3>
        <div className="flex flex-col gap-2 mb-6">
          {departments.map(d => (
            <button
              key={d.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedId === d.id ? "border-[#f6a623] bg-orange-50 shadow-md" : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => setSelectedId(d.id)}
            >
              <FolderOpen size={20} className={selectedId === d.id ? "text-[#f6a623]" : "text-gray-500"} />
              <span className="flex-1 text-left font-medium">{d.name}</span>
            </button>
          ))}
          {departments.length === 0 && <div className="text-center text-gray-400 py-6">Нет доступных отделений</div>}
        </div>
        <button
          className="w-full bg-[#f6a623] hover:bg-[#e09515] text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSelect}
          disabled={!selectedId}
        >
          Добавить в отделение
        </button>
      </div>
    </div>
  );
}