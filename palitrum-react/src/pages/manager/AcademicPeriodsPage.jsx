// src/pages/manager/AcademicPeriodsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchAcademicPeriods,
  fetchAcademicPeriodsStatistics,
  createAcademicPeriod,
  updateAcademicPeriod,
  deleteAcademicPeriod,
} from "../../api/api";
import { Plus, Calendar, Pencil, Trash, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import AcademicPeriodFormModal from "../../components/manager/AcademicPeriod/AcademicPeriodFormModal";
import AddButton from "../../components/common/AddButton";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function AcademicPeriodsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [periods, setPeriods] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0, SEMESTER: 0, QUARTER: 0, YEAR: 0, current: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [periodToDelete, setPeriodToDelete] = useState(null);

  const fileInputRef = useRef(null);

  const loadStatistics = async () => {
    try {
      const stats = await fetchAcademicPeriodsStatistics();
      setStatistics(stats);
    } catch (err) {
      console.warn("Не удалось загрузить статистику");
    }
  };

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const data = await fetchAcademicPeriods(searchQuery, page, size);
      setPeriods(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      toast.error("Не удалось загрузить учебные периоды");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [searchQuery, page, size]);

  const handleCreate = async (data) => {
    try {
      await createAcademicPeriod(data);
      toast.success("Период добавлен");
      loadPeriods();
      loadStatistics();
    } catch (err) {
      toast.error("Ошибка добавления");
      throw err;
    }
  };

  const handleUpdate = async (data) => {
    if (!editingPeriod) return;
    try {
      await updateAcademicPeriod(editingPeriod.id, data);
      toast.success("Период обновлён");
      loadPeriods();
      loadStatistics();
    } catch (err) {
      toast.error("Ошибка обновления");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!periodToDelete) return;
    try {
      await deleteAcademicPeriod(periodToDelete.id);
      toast.success("Период удалён");
      loadPeriods();
      loadStatistics();
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setPeriodToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ru-RU");
  };

  const getPeriodTypeLabel = (type) => {
    const labels = { SEMESTER: "Семестр", QUARTER: "Четверть", YEAR: "Год" };
    return labels[type] || type;
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/academic-periods/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'academic_periods_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/academic-periods/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт завершён');
      await loadPeriods();
      await loadStatistics();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="w-full h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <Calendar size={32} className="text-[#f6a623]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Учебные периоды</h1>
              <p className="text-gray-500 text-sm mt-1">Семестры, четверти, учебные годы</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 border border-[#f6a623] text-[#f6a623] hover:bg-[#f6a623] hover:text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Шаблон</span>
                  <span className="sm:hidden">Шаблон</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Импорт</span>
                  <span className="sm:hidden">Импорт</span>
                </button>
              </>
            )}
            <AddButton onClick={() => setShowAddModal(true)} label="Добавить период" shortLabel="Период" />
          </div>
          <div className="w-48 sm:w-72">
              <CustomSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск..."
                setPage={() => setPage(0)}
              />
            </div>
        </div>

        {/* Статистика */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-[#f6a623]" />
            <span>Всего: <strong>{statistics.total}</strong></span>
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">Семестров: {statistics.SEMESTER}</div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">Четвертей: {statistics.QUARTER}</div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">Годов: {statistics.YEAR}</div>
          {statistics.current > 0 && (
            <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Текущих: {statistics.current}
            </div>
          )}
        </div>

        {/* Таблица/карточки */}
        <div className="flex-1 overflow-hidden min-h-0">
          {loading && <div className="text-center py-12">Загрузка...</div>}
          {!loading && periods.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Нет учебных периодов</p>
            </div>
          )}
          {!loading && periods.length > 0 && (
            <>
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="overflow-x-auto h-full">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Название</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Начало</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Окончание</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Тип</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Текущий</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {periods.map((period) => (
                        <tr key={period.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-900">{period.name}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(period.startDate)}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(period.endDate)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 whitespace-nowrap">
                              {getPeriodTypeLabel(period.periodType)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {period.isCurrent ? (
                              <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 whitespace-nowrap">Да</span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">Нет</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => { setEditingPeriod(period); setShowEditModal(true); }}
                              className="text-gray-500 hover:text-[#f6a623] transition p-1"
                              title="Редактировать"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setPeriodToDelete(period)}
                              className="ml-2 text-gray-500 hover:text-[#f6a623] transition p-1"
                              title="Удалить"
                            >
                              <Trash size={16} />
                            </button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden space-y-3 overflow-y-auto h-full pr-1">
                {periods.map((period) => (
                  <div
                    key={period.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{period.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(period.startDate)} – {formatDate(period.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingPeriod(period); setShowEditModal(true); }}
                          className="text-gray-400 hover:text-[#f6a623] p-1"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setPeriodToDelete(period)}
                          className="text-gray-400 hover:text-[#f6a623] p-1"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        period.isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {period.isCurrent ? 'Текущий' : 'Не активен'}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {getPeriodTypeLabel(period.periodType)}
                      </span>
                    </div>
                  </div>
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
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1">Страница {page + 1} из {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <AcademicPeriodFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreate}
      />
      <AcademicPeriodFormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingPeriod(null); }}
        onSubmit={handleUpdate}
        initialData={editingPeriod}
      />
      <ConfirmDialog
        isOpen={!!periodToDelete}
        onClose={() => setPeriodToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить учебный период"
        message={`Вы уверены, что хотите удалить период "${periodToDelete?.name}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}