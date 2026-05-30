// src/pages/manager/UsersCrudPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { 
  GraduationCap, UsersRound, UserCheck, Users, Pencil, Trash, Mail, Phone, 
  ChevronUp, ChevronDown, Eye, EyeOff, Download, Upload, RefreshCw, Plus, 
  UserCog, UserX, Archive, BookOpen, Briefcase, Filter, X, ChevronRight,
  User as UserIcon, FileText
} from 'lucide-react';
import { 
  fetchFilteredUsers, fetchUsersStatistics, createUserRole, fetchRoles,
  fetchUserRoles, deleteUserRole, createUser, updateUser, deleteUser,
  fetchUserById, fetchUsersByRole, fetchUserRelationsForUser,
  createUserRelation, deleteUserRelation
} from '../../api/api';
import Modal from '../../components/common/Modal';
import FormModal from '../../components/common/FormModal';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomSearchInput from '../../components/common/CustomSearchInput';
import EntityInfo from '../../components/common/EntityInfo';
import { isValidEmail, isValidPhone, isValidPersonName } from '../../utils/validators';
import { formatDate } from '../../utils/dateUtils';
import { createPhoneChangeHandler, phoneToMask } from '../../utils/phoneMask';
import API from '../../api/api';

const formatDateYMD = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Мобильная плашка статистики
const MobileStatItem = ({ value, label, icon: Icon, color, to }) => (
  <Link to={to} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow-md hover:border-[#f6a623] transition group w-full">
    <div className="w-8 h-8 rounded-lg bg-[#f6a623]/10 flex items-center justify-center group-hover:bg-[#f6a623] group-hover:text-white transition flex-shrink-0">
      <Icon size={16} className="text-[#f6a623] group-hover:text-white" />
    </div>
    <span className="font-bold text-gray-800">{value}</span>
    <span className="text-gray-500 truncate">{label}</span>
    <ChevronRight size={16} className="ml-auto text-gray-400" />
  </Link>
);

// Десктопная карточка статистики
const StatCard = ({ title, value, icon: Icon, color, to }) => (
  <Link to={to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 block">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  </Link>
);

const UserStatsCards = ({ metrics, roleFilter }) => {
  const [showAllStats, setShowAllStats] = useState(false);
  
  if (roleFilter === "STUDENT") return (
    <MobileStatItem value={metrics.students ?? 0} label="Учеников" icon={GraduationCap} color="text-[#f6a623]" to="/admin/students" />
  );
  if (roleFilter === "TEACHER") return (
    <MobileStatItem value={metrics.teachers ?? 0} label="Преподавателей" icon={BookOpen} color="text-[#f6a623]" to="/admin/teachers" />
  );
  if (roleFilter === "PARENT") return (
    <MobileStatItem value={metrics.parents ?? 0} label="Родителей" icon={UsersRound} color="text-[#f6a623]" to="/admin/parents" />
  );
  
  const statusItems = [
    { key: "active", title: "Активных", icon: UserCheck, to: "/admin/users?status=ACTIVE" },
    { key: "pending", title: "В ожидании", icon: UserCog, to: "/admin/users?status=PENDING" },
    { key: "blocked", title: "Заблокировано", icon: UserX, to: "/admin/users?status=BLOCKED" },
    { key: "archived", title: "Архив", icon: Archive, to: "/admin/users?status=ARCHIVED" },
  ];
  const roleItems = [
    { key: "students", title: "Ученики", icon: GraduationCap, to: "/admin/students" },
    { key: "teachers", title: "Преподаватели", icon: BookOpen, to: "/admin/teachers" },
    { key: "managers", title: "Менеджеры", icon: Briefcase, to: "/admin/users?role=MANAGER" },
    { key: "parents", title: "Родители", icon: UsersRound, to: "/admin/parents" },
  ];

  const allStatsItems = [...statusItems, ...roleItems];
  const visibleStats = showAllStats ? allStatsItems : allStatsItems.slice(0, 4);

  return (
    <div className="mb-3 sm:mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg sm:text-3xl font-bold text-gray-800">Статистика</h2>
        {allStatsItems.length > 4 && (
          <button
            onClick={() => setShowAllStats(!showAllStats)}
            className="sm:hidden flex items-center gap-1 text-xs text-[#f6a623] font-medium"
          >
            {showAllStats ? (
              <><ChevronUp size={14} /> Скрыть</>
            ) : (
              <><ChevronDown size={14} /> Показать всё</>
            )}
          </button>
        )}
      </div>

      <div className="flex sm:hidden flex-col space-y-2">
        {visibleStats.map((item) => (
          <MobileStatItem
            key={item.key}
            value={metrics[item.key] ?? 0}
            label={item.title}
            icon={item.icon}
            color="text-[#f6a623]"
            to={item.to}
          />
        ))}
      </div>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statusItems.map((item) => (
          <StatCard key={item.key} title={item.title} value={metrics[item.key] ?? 0} icon={item.icon} color="text-[#f6a623]" to={item.to} />
        ))}
      </div>
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleItems.map((item) => (
          <StatCard key={item.key} title={item.title} value={metrics[item.key] ?? 0} icon={item.icon} color="text-[#f6a623]" to={item.to} />
        ))}
      </div>
    </div>
  );
};

