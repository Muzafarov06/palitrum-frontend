import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllPrograms, fetchFilteredApplications, fetchApplicationsStatistics } from "../../api/api";
import { toast } from "react-toastify";
import StatsCards from "../../components/manager/StatsCards";
import ApplicationsTable from "../../components/manager/ApplicationsTable";
import ApplicationEditModal from "../../components/manager/ApplicationEditModal";
import ApplicationFilters from "../../components/manager/ApplicationFilters";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { 
  ChevronLeft, ChevronRight, Filter, X, Plus, RefreshCw, Download, 
  FileText, ChevronDown, ChevronUp, Pencil, Eye, EyeOff, Calendar, Mail, Phone,
  User, BookOpen, Clock
} from "lucide-react";

export default function ApplicationPage() {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingApp, setEditingApp] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [programs, setPrograms] = useState([]);
  const [statistics, setStatistics] = useState({ total: 0, newToday: 0, unread: 0, urgent: 0, awaitingInfo: 0 });

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirmDialog = (title, message, onConfirm) => {
    setDialog({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setDialog(prev => ({ ...prev, isOpen: false })); } });
  };

  useEffect(() => {
    fetchApplicationsStatistics()
      .then(setStatistics)
      .catch(err => console.error("Ошибка загрузки статистики", err));
  }, []);

  useEffect(() => {
    fetchAllPrograms()
      .then(setPrograms)
      .catch((err) => {
        if (err.response?.status === 403) {
          console.warn("Нет прав на загрузку программ");
        } else {
          console.error("Ошибка загрузки программ:", err);
        }
      });
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let lastName = null, firstName = null;
      if (searchQuery.trim()) {
        const parts = searchQuery.trim().split(/\s+/);
        lastName = parts[0];
        firstName = parts.slice(1).join(" ") || null;
      }

      const data = await fetchFilteredApplications({
        status: statusFilter || null,
        programId: programFilter || null,
        childLastName: lastName,
        childFirstName: firstName,
        startDate: dateFrom ? dateFrom.toISOString() : null,
        endDate: dateTo ? dateTo.toISOString() : null,
        page,
        size,
        sort: `${sortField},${sortOrder}`,
      });

      setApplications(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      setError(err.message || "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, programFilter, searchQuery, dateFrom, dateTo, page, size, sortField, sortOrder]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleSuccess = () => {
    loadApplications();
    fetchApplicationsStatistics()
      .then(setStatistics)
      .catch(console.error);
    toast.success("Заявка успешно сохранена");
  };

  if (authLoading) return <div className="p-6 text-center">Загрузка пользователя...</div>;
  if (!user) return <div className="p-6 text-center">Не авторизован</div>;
  if (!user.permissions?.includes("APPLICATION.VIEW")) {
    return <div className="p-6 text-center text-red-500">У вас нет прав для просмотра заявок</div>;
  }

  const resetFilters = () => {
    setStatusFilter("");
    setProgramFilter("");
    setDateFrom(null);
    setDateTo(null);
    setSearchQuery("");
    setPage(0);
    toast.info("Фильтры сброшены");
  };

  const handleResetFilters = () => {
    openConfirmDialog("Сброс фильтров", "Вы уверены, что хотите сбросить все фильтры?", resetFilters);
  };

  const handleExportCSV = () => {
    const header = ["id", "child", "parentEmail", "status", "createdAt", "program"].join(",");
    const rows = applications.map((a) =>
      [
        a.id || "",
        `"${(a.childLastName || "") + " " + (a.childFirstName || "")}"`,
        a.parentEmail || "",
        a.status || "",
        a.createdAt || "",
        a.programName || a.programId || "",
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Экспортировано ${applications.length} заявок`);
  };

  const confirmExport = () => {
    openConfirmDialog("Экспорт в CSV", `Будут выгружены ${applications.length} заявок. Продолжить?`, handleExportCSV);
  };

  const handleNewApplication = () => {
    setShowCreateModal(true);
  };

  const confirmNewApplication = () => {
    openConfirmDialog("Создание заявки", "Вы будете перенаправлены в форму создания заявки. Продолжить?", handleNewApplication);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(0);
  };

  const statusMap = {
    NEW: "Новая", REVIEWED: "На проверке", ACCEPTED: "Принята",
    REJECTED: "Отклонена", WAITLIST: "В ожидании",
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-blue-100 text-blue-700",
      REVIEWED: "bg-yellow-100 text-yellow-700",
      ACCEPTED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      WAITLIST: "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const statusOptions = [
    { value: "", label: "Все статусы" },
    ...Object.entries(statusMap).map(([key, label]) => ({ value: key, label }))
  ];

  const programOptions = [
    { value: "", label: "Все программы" },
    ...programs.map(p => ({ value: p.id.toString(), label: p.name }))
  ];

  // Красивая мобильная карточка заявки
  const ApplicationCard = ({ app }) => {
    const isExpanded = expandedApp === app.id;
    const statusColor = getStatusColor(app.status);
    
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 overflow-hidden transition-all hover:shadow-md">
        <div className="p-4 cursor-pointer" onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
          {/* Статус и дата */}
          <div className="flex justify-between items-start mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusMap[app.status] || app.status}
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={12} />
              <span className="text-[10px]">{formatCreatedAt(app.createdAt)}</span>
            </div>
          </div>
          
          {/* ФИО ребенка */}
          <div className="flex items-start gap-2">
            <div className="w-9 h-9 rounded-full bg-[#f6a623]/10 flex items-center justify-center shrink-0">
              <User size={16} className="text-[#f6a623]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-base">
                {app.childLastName} {app.childFirstName}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <BookOpen size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500 truncate">{app.programName || "Программа не указана"}</span>
              </div>
            </div>
          </div>
          
          {/* Email родителя */}
          <div className="flex items-center gap-1 mt-2 text-gray-500">
            <Mail size={12} />
            <span className="text-xs truncate">{app.parentEmail}</span>
          </div>
          
          {/* Кнопка редактирования и иконка раскрытия */}
          <div className="flex justify-end mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setEditingApp(app); }}
              className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded-lg transition"
            >
              <Pencil size={14} />
            </button>
            <button className="p-1.5 text-gray-400">
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
        
        {/* Развернутая информация */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-20">ID заявки:</span>
              <span className="text-gray-800 font-medium">№{app.id}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span className="text-gray-500">Телефон:</span>
              <span className="text-gray-700">{app.parentPhone || "—"}</span>
            </div>
            {app.comment && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-xs">Комментарий:</span>
                <p className="text-gray-600 text-sm mt-1 bg-white p-2 rounded-lg border border-gray-100">
                  {app.comment}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full flex flex-col p-3 sm:p-6">
        {/* Заголовок с иконкой */}
        <div className="flex items-center gap-3 pl-10 md:pl-0 mb-4 flex-shrink-0">
          <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
            <FileText size={24} className="text-[#f6a623]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Управление заявками</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Обработка и отслеживание заявок</p>
          </div>
        </div>

        {/* Кнопка показа/скрытия статистики на мобильных */}
        <div className="flex items-center justify-end mb-2 flex-shrink-0 md:hidden">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 text-xs text-[#f6a623] font-medium"
          >
            {showStats ? <EyeOff size={14} /> : <Eye size={14} />}
            {showStats ? "Скрыть статистику" : "Показать статистику"}
          </button>
        </div>

        {/* Статистика - нормальные карточки StatsCards */}
        <div className={`${showStats ? 'block' : 'hidden md:block'} flex-shrink-0 mb-4`}>
          <StatsCards metrics={statistics} />
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
          <button
            onClick={confirmNewApplication}
            className="bg-[#f6a623] hover:bg-[#e09515] text-white px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm transition shadow-sm"
          >
            <Plus size={14} /> Создать
          </button>
          <button
            onClick={loadApplications}
            className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm transition hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Обновить
          </button>
          <button
            onClick={confirmExport}
            className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-xl flex items-center gap-1 text-sm transition hover:bg-gray-50"
          >
            <Download size={14} /> Экспорт
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-600"
          >
            {showFilters ? <X size={14} /> : <Filter size={14} />}
            Фильтры
          </button>
        </div>

        {/* Фильтры */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} flex-shrink-0 mb-4`}>
          <ApplicationFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            programFilter={programFilter}
            setProgramFilter={setProgramFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resetFilters={handleResetFilters}
            exportCSV={confirmExport}
            onRefresh={loadApplications}
            onNewApplication={confirmNewApplication}
            statusOptions={statusOptions}
            programOptions={programOptions}
            setPage={setPage}
          />
        </div>

        {/* Список заявок */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading && <div className="text-center py-12 text-sm">Загрузка...</div>}
          {error && <div className="text-center py-12 text-red-500 text-sm">Ошибка: {error}</div>}
          {!loading && !error && applications.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Нет заявок</p>
              <p className="text-xs text-gray-400 mt-1">Создайте первую заявку, нажав кнопку "Создать"</p>
            </div>
          )}
          {!loading && !error && applications.length > 0 && (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block">
                <ApplicationsTable
                  applications={applications}
                  loading={loading}
                  error={error}
                  onRowClick={setEditingApp}
                  statusMap={statusMap}
                  formatCreatedAt={formatCreatedAt}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {applications.map(app => (
                  <ApplicationCard key={app.id} app={app} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Пагинация */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex-shrink-0 mt-4 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="text-xs text-gray-500">
                {applications.length} из {totalElements}
              </div>
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-xs">
                  {page + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page + 1 >= totalPages}
                  className="p-1.5 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronRight size={14} />
                </button>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                  className="border rounded-lg px-1 py-1 text-xs bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <ApplicationEditModal
          application={null}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      {editingApp && (
        <ApplicationEditModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSuccess={handleSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
      />

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}