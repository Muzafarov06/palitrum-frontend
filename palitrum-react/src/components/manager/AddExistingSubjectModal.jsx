import React, { useEffect, useState } from "react";
import { X, Search, BookOpen } from "lucide-react";
import { fetchSubjects, fetchProgramById } from "../../api/api";
import { toast } from "react-toastify";
import CustomSelect from "../common/CustomSelect";
import CustomInput from "../common/CustomInput";

export default function AddExistingSubjectModal({
  isOpen,
  onClose,
  onAdd,
  currentProgramId,
  excludedSubjectIds = [],
  programDurationYears = 4
}) {
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(1);
  const [hoursPerWeek, setHoursPerWeek] = useState(0);
  const [programDuration, setProgramDuration] = useState(programDurationYears);

  useEffect(() => {
    if (isOpen && currentProgramId) {
      loadSubjects();
      if (!programDuration) loadProgramDuration(currentProgramId);
      setSelectedYear(1);
      setHoursPerWeek(0);
    } else {
      setFilter("");
      setAddingId(null);
    }
  }, [isOpen, currentProgramId]);

  const loadProgramDuration = async (programId) => {
    try {
      const program = await fetchProgramById(programId);
      setProgramDuration(program.durationYears || 4);
    } catch (err) {
      console.error("Ошибка загрузки программы", err);
      setProgramDuration(4);
    }
  };

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Не удалось загрузить предметы");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (subjectId) => {
    if (programDuration && selectedYear > programDuration) {
      toast.error(`Год обучения не может превышать длительность программы (${programDuration})`);
      return;
    }
    setAddingId(subjectId);
    try {
      await onAdd(subjectId, selectedYear, hoursPerWeek);
      onClose();
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("Этот предмет уже добавлен в программу для указанного года");
      } else {
        toast.error("Ошибка добавления");
      }
    } finally {
      setAddingId(null);
    }
  };

  const filteredSubjects = subjects.filter(subj =>
    !excludedSubjectIds.includes(subj.id) &&
    (subj.name.toLowerCase().includes(filter.toLowerCase()) ||
     (subj.code && subj.code.toLowerCase().includes(filter.toLowerCase())))
  );

  if (!isOpen) return null;

  const maxYear = programDuration || 8;
  const yearOptions = Array.from({ length: maxYear }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} год`
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] relative shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">Добавить существующий предмет</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Поиск по названию или коду..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="w-48">
              <CustomSelect
                label="Год обучения"
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                required
              />
            </div>
            <div className="w-48">
              <CustomInput
                label="Часов в неделю"
                type="number"
                step="0.5"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <BookOpen size={40} className="mx-auto mb-2 opacity-50" />
              <p>Нет доступных предметов для добавления</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSubjects.map(subj => (
                <div
                  key={subj.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#f6a623] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{subj.name}</div>
                    {subj.code && <div className="text-xs text-gray-500">{subj.code}</div>}
                  </div>
                  <button
                    onClick={() => handleAdd(subj.id)}
                    disabled={addingId === subj.id}
                    className="ml-2 px-3 py-1 bg-[#f6a623] text-white text-sm rounded-lg hover:bg-[#e09515] disabled:opacity-50 transition"
                  >
                    {addingId === subj.id ? "Добавление..." : "Добавить"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
            Закрыть
          </button>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}