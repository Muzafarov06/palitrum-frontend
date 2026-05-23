// src/pages/manager/PositionsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import CustomSelect from "../../components/common/CustomSelect";
import AddButton from "../../components/common/AddButton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PositionFormModal from "../../components/manager/positions/PositionFormModal";
import PositionTableRow from "../../components/manager/positions/PositionTableRow";
import PositionCard from "../../components/manager/positions/PositionCard";
import { BadgeCheck, GraduationCap, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PositionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [positionToDelete, setPositionToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/positions");
      setPositions(res.data);
    } catch {
      toast.error("Не удалось загрузить должности");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const filteredPositions = positions.filter((pos) => {
    const matchesSearch = pos.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "teaching" && pos.isTeaching) ||
      (typeFilter === "admin" && !pos.isTeaching);
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredPositions.length / size);
  const paginatedPositions = filteredPositions.slice(page * size, (page + 1) * size);

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const teachingCount = positions.filter((p) => p.isTeaching).length;
  const adminCount = positions.length - teachingCount;

  const handleSave = async (data, id) => {
    setSubmitting(true);
    try {
      if (id) {
        await API.put(`/api/positions/${id}`, data);
        toast.success("Должность обновлена");
      } else {
        await API.post("/api/positions", data);
        toast.success("Должность добавлена");
      }
      await fetchPositions();
      setPage(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка сохранения");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!positionToDelete) return;
    try {
      await API.delete(`/api/positions/${positionToDelete.id}`);
      toast.success("Должность удалена");
      await fetchPositions();
      if (paginatedPositions.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch {
      toast.error("Ошибка удаления");
    } finally {
      setPositionToDelete(null);
    }
  };

  const openEditModal = (position) => {
    setEditingPosition(position);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingPosition(null);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setPage(0);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(0);
  };

  // Импорт
  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/positions/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'positions_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон должностей скачан");
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
      await API.post('/api/import/positions/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт должностей завершён');
      await fetchPositions();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Заголовок и кнопки */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="p-2.5 bg-[#f6a623]/10 rounded-xl">
              <BadgeCheck size={32} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Должности</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{positions.length} должностей</span>
                {teachingCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-[#e09515] bg-[#f6a623]/10 px-2 py-0.5 rounded-full">
                    <GraduationCap size={12} /> {teachingCount} учебных
                  </span>
                )}
                {adminCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck size={12} /> {adminCount} административных
                  </span>
                )}
              </div>
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
            <AddButton onClick={() => setShowAddModal(true)} label="Добавить должность" shortLabel="Должность" />
          </div>
        </div>

        {/* Поиск и фильтр */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 flex-shrink-0">
          <div className="flex-1 min-w-[200px]">
            <CustomSelect
              value={typeFilter}
              onChange={handleTypeChange}
              options={[
                { value: "all", label: "Все типы" },
                { value: "teaching", label: "Учебные" },
                { value: "admin", label: "Административные" },
              ]}
              placeholder="Тип должности"
              clearable={false}
            />
          </div>
          <div className="w-full sm:w-64">
            <CustomSearchInput
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Поиск..."
              setPage={() => setPage(0)}
            />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 overflow-hidden min-h-0">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
            </div>
          )}
          {!loading && filteredPositions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
              <BadgeCheck size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500">Нет должностей</p>
              <p className="text-sm text-gray-400 mt-1">Добавьте первую должность, чтобы начать формировать штат</p>
            </div>
          )}
          {!loading && filteredPositions.length > 0 && (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="overflow-x-auto h-full">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Часы на ставку</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Тип</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedPositions.map((pos) => (
                        <PositionTableRow
                          key={pos.id}
                          position={pos}
                          onEdit={openEditModal}
                          onDelete={setPositionToDelete}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden space-y-3 overflow-y-auto h-full pr-1">
                {paginatedPositions.map((pos) => (
                  <PositionCard
                    key={pos.id}
                    position={pos}
                    onEdit={openEditModal}
                    onDelete={setPositionToDelete}
                  />
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
            <span className="px-3 py-1 text-sm">Страница {page + 1} из {totalPages}</span>
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

      <PositionFormModal
        isOpen={showAddModal}
        onClose={closeModal}
        onSubmit={handleSave}
        initialData={editingPosition}
      />
      <ConfirmDialog
        isOpen={!!positionToDelete}
        onClose={() => setPositionToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить должность"
        message={`Вы уверены, что хотите удалить должность "${positionToDelete?.name}"? Это действие нельзя отменить.`}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}