// Панель фильтров (с добавленными подсказками и кнопкой шаблона)
const UserFilterPanel = ({ statusFilter, setStatusFilter, roleFilter, roleFilterState, setRoleFilterState, searchQuery, setSearchQuery, birthDateFrom, setBirthDateFrom, birthDateTo, setBirthDateTo, resetFilters, onAddUser, onImport, onDownloadTemplate, roles, setPage }) => {
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef(null);
  
  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "ACTIVE", label: "Активен" },
    { value: "PENDING", label: "Ожидает" },
    { value: "BLOCKED", label: "Заблокирован" },
    { value: "ARCHIVED", label: "Архивирован" }
  ];
  const roleOptions = [
    { value: "", label: "Все роли" },
    ...roles.filter(role => role.name !== "SUPER_ADMIN").map(role => ({ 
      value: role.name, 
      label: role.name === "STUDENT" ? "Ученики" : role.name === "TEACHER" ? "Преподаватели" : role.name === "PARENT" ? "Родители" : role.name === "MANAGER" ? "Менеджеры" : role.name === "ADMIN" ? "Администраторы" : role.name
    }))
  ];

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/users/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт пользователей завершён');
      setPage(0);
      if (onImport) onImport();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-6">
      <input type="file" ref={fileInputRef} accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
      
      {/* Первая строка – всегда видна (кнопки и фильтры для десктопа) */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-3">
        <button onClick={onAddUser} title="Добавить нового пользователя" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-[#f6a623] text-white text-xs sm:text-sm rounded-lg h-9 sm:h-10"><Plus size={16} /> Добавить</button>
        <button onClick={() => setShowFilters(!showFilters)} title="Показать/скрыть расширенные фильтры" className="md:hidden flex items-center gap-1 px-3 py-2 bg-white rounded-lg text-gray-600 border h-9 sm:h-10">
          {showFilters ? <X size={16} /> : <Filter size={16} />}
          <span className="text-xs">Фильтры</span>
        </button>
        {/* Кнопки управления – всегда видимы */}
        <button onClick={resetFilters} title="Сбросить все фильтры" className="p-2 bg-white rounded-lg text-gray-600 border h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center"><RefreshCw size={16} /></button>
        <button onClick={handleImportClick} title="Импортировать пользователей из Excel" className="p-2 bg-white rounded-lg text-gray-600 border h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center"><Upload size={16} /></button>
        <button onClick={onDownloadTemplate} title="Скачать шаблон Excel для импорта пользователей" className="p-2 bg-white rounded-lg text-gray-600 border h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center"><Download size={16} /></button>
        
        {/* Десктопные фильтры (селекты) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          <div className="w-44"><CustomSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(0); }} options={statusOptions} placeholder="Статус" clearable /></div>
          {roleFilter === null && <div className="w-44"><CustomSelect value={roleFilterState} onChange={(v) => { setRoleFilterState(v); setPage(0); }} options={roleOptions} placeholder="Роль" clearable /></div>}
        </div>
      </div>
      
      {/* Панель расширенных фильтров (поиск, даты, селекты для мобильных) */}
      <div className={`${showFilters ? 'block' : 'hidden md:flex'} flex-wrap items-end gap-2 sm:gap-3`}>
        <div className="flex-1 min-w-[120px] sm:min-w-[200px]">
          <label className="text-xs text-gray-500 hidden sm:block mb-1">Поиск</label>
          <CustomSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Поиск по ФИО или email..." setPage={setPage} />
        </div>
        <div className="flex flex-row gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-44">
            <CustomDatePicker selected={birthDateFrom} onChange={(date) => { setBirthDateFrom(date); setPage(0); }} placeholder="ДД.ММ.ГГГГ" label="Дата от" maxDate={new Date()} />
          </div>
          <div className="flex-1 sm:w-44">
            <CustomDatePicker selected={birthDateTo} onChange={(date) => { setBirthDateTo(date); setPage(0); }} placeholder="ДД.ММ.ГГГГ" label="Дата до" maxDate={new Date()} />
          </div>
        </div>
        {/* На мобильных добавляем селекты статуса и роли, так как они не видны в основной строке */}
        <div className="md:hidden flex flex-wrap gap-2 w-full mt-2">
          <div className="flex-1"><CustomSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(0); }} options={statusOptions} placeholder="Статус" clearable /></div>
          {roleFilter === null && <div className="flex-1"><CustomSelect value={roleFilterState} onChange={(v) => { setRoleFilterState(v); setPage(0); }} options={roleOptions} placeholder="Роль" clearable /></div>}
        </div>
      </div>
    </div>
  );
};

