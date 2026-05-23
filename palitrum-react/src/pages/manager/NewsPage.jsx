// src/pages/manager/NewsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  replaceFiles,
  deleteAllFilesForEntity,
} from "../../api/api";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import FormModal from "../../components/common/FormModal";
import CustomInput from "../../components/common/CustomInput";
import CustomTextarea from "../../components/common/CustomTextarea";
import CustomSelect from "../../components/common/CustomSelect";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import { Plus, Newspaper, LayoutGrid, List, Download, Upload, Calendar, Eye, Pin, Globe, Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import API from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_NEWS_IMG = "/default-news.png";

// Компонент карточки (сетка)
const NewsCard = ({ news, imageUrl, onEdit, onDelete, isAdmin }) => {
  const formatDate = (date) => date ? format(new Date(date), "dd MMM yyyy", { locale: ru }) : "";
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img src={imageUrl} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 flex gap-2">
          {news.pinned && <span className="bg-[#f6a623] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Pin size={12} /> Закреплено</span>}
          {isAdmin && (news.isPublic ? 
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Globe size={12} /> Публично</span> :
            <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><Eye size={12} /> Приватно</span>
          )}
        </div>
        {isAdmin && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-[#e09515] hover:text-white"><Pencil size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-[#e09515] hover:text-white"><Trash size={16} /></button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{news.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3 mt-2">{news.content}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400 border-t pt-2">
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(news.publishedAt || news.createdAt)}</span>
          {isAdmin && news.authorName && <span className="truncate max-w-[150px]">Автор: {news.authorName}</span>}
        </div>
      </div>
    </div>
  );
};

// Компонент карточки (список)
const NewsListCard = ({ news, imageUrl, onEdit, onDelete, isAdmin }) => {
  const formatDate = (date) => date ? format(new Date(date), "dd MMM yyyy", { locale: ru }) : "";
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 p-4">
      <img src={imageUrl} alt={news.title} className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg" />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{news.title}</h3>
          {news.pinned && <span className="bg-[#f6a623] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Pin size={12} /> Закреплено</span>}
          {isAdmin && (news.isPublic ? 
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Globe size={12} /> Публично</span> :
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Eye size={12} /> Приватно</span>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{news.content}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(news.publishedAt || news.createdAt)}</span>
            {isAdmin && news.authorName && <span>Автор: {news.authorName}</span>}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={onEdit} className="p-1 hover:text-[#f6a623] transition"><Pencil size={16} /></button>
              <button onClick={onDelete} className="p-1 hover:text-[#e09515] transition"><Trash size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Модальное окно для новостей
const NewsFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setContent(initialData.content || "");
        setIsPublic(initialData.isPublic ?? true);
        setPinned(initialData.pinned ?? false);
        setImagePreview(initialData.imageUrl || null);
      } else {
        setTitle("");
        setContent("");
        setIsPublic(true);
        setPinned(false);
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else toast.warning("Выберите корректное изображение");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error("Заголовок обязателен");
    if (!content.trim()) return toast.error("Содержание обязательно");
    if (!user?.id) return toast.error("Ошибка: не удалось определить автора");

    const data = { title: title.trim(), content: content.trim(), isPublic, pinned, authorId: user.id };
    const deleteOldImage = (initialData?.imageUrl && !imageFile && imagePreview === null);
    
    setUploading(true);
    try {
      await onSubmit(data, imageFile, deleteOldImage);
      onClose();
    } catch (err) {
      // ошибка уже обработана
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal title={initialData ? "Редактировать новость" : "Добавить новость"} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomInput label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <CustomTextarea label="Содержание" value={content} onChange={(e) => setContent(e.target.value)} rows={5} required />
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <CustomSelect 
              label="Публичность" 
              value={isPublic ? "true" : "false"} 
              onChange={(val) => setIsPublic(val === "true")} 
              options={[{ value: "true", label: "Публичная" }, { value: "false", label: "Только для админов" }]} 
              clearable={false} 
            />
          </div>
          <div className="flex-1">
            <CustomSelect 
              label="Закрепление" 
              value={pinned ? "true" : "false"} 
              onChange={(val) => setPinned(val === "true")} 
              options={[{ value: "true", label: "Закрепить" }, { value: "false", label: "Не закреплять" }]} 
              clearable={false} 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <span className="text-xs px-1">✕</span>
                </button>
              </div>
            )}
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-100 transition">
              <Upload size={18} className="text-[#f6a623]" />
              <span className="text-sm text-gray-600">
                {imageFile ? imageFile.name : (initialData?.imageUrl ? "Заменить изображение" : "Выбрать изображение")}
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">Рекомендуемый размер: до 5 МБ, форматы JPG, PNG, WEBP</p>
        </div>
        <button onClick={handleSubmit} disabled={uploading} className="w-full bg-[#f6a623] text-white py-2.5 rounded-lg hover:bg-[#ad7822] transition disabled:opacity-50">
          {uploading ? "Сохранение..." : (initialData ? "Сохранить изменения" : "Добавить новость")}
        </button>
      </div>
    </FormModal>
  );
};

// Основная страница
export default function NewsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPublicFilter, setIsPublicFilter] = useState(null);
  const [pinnedFilter, setPinnedFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const params = { search: searchQuery, page, size };
      if (isAdmin) {
        if (isPublicFilter !== null) params.isPublic = isPublicFilter;
        if (pinnedFilter !== null) params.pinned = pinnedFilter;
      } else {
        params.isPublic = true;
      }
      const data = await fetchNews(params);
      setNews(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      toast.error("Не удалось загрузить новости");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [searchQuery, isPublicFilter, pinnedFilter, page, size]);

  const handleCreate = async (data, imageFile, deleteOldImage) => {
    try {
      const newNews = await createNews(data);
      if (imageFile) await replaceFiles("NEWS", newNews.id, [imageFile]);
      toast.success("Новость добавлена");
      await loadNews();
      return newNews;
    } catch (err) {
      toast.error("Ошибка добавления");
      throw err;
    }
  };

  const handleUpdate = async (data, imageFile, deleteOldImage) => {
    if (!editingNews) return;
    try {
      await updateNews(editingNews.id, data);
      if (deleteOldImage) await deleteAllFilesForEntity("NEWS", editingNews.id);
      if (imageFile) await replaceFiles("NEWS", editingNews.id, [imageFile]);
      toast.success("Новость обновлена");
      await loadNews();
    } catch (err) {
      toast.error("Ошибка обновления");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;
    try {
      await deleteAllFilesForEntity("NEWS", newsToDelete.id);
      await deleteNews(newsToDelete.id);
      toast.success("Новость удалена");
      await loadNews();
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setNewsToDelete(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/news/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'news_template.xlsx');
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
      await API.post('/api/import/news/excel', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Импорт завершён');
      await loadNews();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const boolOptions = [
    { value: "", label: "Все статусы" },
    { value: "true", label: "Да" },
    { value: "false", label: "Нет" }
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <Newspaper size={32} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Новости</h1>
              <p className="text-gray-500 text-sm mt-1">Актуальные события и объявления</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-1.5 border border-[#f6a623] text-[#f6a623] hover:bg-[#f6a623] hover:text-white rounded-lg px-3 py-2 text-sm transition"
              >
                <Download size={16} /> Шаблон
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-2 text-sm transition"
              >
                <Upload size={16} /> Импорт
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition"
              >
                <Plus size={18} /> Добавить
              </button>
            </div>
          )}
        </div>

        {/* Поиск и фильтры */}
        <div className="flex flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <CustomSearchInput
                value={searchQuery}
                onChange={(v) => { setSearchQuery(v); setPage(0); }}
                placeholder="Поиск по заголовку..."
              />
            </div>
            {isAdmin && (
              <>
                <div className="w-full sm:w-48">
                  <CustomSelect
                    value={isPublicFilter === null ? "" : String(isPublicFilter)}
                    onChange={(v) => { setIsPublicFilter(v === "" ? null : v === "true"); setPage(0); }}
                    options={[
                      { value: "", label: "Публичность" },
                      { value: "true", label: "Публичные" },
                      { value: "false", label: "Только для админов" }
                    ]}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <CustomSelect
                    value={pinnedFilter === null ? "" : String(pinnedFilter)}
                    onChange={(v) => { setPinnedFilter(v === "" ? null : v === "true"); setPage(0); }}
                    options={[
                      { value: "", label: "Закрепление" },
                      { value: "true", label: "Закрепленные" },
                      { value: "false", label: "Обычные" }
                    ]}
                  />
                </div>
              </>
            )}
          </div>
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

        {/* Счетчик */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2 flex-shrink-0">
          <div>Всего новостей: {total}</div>
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

        {/* Список новостей */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
            </div>
          )}
          {!loading && news.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Новостей не найдено</p>
            </div>
          )}
          {!loading && news.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {news.map(item => (
                <NewsCard
                  key={item.id}
                  news={item}
                  imageUrl={item.imageUrl || DEFAULT_NEWS_IMG}
                  onEdit={() => { setEditingNews(item); setShowAddModal(true); }}
                  onDelete={() => setNewsToDelete(item)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
          {!loading && news.length > 0 && viewMode === "list" && (
            <div className="space-y-3 pb-6">
              {news.map(item => (
                <NewsListCard
                  key={item.id}
                  news={item}
                  imageUrl={item.imageUrl || DEFAULT_NEWS_IMG}
                  onEdit={() => { setEditingNews(item); setShowAddModal(true); }}
                  onDelete={() => setNewsToDelete(item)}
                  isAdmin={isAdmin}
                />
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
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm">
              Страница {page + 1} из {totalPages}
            </span>
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

      <NewsFormModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingNews(null); }}
        onSubmit={editingNews ? handleUpdate : handleCreate}
        initialData={editingNews}
      />
      <ConfirmDialog
        isOpen={!!newsToDelete}
        onClose={() => setNewsToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить новость"
        message={`Вы уверены, что хотите удалить новость "${newsToDelete?.title}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}