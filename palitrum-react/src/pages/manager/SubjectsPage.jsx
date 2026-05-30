// src/pages/manager/SubjectsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BookOpen, Plus, LayoutGrid, List, Clock, Pencil, Trash,
  Download, Upload, Menu, ChevronDown, ChevronUp
} from "lucide-react";

import API from "../../api/api";
import {
  fetchSubjects, createSubject, updateSubject, deleteSubject,
  uploadFiles, getFilesByEntity, deleteFile
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import SubjectModal from "../../components/manager/subject/SubjectModal";
import AddButton from "../../components/common/AddButton"; // если есть, иначе заменить на обычный <button>

const DEFAULT_SUBJECT_IMG = "/default-program.png";

export default function SubjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN"].includes(r));

  const [subjects, setSubjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const fileInputRef = useRef(null);

  // Загрузка предметов (клиентская фильтрация и пагинация)
  const loadSubjects = async () => {
    setLoading(true);
    try {
      let data = await fetchSubjects();
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        data = data.filter(s =>
          s.name.toLowerCase().includes(lower) ||
          (s.code && s.code.toLowerCase().includes(lower))
        );
      }
      // Пагинация на клиенте
      const start = page * size;
      const paginated = data.slice(start, start + size);
      setSubjects(paginated);
      setTotal(data.length);
    } catch (err) {
      toast.error("Не удалось загрузить предметы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [searchQuery, page, size]);

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  // Обработчики CRUD
  const handleCreateSubject = async (data, imageFile) => {
    if (!isAdmin) throw new Error("Недостаточно прав");
    try {
      const newSubject = await createSubject(data);
      if (imageFile) {
        await uploadFiles(newSubject.id, "SUBJECT", [imageFile]);
      }
      toast.success("Предмет создан");
      await loadSubjects();
      return newSubject;   // <--- обязательно
    } catch (err) {
      toast.error("Ошибка создания");
      throw err;
    }
  };

  const handleUpdateSubject = async (data, imageFile, deleteOldImage = false) => {
    if (!isAdmin || !editingSubject) throw new Error("Недостаточно прав");
    try {
      const updated = await updateSubject(editingSubject.id, data);
      if (deleteOldImage) {
        const files = await getFilesByEntity("SUBJECT", editingSubject.id);
        if (files?.[0]?.id) await deleteFile(files[0].id);
      }
      if (imageFile) {
        await uploadFiles(editingSubject.id, "SUBJECT", [imageFile]);
      }
      toast.success("Предмет обновлён");
      await loadSubjects();
      return updated;   // <--- обязательно
    } catch (err) {
      toast.error("Ошибка обновления");
      throw err;
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      const files = await getFilesByEntity("SUBJECT", subjectToDelete.id);
      if (files?.[0]?.id) await deleteFile(files[0].id);
      await deleteSubject(subjectToDelete.id);
      toast.success("Предмет удалён");
      await loadSubjects();
      if (editingSubject?.id === subjectToDelete.id) setEditingSubject(null);
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setSubjectToDelete(null);
    }
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setShowEditModal(true);
  };

  // Импорт/шаблон
  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/subjects/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'subjects_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/subjects/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт завершён');
      await loadSubjects();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const formatHours = (hours) => {
    if (!hours || hours === 0) return "";
    const lastDigit = hours % 10;
    const lastTwo = hours % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return `${hours} часов`;
    if (lastDigit === 1) return `${hours} час`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${hours} часа`;
    return `${hours} часов`;
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Шапка */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <BookOpen size={32} className="text-[#f6a623]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Предметы</h1>
              <p className="text-gray-500 text-sm mt-1">Управление образовательными дисциплинами</p>
            </div>
          </div>

          {/* Правая часть: кнопки + поиск */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Кнопка мобильных фильтров */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
              >
                <span>Предметы</span>
                {showMobileFilters ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
              </button>

              {isAdmin && (
                <>
                  <button onClick={downloadTemplate} className="flex items-center gap-1.5 border border-[#f6a623] text-[#f6a623] hover:bg-[#f6a623] hover:text-white rounded-lg px-3 py-1.5 text-sm font-medium transition">
                    <Download size={16} />
                    <span className="hidden sm:inline">Шаблон</span>
                    <span className="sm:hidden">Шаблон</span>
                  </button>
                  <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Импорт</span>
                    <span className="sm:hidden">Импорт</span>
                  </button>
                </>
              )}
              {isAdmin && (
                <AddButton onClick={() => setShowAddModal(true)} label="Добавить предмет" shortLabel="Предмет" />
              )}
            </div>

            {/* Поиск */}
            <div className="flex-1 min-w-[150px] sm:w-40 lg:w-72 max-w-full w-full sm:w-auto">
              <CustomSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск по названию или коду..."
                setPage={() => setPage(0)}
              />
            </div>
          </div>
        </div>

        {/* Мобильная панель фильтров (оверлей) */}
        {showMobileFilters && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">Фильтры и вид</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
              </div>
              {/* Тут можно добавить дополнительные фильтры, если понадобятся */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg flex items-center gap-1 ${viewMode === "grid" ? "bg-[#f6a623] text-white" : "bg-white text-gray-500 border"}`}
                >
                  <LayoutGrid size={18} /> Сетка
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg flex items-center gap-1 ${viewMode === "list" ? "bg-[#f6a623] text-white" : "bg-white text-gray-500 border"}`}
                >
                  <List size={18} /> Список
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Переключатель вида (десктоп) */}
        <div className="hidden sm:flex justify-end mb-2">
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Счетчик и размер страницы */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2 flex-shrink-0">
          <div>Найдено предметов: {total}</div>
          <div className="flex items-center gap-2">
            <span>Показывать:</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="border rounded-md p-1 text-sm"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>

        {/* Список предметов */}
        <div className="flex-1 overflow-y-auto min-h-0 hide-scrollbar">
          {loading && <div className="text-center py-12">Загрузка...</div>}
          {!loading && subjects.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Нет предметов, соответствующих критериям</p>
            </div>
          )}
          {!loading && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={subject.imageUrl || DEFAULT_SUBJECT_IMG}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={subject.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                    {subject.code && (
                      <div className="absolute top-2 left-2 bg-[#f6a623]/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {subject.code}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg truncate">{subject.name}</h3>
                    {subject.standardHoursPerWeek > 0 && (
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={14} className="text-[#f6a623]" />
                        {formatHours(subject.standardHoursPerWeek)}/нед
                      </div>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                      {subject.description || "Нет описания"}
                    </p>
                    {isAdmin && (
                      <div className="flex justify-end gap-2 mt-3 pt-2 border-t">
                        <button
                          onClick={() => openEditModal(subject)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#f6a623] transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setSubjectToDelete(subject)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#f6a623] transition"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && viewMode === "list" && (
            <div className="space-y-3 pb-6">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-wrap items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={subject.imageUrl || DEFAULT_SUBJECT_IMG}
                      className="w-full h-full object-cover"
                      alt={subject.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{subject.name}</h3>
                      {subject.code && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{subject.code}</span>}
                    </div>
                    {subject.standardHoursPerWeek > 0 && (
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-[#f6a623]" />
                        {formatHours(subject.standardHoursPerWeek)}/нед
                      </div>
                    )}
                    {subject.description && (
                      <p className="text-sm text-gray-500 truncate mt-1">{subject.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(subject)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Pencil size={16} className="hover:text-[#f6a623]" />
                      </button>
                      <button onClick={() => setSubjectToDelete(subject)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <Trash size={16} className="hover:text-[#f6a623]" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              Назад
            </button>
            <span className="px-3 py-1">Страница {page + 1} из {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>

      {/* Модалки */}
      <SubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateSubject}
      />
      <SubjectModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingSubject(null); }}
        onSubmit={handleUpdateSubject}
        initialData={editingSubject}
      />
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteSubject}
        title="Удалить предмет"
        message={`Вы уверены, что хотите удалить предмет "${subjectToDelete?.name}"? Все связи с программами будут потеряны.`}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}