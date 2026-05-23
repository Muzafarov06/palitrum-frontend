// src/pages/admin/ImportPage.jsx
import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import { 
  Download, Upload, Users, BookOpen, 
  GraduationCap, Building2, DoorOpen, Calendar, Newspaper,
  UserCog, Briefcase, Shield, Database, 
  ArrowRight, Loader2, FileText,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Карточка типа импорта
const ImportCard = ({ 
  title, 
  description, 
  icon: Icon, 
  templateEndpoint, 
  importEndpoint,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const downloadTemplate = async () => {
    setLoading(true);
    try {
      const response = await API.get(templateEndpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase()}_template.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Шаблон "${title}" скачан`);
    } catch (err) {
      toast.error(`Не удалось скачать шаблон "${title}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post(importEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Импорт "${title}" завершён успешно!`);
    } catch (err) {
      toast.error(`Ошибка импорта "${title}": ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <Icon size={22} className="text-[#f6a623]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            onClick={downloadTemplate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Шаблон
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
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Импорт
          </button>
        </div>
      </div>
    </div>
  );
};

// Карточка массового импорта
const BulkImportCard = ({ onImport, onDownloadTemplate, loading }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await onImport(file);
    e.target.value = '';
  };

  return (
   <div className="bg-gradient-to-r from-[#f6a623]/5 to-orange-50 rounded-2xl border-2 border-dashed border-[#f6a623]/30 p-6 mb-8 hover:border-[#f6a623]/60 transition-all duration-300">
      {/*<div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
          <Database size={28} className="text-[#f6a623]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Массовый импорт</h2>
          <p className="text-sm text-gray-500">Импорт всех данных из одного Excel-файла (отделения, программы, предметы, связи)</p>
        </div>
      </div>
      
       КНОПКИ МАССОВОГО ИМПОРТА ВРЕМЕННО ОТКЛЮЧЕНЫ
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownloadTemplate}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          <Download size={18} /> Скачать общий шаблон
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
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f6a623] text-white rounded-xl font-medium hover:bg-[#e09515] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          Выбрать файл
        </button>
      </div>
      
      
      {/* СООБЩЕНИЕ О ВРЕМЕННОМ ОТКЛЮЧЕНИИ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 text-center px-4 py-2.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-xl">
          🔧 Функция массового импорта временно недоступна
        </div>
      </div>
    </div>
  );
};

// Секция с карточками
const ImportSection = ({ title, icon: Icon, items }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full group mb-3"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-[#f6a623]/10 transition">
            <Icon size={18} className="text-gray-600 group-hover:text-[#f6a623]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item, idx) => (
            <ImportCard key={idx} {...item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ImportPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));
  const [bulkLoading, setBulkLoading] = useState(false);

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-red-400 mb-3" />
          <h2 className="text-xl font-semibold text-gray-700">Доступ запрещён</h2>
          <p className="text-gray-500 mt-1">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  const handleBulkImport = async (file) => {
    setBulkLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/departments-programs/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Массовый импорт завершён успешно!');
    } catch (err) {
      toast.error('Ошибка массового импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadBulkTemplate = async () => {
    try {
      const response = await API.get('/api/import/departments-programs/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bulk_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Общий шаблон импорта скачан");
    } catch (err) {
      toast.error("Не удалось скачать общий шаблон");
    }
  };

  const sections = [
    {
      title: "Пользователи и роли",
      icon: Users,
      items: [
        { title: "Пользователи", description: "Импорт пользователей с ролями и связями", icon: Users, templateEndpoint: "/api/import/users/template", importEndpoint: "/api/import/users/excel" },
        { title: "Должности", description: "Импорт должностей (учебные/административные)", icon: Briefcase, templateEndpoint: "/api/import/positions/template", importEndpoint: "/api/import/positions/excel" },
        { title: "Штатное расписание", description: "Импорт сотрудников и их ставок", icon: UserCog, templateEndpoint: "/api/import/staff/template", importEndpoint: "/api/import/staff/excel" },
      ]
    },
    {
      title: "Учебный процесс",
      icon: BookOpen,
      items: [
        { title: "Отделения", description: "Импорт структуры отделений", icon: Building2, templateEndpoint: "/api/import/departments/template", importEndpoint: "/api/import/departments/excel" },
        { title: "Программы", description: "Импорт учебных программ", icon: GraduationCap, templateEndpoint: "/api/import/template", importEndpoint: "/api/import/excel" },
        { title: "Предметы", description: "Импорт предметов и типов занятий", icon: BookOpen, templateEndpoint: "/api/import/subjects/template", importEndpoint: "/api/import/subjects/excel" },
        { title: "Учебные периоды", description: "Импорт семестров, четвертей, годов", icon: Calendar, templateEndpoint: "/api/import/academic-periods/template", importEndpoint: "/api/import/academic-periods/excel" },
        { title: "Помещения", description: "Импорт аудиторий и их вместимости", icon: DoorOpen, templateEndpoint: "/api/import/rooms/template", importEndpoint: "/api/import/rooms/excel" },
      ]
    },
    {
      title: "Контент",
      icon: Newspaper,
      items: [
        { title: "Новости", description: "Импорт новостей и объявлений", icon: Newspaper, templateEndpoint: "/api/import/news/template", importEndpoint: "/api/import/news/excel" },
      ]
    }
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full flex flex-col p-4 sm:p-8">
        <div className="w-full h-full flex flex-col">
          {/* Заголовок */}
          <div className="flex items-center gap-3 pl-10 md:pl-0 mb-6 flex-shrink-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <Database size={28} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Центр импорта данных</h1>
              <p className="text-gray-500 text-sm mt-1">Импортируйте данные из Excel-файлов в систему</p>
            </div>
          </div>

          {/* Контент - скроллируемый, на всю ширину */}
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
            {/* Массовый импорт */}
            {/*<BulkImportCard 
              onImport={handleBulkImport} 
              onDownloadTemplate={downloadBulkTemplate}
              loading={bulkLoading}
            />

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <ArrowRight size={14} /> Или по отдельности <ArrowRight size={14} />
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>*/}

            {/* Секции импорта */}
            {sections.map((section, idx) => (
              <ImportSection key={idx} title={section.title} icon={section.icon} items={section.items} />
            ))}

            {/* Информационный блок */}
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-xl shrink-0">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">Как пользоваться импортом:</h4>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1.5 list-disc list-inside">
                    <li>Скачайте шаблон Excel для нужного типа данных</li>
                    <li>Заполните файл согласно примерам в шаблоне</li>
                    <li>Загрузите заполненный файл через кнопку «Импорт»</li>
                    <li>Проверьте результат – система уведомит об успешном импорте</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}