import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAcademicPeriods,
  fetchScheduleTemplates,
  createScheduleTemplate,
  updateScheduleTemplate,
  deleteScheduleTemplate,
  generateLessons,
} from "../../api/api";
import { Plus, Calendar, Pencil, Trash, Clock, Users, DoorOpen, Play, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomSelect from "../../components/common/CustomSelect";
import ScheduleTemplateFormModal from "../../components/manager/ScheduleTemplate/ScheduleTemplateFormModal";
import ScheduleGeneratorButton from "../../components/common/ScheduleGeneratorButton";

export default function ScheduleTemplatesPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const loadPeriods = async () => {
    try {
      const data = await fetchAcademicPeriods();
      setPeriods(data.content || []);
      if (data.content?.length && !selectedPeriodId) {
        setSelectedPeriodId(data.content[0].id);
      }
    } catch (err) {
      toast.error("Не удалось загрузить учебные периоды");
    }
  };

  const loadTemplates = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    try {
      const data = await fetchScheduleTemplates(selectedPeriodId, page, size);
      setTemplates(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      toast.error("Не удалось загрузить шаблоны расписания");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      loadTemplates();
    }
  }, [selectedPeriodId, page, size]);

  const handlePeriodChange = (value) => {
    setSelectedPeriodId(value);
    setPage(0);
  };

  const handleGenerate = async () => {
    if (!selectedPeriodId) {
      toast.error("Выберите учебный период");
      return;
    }
    setGenerating(true);
    try {
      const result = await generateLessons(selectedPeriodId);
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        toast.error(
          <div>
            <p className="font-semibold mb-1">Ошибки генерации:</p>
            <ul className="list-disc pl-4">
              {result.errors.map((err, i) => (
                <li key={i} className="text-sm">{err}</li>
              ))}
            </ul>
          </div>,
          { autoClose: false }
        );
      } else if (result.generated > 0) {
        toast.success(`Создано ${result.generated} уроков`);
      } else {
        toast.info("Нет шаблонов для генерации");
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        toast.error(
          <div>
            <p className="font-semibold mb-1">Ошибки генерации:</p>
            <ul className="list-disc pl-4">
              {errorData.errors.map((er, i) => (
                <li key={i} className="text-sm">{er}</li>
              ))}
            </ul>
          </div>,
          { autoClose: false }
        );
      } else {
        toast.error("Ошибка генерации: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createScheduleTemplate(data);
      toast.success("Шаблон добавлен");
      loadTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || "Ошибка добавления";
      toast.error(msg);
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    if (!editingTemplate) return;
    try {
      await updateScheduleTemplate(editingTemplate.id, data);
      toast.success("Шаблон обновлён");
      loadTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || "Ошибка обновления";
      toast.error(msg);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteScheduleTemplate(templateToDelete.id);
      toast.success("Шаблон удалён");
      loadTemplates();
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setTemplateToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  const getDayName = (day) => {
    const days = {1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 7: "Вс"};
    return days[day] || day;
  };

  const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));

  // Мобильная карточка шаблона
  const TemplateCard = ({ template }) => {
    const isExpanded = expandedTemplate === template.id;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
        <div className="p-4 cursor-pointer" onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-[#f6a623]/10 text-[#f6a623] text-xs font-medium rounded-full">
                  {getDayName(template.dayOfWeek)}
                </span>
                <span className="text-sm font-medium text-gray-700">{formatTime(template.startTime)} ({template.durationMinutes} мин)</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mt-2 truncate">{template.subjectName}</h3>
              <div className="text-xs text-gray-500 mt-1">
                {template.groupId ? `Группа: ${template.groupName}` : `Студент: ${template.studentName}`}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); setShowForm(true); }}
                className="p-2 text-gray-400 hover:text-[#f6a623] rounded-lg"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setTemplateToDelete(template); }}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
              >
                <Trash size={16} />
              </button>
              {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-[#f6a623] shrink-0" />
              <span className="text-gray-600">Преподаватель:</span>
              <span className="text-gray-800 font-medium">{template.teacherName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DoorOpen size={14} className="text-[#f6a623] shrink-0" />
              <span className="text-gray-600">Аудитория:</span>
              <span className="text-gray-800">{template.roomName || "—"}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 pl-10 md:pl-0">
            <div className="p-1.5 bg-[#f6a623]/10 rounded-lg shrink-0">
              <Clock size={24} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-3xl font-bold text-gray-800">Шаблоны расписания</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5 hidden sm:block">Управление шаблонами и генерация уроков</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Кнопка генерации уроков (существующая) */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition disabled:opacity-50"
            >
              <Play size={16} /> {generating ? "Генерация..." : "Генерация уроков"}
            </button>

            {/* Кнопка умной генерации шаблонов */}
            <ScheduleGeneratorButton 
              periodId={selectedPeriodId} 
              onSuccess={loadTemplates}
            />

            {/* Кнопка добавления шаблона */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f6a623] hover:bg-[#e09515] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl flex items-center gap-1 sm:gap-2 text-sm sm:text-base transition"
            >
              <Plus size={16} /> Добавить
            </button>
          </div>
        </div>

        {/* Фильтр по периоду */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm mb-3 sm:mb-4 flex-shrink-0">
          <div className="w-full sm:w-64">
            <CustomSelect
              label="Учебный период"
              value={selectedPeriodId}
              onChange={handlePeriodChange}
              options={periodOptions}
              required
              clearable={false}
            />
          </div>
        </div>

        {/* Список шаблонов */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading && <div className="text-center py-12 text-sm">Загрузка...</div>}
          {!loading && templates.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Нет шаблонов для выбранного периода</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-[#f6a623] hover:text-[#e09515] text-sm font-medium"
              >
                + Создать первый шаблон
              </button>
            </div>
          )}
          {!loading && templates.length > 0 && (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">День</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Время</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Предмет</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Группа/Студент</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Преподаватель</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">Комната</th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {templates.map(tpl => (
                        <tr key={tpl.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 sm:px-6 py-3 text-sm">{getDayName(tpl.dayOfWeek)}</td>
                          <td className="px-4 sm:px-6 py-3 text-sm">{formatTime(tpl.startTime)} ({tpl.durationMinutes} мин)</td>
                          <td className="px-4 sm:px-6 py-3 text-sm">{tpl.subjectName}</td>
                          <td className="px-4 sm:px-6 py-3 text-sm">{tpl.groupId ? `Группа: ${tpl.groupName}` : `Студент: ${tpl.studentName}`}</td>
                          <td className="px-4 sm:px-6 py-3 text-sm">{tpl.teacherName}</td>
                          <td className="px-4 sm:px-6 py-3 text-sm">{tpl.roomName}</td>
                          <td className="px-4 sm:px-6 py-3 text-right">
                            <button onClick={() => { setEditingTemplate(tpl); setShowForm(true); }} className="text-gray-500 hover:text-[#f6a623] p-1"><Pencil size={16} /></button>
                            <button onClick={() => setTemplateToDelete(tpl)} className="ml-2 text-gray-500 hover:text-red-500 p-1"><Trash size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {templates.map(tpl => (
                  <TemplateCard key={tpl.id} template={tpl} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 py-2 flex-shrink-0">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="px-2 sm:px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 sm:px-3 py-1 text-sm">Страница {page + 1} из {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-2 sm:px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ScheduleTemplateFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingTemplate(null); }}
        onSubmit={editingTemplate ? handleUpdate : handleCreate}
        initialData={editingTemplate}
        periodId={selectedPeriodId}
      />

      <ConfirmDialog
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить шаблон"
        message="Вы уверены, что хотите удалить этот шаблон?"
      />

      <ToastContainer position="top-right" autoClose={3000} />
      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}