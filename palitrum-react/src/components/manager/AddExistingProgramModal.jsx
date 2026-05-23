// src/components/manager/AddExistingProgramModal.jsx
import React, { useEffect, useState } from "react";
import { X, Search, GraduationCap } from "lucide-react";
import { fetchAllPrograms } from "../../api/api";
import { toast } from "react-toastify";

export default function AddExistingProgramModal({ isOpen, onClose, onAdd, excludedProgramIds = [] }) {
  const [programs, setPrograms] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPrograms();
    } else {
      setFilter("");
      setAddingId(null);
    }
  }, [isOpen]);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPrograms();
      setPrograms(data || []);
    } catch (error) {
      toast.error("Не удалось загрузить программы");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (programId) => {
    setAddingId(programId);
    try {
      await onAdd(programId);
      onClose(); // закрываем после успешного добавления
    } catch (error) {
      toast.error("Ошибка добавления");
    } finally {
      setAddingId(null);
    }
  };

  const filteredPrograms = programs.filter(prog =>
    !excludedProgramIds.includes(prog.id) &&
    prog.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] relative shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">Добавить существующую программу</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск по названию программы..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
              <p>Нет доступных программ для добавления</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredPrograms.map(prog => (
                <div
                  key={prog.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#f6a623] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{prog.name}</div>
                    {prog.durationYears && (
                      <div className="text-xs text-gray-500">{prog.durationYears} лет</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAdd(prog.id)}
                    disabled={addingId === prog.id}
                    className="ml-2 px-3 py-1 bg-[#f6a623] text-white text-sm rounded-lg hover:bg-[#e09515] disabled:opacity-50 transition"
                  >
                    {addingId === prog.id ? "Добавление..." : "Добавить"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}