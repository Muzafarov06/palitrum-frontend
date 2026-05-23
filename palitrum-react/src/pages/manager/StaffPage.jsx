// src/pages/manager/StaffPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import CustomSelect from "../../components/common/CustomSelect";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus, UserCheck, Pencil, Trash, Save, X, Users, BadgeCheck, Clock, ChevronLeft, ChevronRight, Download, Upload } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const StaffRow = ({ staff, users, positions, onSave, onDelete, loading, isNew, onCancel }) => {
  const [editMode, setEditMode] = useState(isNew || false);
  const [userId, setUserId] = useState(staff?.userId || "");
  const [positionId, setPositionId] = useState(staff?.positionId || "");
  const [rateCount, setRateCount] = useState(staff?.rateCount || "1.0");
  const [hireDate, setHireDate] = useState(staff?.hireDate ? new Date(staff.hireDate) : new Date());

  const handleSave = () => {
    if (!userId || !positionId || !rateCount || !hireDate) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    onSave({
      id: staff?.id,
      userId: Number(userId),
      positionId: Number(positionId),
      rateCount: Number(rateCount),
      hireDate: hireDate.toISOString().split("T")[0],
    });
    if (isNew) {
      setUserId("");
      setPositionId("");
      setRateCount("1.0");
      setHireDate(new Date());
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (isNew && onCancel) onCancel();
  };

  const userOptions = users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }));
  const positionOptions = positions.map(p => ({ value: p.id, label: p.name }));

  if (editMode) {
    return (
      <tr className="bg-[#f6a623]/5">
        <td className="px-4 py-3 min-w-[200px]">
          <CustomSelect value={userId} onChange={setUserId} options={userOptions} placeholder="Выберите сотрудника" />
        </td>
        <td className="px-4 py-3 min-w-[200px]">
          <CustomSelect value={positionId} onChange={setPositionId} options={positionOptions} placeholder="Выберите должность" />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={rateCount}
              onChange={e => setRateCount(e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50 focus:border-[#f6a623] transition"
            />
            <span className="text-sm text-gray-500">ст.</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-400">—</span>
        </td>
        <td className="px-4 py-3 min-w-[160px]">
          <CustomDatePicker selected={hireDate} onChange={setHireDate} />
        </td>
        <td className="px-4 py-3">
          <span className="text-sm text-gray-400">—</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="p-2 bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515] transition disabled:opacity-50"
              title="Сохранить"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Отмена"
            >
              <X size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  const maxHours = staff.hoursPerRate && staff.rateCount ? (staff.hoursPerRate * staff.rateCount).toFixed(1) : "—";

  return (
    <tr className="hover:bg-gray-50 transition group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f6a623]/10 flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#f6a623]" />
          </div>
          <span className="font-medium text-gray-800">{staff.userFullName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <BadgeCheck size={14} className="text-[#f6a623] shrink-0" />
          <span className="text-sm text-gray-700">{staff.positionName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#f6a623]/10 text-[#e09515]">
          {staff.rateCount} ст.
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm">
          <Clock size={14} className="text-[#f6a623] shrink-0" />
          <span className="font-medium text-gray-700">{maxHours} ч/нед</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {new Date(staff.hireDate).toLocaleDateString("ru-RU")}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          staff.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}>
          {staff.isActive ? "Активен" : "Уволен"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => setEditMode(true)}
            className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg transition"
            title="Редактировать"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(staff)}
            className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg transition"
            title="Уволить"
          >
            <Trash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Мобильная карточка
const StaffCard = ({ staff, onEdit, onDelete }) => {
  const maxHours = staff.hoursPerRate && staff.rateCount ? (staff.hoursPerRate * staff.rateCount).toFixed(1) : "—";
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[#f6a623]/10 flex items-center justify-center shrink-0">
            <Users size={18} className="text-[#f6a623]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{staff.userFullName}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <BadgeCheck size={12} className="text-[#f6a623]" />
              <span className="text-xs text-gray-500">{staff.positionName}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(staff)}
            className="text-gray-400 hover:text-[#f6a623] p-1"
            title="Редактировать"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(staff)}
            className="text-gray-400 hover:text-[#f6a623] p-1"
            title="Уволить"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#f6a623]/10 text-[#e09515]">
          {staff.rateCount} ст.
        </span>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock size={14} className="text-[#f6a623]" />
          <span>{maxHours} ч/нед</span>
        </div>
        <span className="text-xs text-gray-500">
          с {new Date(staff.hireDate).toLocaleDateString("ru-RU")}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
          staff.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
        }`}>
          {staff.isActive ? "Активен" : "Уволен"}
        </span>
      </div>
    </div>
  );
};

export default function StaffPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [staffList, setStaffList] = useState([]);
  const [users, setUsers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  const fileInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, userRes, posRes] = await Promise.all([
        API.get("/api/staff"),
        API.get("/api/dropdown/teachers"),
        API.get("/api/positions"),
      ]);
      setStaffList(staffRes.data);
      setUsers(userRes.data);
      setPositions(posRes.data);
    } catch (err) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Фильтрация
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.userFullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.positionName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && staff.isActive) ||
      (statusFilter === "dismissed" && !staff.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStaff.length / size);
  const paginatedStaff = filteredStaff.slice(page * size, (page + 1) * size);

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (data.id) {
        await API.put(`/api/staff/${data.id}`, data);
        toast.success("Сотрудник обновлён");
      } else {
        await API.post("/api/staff", data);
        toast.success("Сотрудник принят на работу");
        setShowNewRow(false);
      }
      await fetchData();
      setPage(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      await API.delete(`/api/staff/${staffToDelete.id}`);
      toast.success("Сотрудник уволен");
      await fetchData();
      if (paginatedStaff.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setStaffToDelete(null);
    }
  };

  // Импорт и шаблон
  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/staff/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон штатного расписания скачан");
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
      await API.post('/api/import/staff/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт штатного расписания завершён');
      await fetchData();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const activeCount = staffList.filter(s => s.isActive).length;
  const dismissedCount = staffList.length - activeCount;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="p-2.5 bg-[#f6a623]/10 rounded-xl shrink-0">
              <UserCheck size={32} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Штатное расписание</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{staffList.length} сотрудников</span>
                {activeCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {activeCount} активных
                  </span>
                )}
                {dismissedCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    {dismissedCount} уволенных
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <button
              onClick={() => setShowNewRow(true)}
              className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Plus size={18} /> Принять на работу
            </button>
          </div>
        </div>

        {/* Поиск и фильтр */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 flex-shrink-0">
          <div className="flex-1 min-w-[180px]">
            <CustomSelect
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); setPage(0); }}
              options={[
                { value: "all", label: "Все сотрудники" },
                { value: "active", label: "Активные" },
                { value: "dismissed", label: "Уволенные" },
              ]}
              placeholder="Статус"
              clearable={false}
            />
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Поиск по имени или должности..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50 focus:border-[#f6a623] transition"
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
          {!loading && filteredStaff.length === 0 && !showNewRow && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm">
              <UserCheck size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-500">Нет сотрудников</p>
              <p className="text-sm text-gray-400 mt-1">Примите первого сотрудника на работу</p>
            </div>
          )}
          {!loading && (filteredStaff.length > 0 || showNewRow) && (
            <>
              {/* Десктопная таблица */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                <div className="overflow-x-auto h-full">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Сотрудник</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Должность</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ставка</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Макс. часов</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата приёма</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {showNewRow && (
                        <StaffRow
                          isNew
                          users={users}
                          positions={positions}
                          onSave={handleSave}
                          onCancel={() => setShowNewRow(false)}
                          loading={saving}
                        />
                      )}
                      {paginatedStaff.map(staff => (
                        <StaffRow
                          key={staff.id}
                          staff={staff}
                          users={users}
                          positions={positions}
                          onSave={handleSave}
                          onDelete={setStaffToDelete}
                          loading={saving}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Мобильные карточки (lg и ниже) */}
              <div className="lg:hidden space-y-3 overflow-y-auto h-full pr-1">
                {showNewRow && (
                  <div className="bg-[#f6a623]/5 rounded-xl p-4 border border-dashed border-[#f6a623]">
                    <div className="space-y-3">
                      <CustomSelect
                        value=""
                        onChange={(val) => {}}
                        options={users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
                        placeholder="Выберите сотрудника"
                      />
                      <CustomSelect
                        value=""
                        onChange={(val) => {}}
                        options={positions.map(p => ({ value: p.id, label: p.name }))}
                        placeholder="Выберите должность"
                      />
                      <input
                        type="number"
                        step="0.25"
                        min="0.25"
                        placeholder="Ставка"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-center"
                      />
                      <CustomDatePicker selected={new Date()} onChange={() => {}} />
                      <div className="flex gap-2">
                        <button className="flex-1 bg-[#f6a623] text-white py-2 rounded-lg">Сохранить</button>
                        <button onClick={() => setShowNewRow(false)} className="flex-1 border border-gray-300 py-2 rounded-lg">Отмена</button>
                      </div>
                    </div>
                  </div>
                )}
                {paginatedStaff.map(staff => (
                  <StaffCard
                    key={staff.id}
                    staff={staff}
                    onEdit={(s) => {
                      const newRate = prompt("Введите новую ставку:", s.rateCount);
                      if (newRate && !isNaN(Number(newRate)) && Number(newRate) > 0) {
                        handleSave({ ...s, rateCount: Number(newRate) });
                      }
                    }}
                    onDelete={setStaffToDelete}
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

      <ConfirmDialog
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDelete}
        title="Увольнение сотрудника"
        message={`Вы уверены, что хотите уволить сотрудника "${staffToDelete?.userFullName}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}