// src/components/common/ScheduleGeneratorButton.jsx
import React, { useState } from "react";
import { Sparkles, Settings, Calendar, AlertCircle, X } from "lucide-react";
import { generateScheduleTemplates, smartGenerateSchedule } from "../../api/api";
import { toast } from "react-toastify";

export default function ScheduleGeneratorButton({ periodId, onSuccess, variant = "default" }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    generateGroups: true,
    generateIndividual: true,
    autoAssignTeachers: true,
    autoAssignRooms: true,
    smartMode: true
  });

  const handleGenerate = async () => {
    if (!periodId) {
      toast.error("Выберите учебный период");
      return;
    }

    setIsGenerating(true);
    try {
      const requestData = {
        periodId,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        ...options
      };

      const result = options.smartMode 
        ? await smartGenerateSchedule(requestData)
        : await generateScheduleTemplates(requestData);

      const totalGenerated = (result.generatedGroups || 0) + (result.generatedIndividual || 0);
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(
          <div>
            <p className="font-semibold mb-1">Сгенерировано {totalGenerated} шаблонов</p>
            <p className="text-xs text-orange-600">⚠️ {result.errors.length} ошибок</p>
          </div>
        );
      } else if (totalGenerated > 0) {
        toast.success(`✨ Успешно сгенерировано ${totalGenerated} шаблонов!`);
      } else {
        toast.info("Нет данных для генерации. Проверьте учебные планы и группы.");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Ошибка генерации: " + (err.response?.data?.message || err.message));
    } finally {
      setIsGenerating(false);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !periodId}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? "Генерация..." : "Умная генерация"}
        </button>
        
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 sm:py-2.5 rounded-xl transition flex items-center gap-1"
        >
          <Settings size={16} />
        </button>
      </div>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-gray-800">Настройки генерации</h4>
            <button 
              onClick={() => setShowOptions(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options.generateGroups}
                onChange={(e) => setOptions({...options, generateGroups: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Групповые занятия</span>
            </label>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options.generateIndividual}
                onChange={(e) => setOptions({...options, generateIndividual: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Индивидуальные занятия</span>
            </label>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options.autoAssignTeachers}
                onChange={(e) => setOptions({...options, autoAssignTeachers: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Автоподбор преподавателей</span>
            </label>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options.autoAssignRooms}
                onChange={(e) => setOptions({...options, autoAssignRooms: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Автоподбор аудиторий</span>
            </label>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options.smartMode}
                onChange={(e) => setOptions({...options, smartMode: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">✨ Умное разрешение конфликтов</span>
            </label>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <AlertCircle size={12} className="shrink-0 mt-0.5" />
              <span>Генерация учитывает нагрузку преподавателей, свободные аудитории и учебные планы</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}