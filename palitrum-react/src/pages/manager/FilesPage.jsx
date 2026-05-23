// src/pages/manager/FilesPage.jsx
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteFile, fetchAllFiles, fetchFilesStatistics } from "../../api/api";
import { 
  Database, LayoutGrid, List, FileText, ChevronLeft, ChevronRight, 
  RefreshCw, Filter, X, Trash, Calendar 
} from "lucide-react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomSelect from "../../components/common/CustomSelect";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// ==================== Константы и утилиты ====================
const FILE_ENTITY_TYPE_LABELS = {
  APPLICATION: "Заявка",
  NEWS: "Новость",
  ROOM: "Помещение",
  SUBJECT: "Предмет",
  USER: "Пользователь",
  PROGRAM: "Программа",
  GROUP: "Группа",
};

const formatSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (dateStr, short = false) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (short) {
    return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
  }
  return format(date, "dd MMM yyyy, HH:mm", { locale: ru });
};

// ==================== Карточка статистики ====================
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-[#f6a623]/10">
        <Icon size={24} className="text-[#f6a623]" />
      </div>
    </div>
  </div>
);

// ==================== Компонент карточки (сетка) ====================
const FileCard = ({ file, onDelete }) => {
  const isImage = file.fileType?.startsWith("image/");
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {isImage ? (
          <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" />
        ) : (
          <FileText size={48} className="text-gray-400" />
        )}
        <button
          onClick={() => onDelete(file)}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-gray-600 hover:bg-[#f6a623] hover:text-white transition-all opacity-0 group-hover:opacity-100"
          title="Удалить файл"
        >
          <Trash size={16} />
        </button>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-white">
          {formatSize(file.fileSize)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{file.fileName}</h3>
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Тип:</span>
            <span className="font-mono">{FILE_ENTITY_TYPE_LABELS[file.entityType] || file.entityType}</span>
          </div>
          <div className="flex justify-between">
            <span>ID сущности:</span>
            <span>{file.entityId}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-gray-400">
            <Calendar size={12} />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== Компонент карточки (список) ====================
const FileListCard = ({ file, onDelete }) => {
  const isImage = file.fileType?.startsWith("image/");
  return (
    <div className="w-full group bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4">
      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
        {isImage ? (
          <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <FileText size={24} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 truncate text-sm sm:text-base">{file.fileName}</div>
        <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-1">
          <span>{FILE_ENTITY_TYPE_LABELS[file.entityType] || file.entityType} / ID {file.entityId}</span>
          <span>{formatSize(file.fileSize)}</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(file.uploadedAt, true)}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(file)}
        className="self-end sm:self-center bg-white/90 p-1.5 rounded-full text-gray-600 hover:bg-[#f6a623] hover:text-white transition-all opacity-0 group-hover:opacity-100"
        title="Удалить"
      >
        <Trash size={16} />
      </button>
    </div>
  );
};

// ==================== Компонент фильтров с CustomSelect ====================
const FileFilters = ({ entityType, onEntityTypeChange, entityId, onEntityIdChange, fileName, onFileNameChange }) => {
  const typeOptions = [
    { value: "", label: "Все типы" },
    ...Object.entries(FILE_ENTITY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <CustomSelect
          label="Тип сущности"
          value={entityType || ""}
          onChange={onEntityTypeChange}
          options={typeOptions}
          placeholder="Выберите тип"
          clearable
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">ID сущности</label>
        <input
          type="number"
          value={entityId || ""}
          onChange={(e) => onEntityIdChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="ID"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Имя файла</label>
        <input
          type="text"
          value={fileName || ""}
          onChange={(e) => onFileNameChange(e.target.value)}
          placeholder="Поиск по имени..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50"
        />
      </div>
    </div>
  );
};

// ==================== Главный компонент страницы ====================
export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({ total: 0 });
  const [fileToDelete, setFileToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState(null);
  const [fileName, setFileName] = useState("");

  const loadStatistics = async () => {
    try {
      const stats = await fetchFilesStatistics();
      setStatistics(stats || { total: 0 });
    } catch (err) {
      console.error("Ошибка загрузки статистики:", err);
      setStatistics({ total: 0 });
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllFiles(page, size);
      setFiles(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      toast.error("Ошибка загрузки файлов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    loadFiles();
  }, [page, size]);

  const handleDelete = async () => {
    if (!fileToDelete) return;
    try {
      await deleteFile(fileToDelete.id);
      toast.success("Файл удалён");
      loadFiles();
      loadStatistics();
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setFileToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleRefresh = () => {
    loadFiles();
    loadStatistics();
  };

  const statItems = [
    { key: "APPLICATION", title: "Заявки", icon: FileText },
    { key: "NEWS", title: "Новости", icon: FileText },
    { key: "ROOM", title: "Помещения", icon: FileText },
    { key: "SUBJECT", title: "Предметы", icon: FileText },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full flex flex-col p-3 sm:p-6">
        {/* Заголовок */}
        <div className="flex items-center gap-3 pl-10 md:pl-0 mb-4 flex-shrink-0">
          <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
            <Database size={24} className="text-[#f6a623]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Файлы</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Управление загруженными файлами</p>
          </div>
        </div>

        {/* Кнопка показа/скрытия статистики (мобильные) */}
        <div className="flex items-center justify-end mb-2 flex-shrink-0 md:hidden">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 text-xs text-[#f6a623] font-medium"
          >
            {showStats ? <X size={14} /> : <Filter size={14} />}
            {showStats ? "Скрыть статистику" : "Показать статистику"}
          </button>
        </div>

        {/* Статистика */}
        <div className={`${showStats ? 'block' : 'hidden md:block'} flex-shrink-0 mb-4`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map(stat => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={statistics[stat.key] || 0}
                icon={stat.icon}
              />
            ))}
          </div>
          <div className="mt-3 text-center text-sm text-gray-500">
            Всего файлов: <strong>{statistics.total || 0}</strong>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
          <button
            onClick={handleRefresh}
            className="bg-[#f6a623] hover:bg-[#e09515] text-white px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm transition shadow-sm"
          >
            <RefreshCw size={14} /> Обновить
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-600"
          >
            {showFilters ? <X size={14} /> : <Filter size={14} />}
            Фильтры
          </button>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "list" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} flex-shrink-0 mb-4`}>
          <FileFilters
            entityType={entityType}
            onEntityTypeChange={setEntityType}
            entityId={entityId}
            onEntityIdChange={setEntityId}
            fileName={fileName}
            onFileNameChange={setFileName}
          />
        </div>

        {/* Счётчик и селектор размера */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2 flex-shrink-0">
          <div>Найдено файлов: {total}</div>
          <select
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            className="border rounded-md p-1 text-xs"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>

        {/* Список файлов */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading && <div className="text-center py-12 text-sm">Загрузка...</div>}
          {!loading && files.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <Database size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Файлы не найдены</p>
            </div>
          )}
          {!loading && viewMode === "grid" && files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {files.map(file => (
                <FileCard key={file.id} file={file} onDelete={setFileToDelete} />
              ))}
            </div>
          )}
          {!loading && viewMode === "list" && files.length > 0 && (
            <div className="space-y-2 pb-6 w-full">
              {files.map(file => (
                <FileListCard key={file.id} file={file} onDelete={setFileToDelete} />
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
              className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 py-1 text-sm">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить файл"
        message={`Вы уверены, что хотите удалить файл "${fileToDelete?.fileName}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}