// Пагинация (с подсказками)
const UsersPagination = ({ page, totalPages, setPage, size, setSize, totalElements, usersCount }) => (
  <div className="flex flex-wrap justify-between items-center gap-2">
    <div className="text-xs sm:text-sm text-gray-600">Показано {usersCount} из {totalElements}</div>
    <div className="flex gap-1 sm:gap-2 items-center">
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} title="Предыдущая страница" className="px-2 sm:px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm">Назад</button>
      <span className="text-xs sm:text-sm">Страница {page + 1} из {totalPages}</span>
      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page + 1 >= totalPages} title="Следующая страница" className="px-2 sm:px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-xs sm:text-sm">Вперёд</button>
      <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} title="Количество записей на странице" className="border rounded-lg px-1 sm:px-2 py-1 text-xs sm:text-sm">
        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
      </select>
    </div>
  </div>
);

// Таблица пользователей (с подсказками на кнопки)
const UsersTable = ({ users, onEdit, onDelete, sortField, sortOrder, onSort }) => {
  const getStatusColor = (status) => ({ ACTIVE: "#10b981", PENDING: "#f59e0b", BLOCKED: "#ef4444", ARCHIVED: "#6b7280" }[status] || "#e5e7eb");
  const getStatusText = (status) => ({ ACTIVE: "Активен", PENDING: "Ожидает", BLOCKED: "Заблокирован", ARCHIVED: "Архивирован" }[status] || status);
  const getRoleName = (role) => ({ ADMIN: "Администратор", SUPER_ADMIN: "Супер-админ", MANAGER: "Менеджер", TEACHER: "Преподаватель", STUDENT: "Ученик", PARENT: "Родитель" }[role] || role);
  const SortIcon = ({ field }) => sortField === field ? (sortOrder === 'asc' ? <ChevronUp size={12} className="inline ml-0.5" /> : <ChevronDown size={12} className="inline ml-0.5" />) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="hidden md:grid grid-cols-11 gap-2 px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500">
        <div className="col-span-3 cursor-pointer hover:text-gray-700" onClick={() => onSort('lastName')} title="Сортировать по ФИО">ФИО <SortIcon field="lastName" /></div>
        <div className="col-span-3 cursor-pointer hover:text-gray-700" onClick={() => onSort('email')} title="Сортировать по email">Контакты <SortIcon field="email" /></div>
        <div className="col-span-2 cursor-pointer hover:text-gray-700" onClick={() => onSort('birthDate')} title="Сортировать по дате рождения">Дата рождения <SortIcon field="birthDate" /></div>
        <div className="col-span-2 cursor-pointer hover:text-gray-700" onClick={() => onSort('status')} title="Сортировать по статусу">Статус / Роль <SortIcon field="status" /></div>
        <div className="col-span-1 text-right">Действия</div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {users.map(user => {
          const roles = user.roles || (user.role ? [user.role] : []);
          const rolesRussian = roles.map(getRoleName).join(", ");
          return (
            <div key={user.id} className="block md:grid md:grid-cols-11 gap-2 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 border-r-4" style={{ borderRightColor: getStatusColor(user.status) }}>
              <div className="flex items-center gap-2 mb-1 md:mb-0 col-span-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-gray-700 font-semibold text-xs">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm truncate">{user.lastName} {user.firstName}</div>
                  {user.middleName && <div className="text-xs text-gray-400 hidden sm:block truncate">{user.middleName}</div>}
                </div>
              </div>
              <div className="col-span-3 mb-1 md:mb-0">
                <div className="flex items-center gap-1 text-xs text-gray-600"><Mail size={10} className="text-[#f6a623]" /><span className="truncate">{user.email}</span></div>
                {user.phone && <div className="flex items-center gap-1 text-xs text-gray-600 hidden sm:flex"><Phone size={10} className="text-[#f6a623]" /><span>{user.phone}</span></div>}
              </div>
              <div className="col-span-2 mb-1 md:mb-0 text-xs text-gray-600">{user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : '—'}</div>
              <div className="col-span-2 mb-1 md:mb-0">
                <div className="text-gray-900 font-medium text-xs">{getStatusText(user.status)}</div>
                {rolesRussian && <div className="text-xs text-gray-500">{rolesRussian}</div>}
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <button onClick={() => onEdit(user)} className="p-1 text-[#f6a623] hover:bg-[#f6a623] hover:bg-opacity-10 rounded" title="Редактировать пользователя"><Pencil size={14} /></button>
                <button onClick={() => onDelete(user.id)} className="p-1 text-[#f6a623] hover:bg-[#f6a623] hover:bg-opacity-10 rounded" title="Удалить пользователя"><Trash size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <Modal title="Удалить пользователя?" onClose={onClose}>
      <div className="text-sm">Вы уверены, что хотите удалить этого пользователя?</div>
      <div className="mt-3 flex gap-2"><button className="bg-red-500 text-white px-3 py-1.5 rounded text-sm" onClick={onConfirm} title="Удалить">Удалить</button><button className="px-3 py-1.5 rounded border text-sm" onClick={onClose} title="Отмена">Отмена</button></div>
    </Modal>
  );
};

// Модалка пользователя с вкладкой "Связи" (с добавленной кнопкой добавления связи)
const UserFormModal = ({ isOpen, onClose, mode, initialData, onSubmit, defaultRoleId = null, hideRoleSelect = false, rolesList = [], onViewUser, onViewApplication, canManageRelations = true }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', middleName: '', email: '', phone: '8', password: '', birthDate: null, status: 'ACTIVE', isStaff: false });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [showAddRelationForm, setShowAddRelationForm] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('parent');
  const [addingRelation, setAddingRelation] = useState(false);

  const currentRole = (() => {
    if (mode !== 'edit' || !initialData?.roles?.length) return null;
    return initialData.roles[0];
  })();
  
  const showRelationsTab = mode === 'edit' && initialData?.id && (currentRole === 'STUDENT' || currentRole === 'PARENT' || currentRole === 'GUARDIAN');

  // Загрузка текущих связей
  const loadRelations = useCallback(async () => {
    if (!isOpen || !showRelationsTab) return;
    setLoadingRelations(true);
    try {
      const relations = await fetchUserRelationsForUser(initialData.id);
      setRelatedUsers(relations);
    } catch (err) {
      console.error('Ошибка загрузки связей:', err);
      toast.error('Не удалось загрузить связи');
    } finally {
      setLoadingRelations(false);
    }
  }, [isOpen, showRelationsTab, initialData?.id]);

  useEffect(() => {
    if (isOpen && showRelationsTab) {
      loadRelations();
    }
  }, [isOpen, showRelationsTab, loadRelations]);

  // Загрузка доступных для связи пользователей
  const loadAvailableUsers = useCallback(async () => {
    if (!initialData?.id) return;
    try {
      let usersList = [];
      if (currentRole === 'STUDENT') {
        // Студент может быть связан с родителями или опекунами
        const parents = await fetchUsersByRole('PARENT');
        const guardians = await fetchUsersByRole('GUARDIAN');
        usersList = [...parents, ...guardians];
      } else if (currentRole === 'PARENT' || currentRole === 'GUARDIAN') {
        // Родитель/опекун может быть связан со студентами
        usersList = await fetchUsersByRole('STUDENT');
      }
      // Исключаем уже связанных
      const existingIds = relatedUsers.map(r => currentRole === 'STUDENT' ? r.parentUserId : r.childUserId);
      const available = usersList.filter(u => !existingIds.includes(u.id));
      setAvailableUsers(available);
    } catch (err) {
      console.error('Ошибка загрузки доступных пользователей:', err);
      toast.error('Не удалось загрузить доступных пользователей');
    }
  }, [initialData?.id, currentRole, relatedUsers]);

  useEffect(() => {
    if (showAddRelationForm) {
      loadAvailableUsers();
    } else {
      setSelectedUserId('');
      setSelectedRelationType('parent');
    }
  }, [showAddRelationForm, loadAvailableUsers]);

  // Добавление связи
  const handleAddRelation = async () => {
    if (!selectedUserId) {
      toast.warn('Выберите пользователя');
      return;
    }
    setAddingRelation(true);
    try {
      const payload = {
        parentUserId: currentRole === 'STUDENT' ? Number(selectedUserId) : initialData.id,
        childUserId: currentRole === 'STUDENT' ? initialData.id : Number(selectedUserId),
        relationType: selectedRelationType,
        verified: true
      };
      await createUserRelation(payload);
      toast.success('Связь добавлена');
      setShowAddRelationForm(false);
      await loadRelations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка добавления связи');
    } finally {
      setAddingRelation(false);
    }
  };

  // Удаление связи
  const handleDeleteRelation = async (relationId) => {
    if (!window.confirm('Удалить связь?')) return;
    try {
      await deleteUserRelation(relationId);
      toast.success('Связь удалена');
      await loadRelations();
    } catch (err) {
      toast.error('Ошибка удаления связи');
    }
  };

  const parseBirthDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      if (dateValue.includes('-')) { const [year, month, day] = dateValue.split('-'); return new Date(year, month - 1, day); }
      if (dateValue.includes('.')) { const [day, month, year] = dateValue.split('.'); return new Date(year, month - 1, day); }
    }
    return null;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        middleName: initialData.middleName || '',
        email: initialData.email || '',
        phone: phoneToMask(initialData.phone || '8'),
        password: '',
        birthDate: parseBirthDate(initialData.birthDate),
        status: initialData.status || 'ACTIVE',
        isStaff: initialData.isStaff || false,
      });
      const role = initialData.roles?.length ? rolesList.find(r => r.name === initialData.roles[0]) : null;
      setSelectedRoleId(role?.id || null);
    } else {
      setFormData({ firstName: '', lastName: '', middleName: '', email: '', phone: '8', password: '', birthDate: null, status: 'ACTIVE', isStaff: false });
      setSelectedRoleId(defaultRoleId);
    }
    setActiveTab(0);
    setShowAddRelationForm(false);
  }, [isOpen, mode, initialData, defaultRoleId, rolesList]);

  const handlePhoneChange = createPhoneChangeHandler(setFormData);
  
  const handleSubmit = async () => {
    let phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.startsWith('8')) phoneDigits = '+7' + phoneDigits.slice(1);
    else if (phoneDigits.startsWith('7')) phoneDigits = '+' + phoneDigits;
    else phoneDigits = '+7' + phoneDigits;
    let birthDateISO = formData.birthDate ? formatDateYMD(formData.birthDate) : null;

    if (!isValidPersonName(formData.firstName, true)) return toast.warning('Имя должно содержать только буквы, дефис или пробел');
    if (!isValidPersonName(formData.lastName, true)) return toast.warning('Фамилия должна содержать только буквы, дефис или пробел');
    if (!formData.birthDate) return toast.warning('Укажите дату рождения');
    if (!isValidEmail(formData.email)) return toast.warning('Некорректный email');
    if (!isValidPhone(phoneDigits)) return toast.warning('Некорректный телефон');
    if (mode === 'create' && !formData.password) return toast.warning('Введите пароль');

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName?.trim() || null,
      email: formData.email,
      phone: phoneDigits,
      isStaff: formData.isStaff,
      status: formData.status,
      birthDate: birthDateISO,
    };
    if (formData.password?.trim()) payload.password = formData.password;
    if (!hideRoleSelect && selectedRoleId) payload.roleId = selectedRoleId;

    try { await onSubmit(payload); onClose(); } 
    catch (err) { toast.error(err.response?.data?.message || 'Ошибка сохранения'); }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'ACTIVE', label: 'Активен' },
    { value: 'PENDING', label: 'Ожидает' },
    { value: 'BLOCKED', label: 'Заблокирован' },
    { value: 'ARCHIVED', label: 'Архивирован' }
  ];
  const roleOptions = rolesList.map(role => ({ value: String(role.id), label: role.name }));

  const renderRelationsTab = () => {
    if (!showRelationsTab) return null;
    const isStudent = currentRole === 'STUDENT';
    const relationLabel = isStudent ? 'Родители и опекуны' : 'Ученики';
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">Связанные пользователи ({relationLabel}):</div>
          {canManageRelations && (
            <button
              onClick={() => setShowAddRelationForm(true)}
              className="flex items-center gap-1 px-2 py-1 bg-[#f6a623] text-white text-xs rounded-lg hover:bg-[#e09515] transition"
              title="Добавить связь"
            >
              <Plus size={14} /> Добавить связь
            </button>
          )}
        </div>

        {loadingRelations ? (
          <div className="text-center py-4 text-gray-500">Загрузка...</div>
        ) : relatedUsers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Нет связанных пользователей</div>
        ) : (
          <div className="space-y-2">
            {relatedUsers.map(user => {
              const displayName = isStudent ? user.parentFullName : user.childFullName;
              const relationTypeRu = user.relationType === 'parent' ? 'Родитель' : user.relationType === 'guardian' ? 'Опекун' : user.relationType;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => onViewUser && onViewUser(isStudent ? user.parentUserId : user.childUserId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f6a623]/10 flex items-center justify-center">
                      <Users size={14} className="text-[#f6a623]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-500">
                        {relationTypeRu} • верифицирована: {user.verified ? 'да' : 'нет'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                    {canManageRelations && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRelation(user.id); }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Удалить связь"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Форма добавления связи */}
        {showAddRelationForm && (
          <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">Добавление связи</div>
            <div className="space-y-3">
              <CustomSelect
                value={selectedUserId}
                onChange={(val) => setSelectedUserId(val)}
                options={availableUsers.map(u => ({ value: String(u.id), label: `${u.lastName} ${u.firstName} (${u.email})` }))}
                placeholder="Выберите пользователя"
                label="Пользователь"
                clearable
              />
              <CustomSelect
                value={selectedRelationType}
                onChange={(val) => setSelectedRelationType(val)}
                options={[
                  { value: 'parent', label: 'Родитель' },
                  { value: 'guardian', label: 'Опекун' }
                ]}
                label="Тип связи"
                clearable={false}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddRelationForm(false)}
                  className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddRelation}
                  disabled={addingRelation || !selectedUserId}
                  className="px-3 py-1.5 bg-[#f6a623] text-white rounded-lg text-sm hover:bg-[#e09515] disabled:opacity-50"
                >
                  {addingRelation ? <Loader2 className="animate-spin" size={14} /> : 'Добавить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const title = mode === 'create' ? "Новый пользователь" : `Пользователь №${initialData?.id} от ${formatDate(initialData?.createdAt)}`;

  return (
    <FormModal title={title} onClose={onClose}>
      {showRelationsTab && (
        <div className="flex border-b border-gray-200 px-6 pt-2">
          <button
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 0
                ? 'text-[#f6a623] border-b-2 border-[#f6a623]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(0)}
          >
            Основная информация
          </button>
          <button
            className={`pb-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 1
                ? 'text-[#f6a623] border-b-2 border-[#f6a623]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(1)}
          >
            Связи
          </button>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4">
        {(!showRelationsTab || activeTab === 0) && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomInput label="Имя" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required placeholder="Имя" />
              <CustomInput label="Фамилия" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required placeholder="Фамилия" />
              <CustomInput label="Отчество" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} placeholder="Отчество" />
              <CustomDatePicker selected={formData.birthDate} onChange={(date) => setFormData({ ...formData, birthDate: date })} placeholder="ДД.ММ.ГГГГ" label="Дата рождения" required maxDate={new Date()} isClearable />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomInput label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required type="email" placeholder="Email" icon={Mail} />
              <CustomInput label="Телефон" value={formData.phone} onChange={handlePhoneChange} required placeholder="Телефон" icon={Phone} />
            </div>
            
            {initialData?.sourceApplicationId && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">
                  Пользователь создан на основании заявки
                  <button
                    onClick={() => onViewApplication && onViewApplication(initialData.sourceApplicationId)}
                    className="text-[#f6a623] hover:underline font-medium ml-1"
                  >
                    № {initialData.sourceApplicationId}
                    {initialData.sourceApplicationCreatedAt && (
                      <span className="ml-1">
                        от {new Date(initialData.sourceApplicationCreatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <CustomInput label="Пароль" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} type={showPassword ? 'text' : 'password'} placeholder={mode === 'create' ? 'Пароль' : 'Новый пароль (оставьте пустым)'} />
              <button type="button" className="absolute right-3 top-[2.1rem] text-gray-500" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect value={formData.status} onChange={(val) => setFormData({ ...formData, status: val })} options={statusOptions} placeholder="Статус" label="Статус" clearable={false} />
              {!hideRoleSelect && <CustomSelect value={selectedRoleId ? String(selectedRoleId) : ""} onChange={(val) => setSelectedRoleId(val ? Number(val) : null)} options={roleOptions} placeholder="Выберите роль" label="Роль" clearable />}
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isStaff} onChange={(e) => setFormData({ ...formData, isStaff: e.target.checked })} className="w-4 h-4 rounded text-[#f6a623]" /><span className="text-sm">Сотрудник</span></label>
            
            {mode === 'edit' && initialData && (
              <EntityInfo
                createdAt={initialData.createdAt}
                updatedAt={initialData.updatedAt}
                roleAssignedAt={initialData.roleAssignedAt}
                title="Данные пользователя"
              />
            )}
            
            <button onClick={handleSubmit} className="w-full bg-[#f6a623] hover:bg-[#ad7822] text-white font-medium py-2 rounded-lg transition mt-2">{mode === 'create' ? 'Добавить пользователя' : 'Сохранить изменения'}</button>
          </>
        )}

        {showRelationsTab && activeTab === 1 && renderRelationsTab()}
      </div>
    </FormModal>
  );
};

// Основная страница
export default function UsersCrudPage({ roleFilter = null }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortField, setSortField] = useState('status');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilterState, setRoleFilterState] = useState(roleFilter || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [birthDateFrom, setBirthDateFrom] = useState(null);
  const [birthDateTo, setBirthDateTo] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, blocked: 0, archived: 0, students: 0, teachers: 0, managers: 0, parents: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const defaultRoleId = roleFilter ? roles.find(r => r.name === roleFilter)?.id : null;

  // Права (предполагаем, что есть контекст или просто для демо – true)
  // В реальном проекте используйте useAuth
  const hasPermission = (perm) => true; // Замените на реальную проверку

  useEffect(() => { fetchUsersStatistics().then(setStats).catch(console.error); }, []);
  useEffect(() => { fetchRoles().then(setRoles).catch(console.error); }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFilteredUsers({ status: statusFilter || null, roleName: roleFilterState || null, search: searchQuery || null, birthDateFrom: birthDateFrom ? formatDateYMD(birthDateFrom) : null, birthDateTo: birthDateTo ? formatDateYMD(birthDateTo) : null, page, size, sort: `${sortField},${sortOrder}` });
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) { toast.error('Не удалось загрузить пользователей'); }
    finally { setLoading(false); }
  }, [statusFilter, roleFilterState, searchQuery, birthDateFrom, birthDateTo, page, size, sortField, sortOrder]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const displayedUsers = users.filter(user => !user.roles?.includes('SUPER_ADMIN'));
  const resetFilters = () => { setStatusFilter(''); setRoleFilterState(roleFilter || ''); setSearchQuery(''); setBirthDateFrom(null); setBirthDateTo(null); setPage(0); };
  const handleSort = (field) => { setSortField(field); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setPage(0); };

  const handleAddSubmit = async (formData) => {
    try {
      const newUser = await createUser(formData);
      if (formData.roleId || defaultRoleId) await createUserRole({ userId: newUser.id, roleId: formData.roleId || defaultRoleId });
      toast.success('Пользователь добавлен');
      setShowAddModal(false);
      loadUsers();
      fetchUsersStatistics().then(setStats);
    } catch (err) { toast.error('Ошибка добавления пользователя'); }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateUser(editingUser.id, formData);
      if (formData.roleId) {
        const userRoles = await fetchUserRoles(editingUser.id, null);
        const currentRoleId = userRoles.length > 0 ? userRoles[0].roleId : null;
        if (currentRoleId !== formData.roleId) {
          if (currentRoleId) { const userRole = userRoles.find(ur => ur.roleId === currentRoleId); if (userRole) await deleteUserRole(userRole.id); }
          await createUserRole({ userId: editingUser.id, roleId: formData.roleId });
        }
      }
      toast.success('Пользователь обновлён');
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
      fetchUsersStatistics().then(setStats);
    } catch (err) { toast.error('Ошибка обновления пользователя'); }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(editingUser.id);
      toast.success('Пользователь удалён');
      setShowDeleteModal(false);
      setEditingUser(null);
      loadUsers();
      fetchUsersStatistics().then(setStats);
    } catch (err) { toast.error('Ошибка удаления пользователя'); }
  };

  const refreshData = () => {
    loadUsers();
    fetchUsersStatistics().then(setStats);
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/users/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон Excel для импорта пользователей скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const userData = await fetchUserById(userId);
      setViewingUser(userData);
      setViewUserModalOpen(true);
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err);
      toast.error('Не удалось загрузить данные пользователя');
    }
  };

  const handleCloseViewModal = () => {
    setViewUserModalOpen(false);
    setViewingUser(null);
  };

  const handleUpdateViewUser = async (formData) => {
    try {
      await updateUser(viewingUser.id, formData);
      if (formData.roleId) {
        const userRoles = await fetchUserRoles(viewingUser.id, null);
        const currentRoleId = userRoles.length > 0 ? userRoles[0].roleId : null;
        if (currentRoleId !== formData.roleId) {
          if (currentRoleId) { const userRole = userRoles.find(ur => ur.roleId === currentRoleId); if (userRole) await deleteUserRole(userRole.id); }
          await createUserRole({ userId: viewingUser.id, roleId: formData.roleId });
        }
      }
      toast.success('Пользователь обновлён');
      handleCloseViewModal();
      loadUsers();
      fetchUsersStatistics().then(setStats);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка обновления пользователя');
    }
  };

  const roleName = roleFilterState ? (roleFilterState === 'STUDENT' ? 'Ученики' : roleFilterState === 'PARENT' ? 'Родители' : roleFilterState === 'TEACHER' ? 'Преподаватели' : 'Пользователи') : 'Пользователи';
  const RoleIcon = roleFilterState === 'STUDENT' ? GraduationCap : roleFilterState === 'PARENT' ? UsersRound : roleFilterState === 'TEACHER' ? UserCheck : Users;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0 p-2 sm:p-6 pb-1 sm:pb-4">
        <div className="flex items-center gap-2 pl-10 md:pl-0 mb-2 sm:mb-4">
          <RoleIcon size={20} className="text-[#f6a623]" />
          <h1 className="text-lg sm:text-3xl font-bold text-gray-800">{roleName}</h1>
        </div>
        {roleFilter === null && <UserStatsCards metrics={stats} roleFilter={roleFilter} />}
        <UserFilterPanel 
          statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
          roleFilter={roleFilter} roleFilterState={roleFilterState} setRoleFilterState={setRoleFilterState}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          birthDateFrom={birthDateFrom} setBirthDateFrom={setBirthDateFrom}
          birthDateTo={birthDateTo} setBirthDateTo={setBirthDateTo}
          resetFilters={resetFilters} onAddUser={() => setShowAddModal(true)} onImport={refreshData} onDownloadTemplate={downloadTemplate}
          roles={roles} setPage={setPage}
        />
      </div>

      <div className="flex-1 overflow-auto px-2 sm:px-6 pt-0 scrollbar-hidden">
        {loading ? <div className="text-center py-8 text-sm">Загрузка...</div> : 
         displayedUsers.length === 0 ? <div className="text-center py-8 bg-white rounded-xl shadow-sm"><div className="text-gray-500 text-sm">Нет пользователей</div></div> : 
         <UsersTable users={displayedUsers} onEdit={(user) => { setEditingUser(user); setShowEditModal(true); }} onDelete={(id) => { setEditingUser(users.find(u => u.id === id)); setShowDeleteModal(true); }} sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />}
      </div>

      {totalPages > 0 && <div className="flex-shrink-0 p-2 sm:p-6 bg-gray-50 border-t"><UsersPagination page={page} totalPages={totalPages} setPage={setPage} size={size} setSize={setSize} totalElements={totalElements} usersCount={users.length} /></div>}

      <UserFormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} mode="create" onSubmit={handleAddSubmit} defaultRoleId={defaultRoleId} hideRoleSelect={roleFilter !== null} rolesList={roles} onViewUser={handleViewUser} canManageRelations={hasPermission("user.update")} />
      <UserFormModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingUser(null); }} mode="edit" initialData={editingUser} onSubmit={handleEditSubmit} rolesList={roles} hideRoleSelect={roleFilter !== null} onViewUser={handleViewUser} canManageRelations={hasPermission("user.update")} />
      <UserFormModal isOpen={viewUserModalOpen} onClose={handleCloseViewModal} mode="edit" initialData={viewingUser} onSubmit={handleUpdateViewUser} rolesList={roles} hideRoleSelect={roleFilter !== null} onViewUser={handleViewUser} canManageRelations={hasPermission("user.update")} />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <style>{`.scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; } .scrollbar-hidden::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}