import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Shield, ChevronRight, FileText } from 'lucide-react';
import FormModal from '../../components/common/FormModal';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import EntityInfo from '../../components/common/EntityInfo';
import { isValidEmail, isValidPhone, isValidPersonName } from '../../utils/validators';
import { formatDate } from '../../utils/dateUtils';
import { createPhoneChangeHandler, phoneToMask } from '../../utils/phoneMask';
import { toast } from 'react-toastify';
import { fetchUserRelations } from '../../api/api';

// Цвет статуса пользователя
const getStatusColor = (status) => {
  const colors = {
    ACTIVE: "text-green-600",
    PENDING: "text-yellow-600",
    BLOCKED: "text-red-600",
    ARCHIVED: "text-gray-600"
  };
  return colors[status] || "text-gray-600";
};

// Текст статуса
const getStatusText = (status) => {
  const texts = {
    ACTIVE: "Активен",
    PENDING: "Ожидает",
    BLOCKED: "Заблокирован",
    ARCHIVED: "Архивирован"
  };
  return texts[status] || status;
};

export default function UserFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  defaultRoleId = null,
  hideRoleSelect = false,
  rolesList = [],
  onViewUser,               // открыть связанного пользователя
  onViewApplication = null  // открыть заявку-источник (опционально)
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    password: '',
    birthDate: null,
    status: 'ACTIVE',
    isStaff: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  
  const [activeTab, setActiveTab] = useState(0);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);

  const currentRole = (() => {
    if (mode !== 'edit' || !initialData?.roles?.length) return null;
    return initialData.roles[0];
  })();
  
  const showRelationsTab = mode === 'edit' && initialData?.id && (currentRole === 'STUDENT' || currentRole === 'PARENT');

  // Загрузка связанных пользователей
  useEffect(() => {
    if (!isOpen || !showRelationsTab) return;
    const loadRelations = async () => {
      setLoadingRelations(true);
      try {
        const relationType = currentRole === 'STUDENT' ? 'parent' : 'child';
        const relations = await fetchUserRelations(initialData.id, relationType);
        setRelatedUsers(relations);
      } catch (err) {
        console.error('Ошибка загрузки связанных пользователей:', err);
        toast.error('Не удалось загрузить связи');
      } finally {
        setLoadingRelations(false);
      }
    };
    loadRelations();
  }, [isOpen, showRelationsTab, initialData?.id, currentRole]);

  const getCurrentRoleId = () => {
    if (mode === 'edit' && initialData && initialData.roles?.length) {
      const roleName = initialData.roles[0];
      const role = rolesList.find(r => r.name === roleName);
      return role ? role.id : null;
    }
    return null;
  };

  useEffect(() => {
    if (isOpen) setActiveTab(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'create') {
      setSelectedRoleId(defaultRoleId || null);
    } else if (mode === 'edit') {
      setSelectedRoleId(getCurrentRoleId());
    }
  }, [isOpen, mode, defaultRoleId, initialData, rolesList]);

  const handlePhoneChange = createPhoneChangeHandler(setFormData);

  const parseBirthDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      if (dateValue.includes('-')) {
        const [year, month, day] = dateValue.split('-');
        return new Date(year, month - 1, day);
      }
      if (dateValue.includes('.')) {
        const [day, month, year] = dateValue.split('.');
        return new Date(year, month - 1, day);
      }
    }
    return null;
  };

  const parseIsStaff = (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === 'true' || value === '1';
    return false;
  };

  const normalizeUser = (data) => {
    if (!data) return {};
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const middleName = data.middleName || '';
    const email = data.email || '';
    let phone = '8';
    if (data.phone) phone = phoneToMask(data.phone);
    let birthDate = parseBirthDate(data.birthDate);
    let status = 'ACTIVE';
    if (data.status && ['ACTIVE', 'PENDING', 'BLOCKED', 'ARCHIVED'].includes(data.status)) {
      status = data.status;
    }
    let isStaff = false;
    const staffValue = data.isStaff ?? data.staff ?? data.is_staff;
    if (staffValue !== undefined && staffValue !== null) {
      isStaff = parseIsStaff(staffValue);
    }
    return { firstName, lastName, middleName, email, phone, birthDate, status, isStaff };
  };

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && initialData) {
      const normalized = normalizeUser(initialData);
      setFormData({ ...normalized, password: '' });
    } else if (mode === 'create') {
      setFormData({
        firstName: '', lastName: '', middleName: '', email: '', phone: '8',
        password: '', birthDate: null, status: 'ACTIVE', isStaff: false
      });
    }
  }, [isOpen, mode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBirthDateChange = (date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  const handleSubmit = async () => {
    let phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.startsWith('8')) phoneDigits = '+7' + phoneDigits.slice(1);
    else if (phoneDigits.startsWith('7')) phoneDigits = '+' + phoneDigits;
    else phoneDigits = '+7' + phoneDigits;
    let birthDateISO = formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : null;

    if (!isValidPersonName(formData.firstName, true)) {
      toast.warning('Имя должно содержать только буквы, дефис или пробел и быть не короче 2 символов');
      return;
    }
    if (!isValidPersonName(formData.lastName, true)) {
      toast.warning('Фамилия должна содержать только буквы, дефис или пробел и быть не короче 2 символов');
      return;
    }
    if (!isValidPersonName(formData.middleName, false)) {
      toast.warning('Отчество должно содержать только буквы, дефис или пробел (если указано, не короче 2 символов)');
      return;
    }
    if (!formData.birthDate) {
      toast.warning('Укажите дату рождения');
      return;
    }
    const today = new Date();
    const birthDateObj = new Date(formData.birthDate);
    birthDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (birthDateObj > today) {
      toast.warning('Дата рождения не может быть в будущем');
      return;
    }
    const age = today.getFullYear() - birthDateObj.getFullYear();
    if (age > 120) {
      toast.warning('Дата рождения не может быть более 120 лет назад');
      return;
    }

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      middleName: formData.middleName ? formData.middleName.trim() : null,
      email: formData.email,
      phone: phoneDigits,
      isStaff: formData.isStaff,
      status: formData.status,
    };
    if (birthDateISO) payload.birthDate = birthDateISO;
    if (formData.password && formData.password.trim() !== '') payload.password = formData.password;
    if (!hideRoleSelect && selectedRoleId) payload.roleId = selectedRoleId;

    if (!payload.email) {
      toast.warning('Введите email');
      return;
    }
    if (!isValidEmail(payload.email)) {
      toast.warning('Некорректный email');
      return;
    }
    if (!payload.phone) {
      toast.warning('Введите телефон');
      return;
    }
    if (!isValidPhone(payload.phone)) {
      toast.warning('Некорректный телефон');
      return;
    }
    if (mode === 'create' && !payload.password) {
      toast.warning('Введите пароль');
      return;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Ошибка сохранения данных';
      toast.error(errorMsg);
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'ACTIVE', label: 'Активен' },
    { value: 'PENDING', label: 'Ожидает' },
    { value: 'BLOCKED', label: 'Заблокирован' },
    { value: 'ARCHIVED', label: 'Архивирован' },
  ];

  const roleOptions = rolesList.map(role => ({ value: String(role.id), label: role.name }));

  const title = mode === 'create'
    ? "Новый пользователь"
    : (initialData?.id
      ? `Пользователь №${initialData.id} от ${formatDate(initialData.createdAt)}`
      : "Редактировать пользователя");

  const showStatus = mode === 'edit' && initialData?.createdAt && initialData?.status;
  const statusText = showStatus ? getStatusText(formData.status) : null;
  const statusColor = showStatus ? getStatusColor(formData.status) : null;

  const renderRelationsTab = () => {
    if (!showRelationsTab) return null;
    if (loadingRelations) {
      return <div className="text-center py-4 text-gray-500">Загрузка...</div>;
    }
    if (relatedUsers.length === 0) {
      return <div className="text-center py-4 text-gray-500">Нет связанных пользователей</div>;
    }
    const relationLabel = currentRole === 'STUDENT' ? 'Родители' : 'Дети';
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700">Связанные пользователи ({relationLabel.toLowerCase()}):</div>
        {relatedUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
            onClick={() => onViewUser && onViewUser(user.id)}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-[#f6a623]" />
              <div>
                <div className="font-medium text-gray-900">
                  {user.lastName} {user.firstName} {user.middleName || ''}
                </div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <FormModal
      title={title}
      onClose={onClose}
      status={statusText}
      statusColor={statusColor}
    >
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

      <div className="p-6 pt-4 space-y-6">
        {(!showRelationsTab || activeTab === 0) && (
          <>
            {/* Личная информация */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <User size={18} className="w-5 h-5 text-[#f6a623]" />
                <h3 className="text-lg font-semibold text-gray-900">Личная информация</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput label="Имя" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Имя *" />
                <CustomInput label="Фамилия" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Фамилия *" />
                <CustomInput label="Отчество" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Отчество" />
                <div>
                  <CustomDatePicker
                    selected={formData.birthDate}
                    onChange={handleBirthDateChange}
                    placeholder="ДД.ММ.ГГГГ"
                    label="Дата рождения"
                    required
                    maxDate={new Date()}
                    isClearable
                  />
                </div>
              </div>
            </div>

            {/* Контакты */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Mail size={18} className="w-5 h-5 text-[#f6a623]" />
                <h3 className="text-lg font-semibold text-gray-900">Контактные данные</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput label="Email" name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="Email *" icon={Mail} />
                <CustomInput label="Телефон" name="phone" value={formData.phone} onChange={handlePhoneChange} required placeholder="Телефон *" icon={Phone} />
              </div>
            </div>

            {/* Информация о заявке-источнике */}
            {initialData?.sourceApplicationId && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <FileText size={18} className="w-5 h-5 text-[#f6a623]" />
                  <h3 className="text-lg font-semibold text-gray-900">Источник регистрации</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Пользователь создан на основании заявки
                    <button
                    
                      onClick={() => onViewApplication && onViewApplication(initialData.sourceApplicationId)}
                      className="text-[#f6a623] hover:underline font-medium ml-1"
                    >
                      <span className="text-[#f6a623] hover:underline font-medium ml-1">
                      № {initialData.sourceApplicationId}
                      </span>
                      {initialData.sourceApplicationCreatedAt && (
                      <span className="text-[#f6a623] hover:underline font-medium ml-1">
                        от {new Date(initialData.sourceApplicationCreatedAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Учётные данные */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Shield size={18} className="w-5 h-5 text-[#f6a623]" />
                <h3 className="text-lg font-semibold text-gray-900">Учётные данные</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <CustomInput
                    label="Пароль"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'create' ? 'Пароль *' : 'Новый пароль (оставьте пустым, чтобы не менять)'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[2.3rem] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  options={statusOptions}
                  placeholder="Статус"
                  label="Статус"
                  clearable={false}
                />
                <label className="flex items-center gap-2 col-span-full">
                  <input name="isStaff" type="checkbox" checked={formData.isStaff} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-[#f6a623] focus:ring-[#f6a623]" />
                  <span className="text-sm text-gray-700">Сотрудник</span>
                </label>
              </div>
            </div>

            {/* Роль */}
            {!hideRoleSelect && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Shield size={18} className="w-5 h-5 text-[#f6a623]" />
                  <h3 className="text-lg font-semibold text-gray-900">Назначение роли</h3>
                </div>
                <CustomSelect
                  value={selectedRoleId ? String(selectedRoleId) : ""}
                  onChange={(val) => setSelectedRoleId(val ? Number(val) : null)}
                  options={roleOptions}
                  placeholder={mode === 'create' ? 'Выберите роль' : 'Не выбрана'}
                  clearable={true}
                />
              </div>
            )}

            {mode === 'edit' && initialData && (
              <EntityInfo
                createdAt={initialData.createdAt}
                updatedAt={initialData.updatedAt}
                roleAssignedAt={initialData.roleAssignedAt}
                title="Данные пользователя"
              />
            )}

            <button
              className="w-full bg-[#f6a623] hover:bg-[#ad7822] text-white font-medium py-2.5 rounded-xl transition duration-200 shadow-md mt-2"
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Добавить пользователя' : 'Сохранить изменения'}
            </button>
          </>
        )}

        {showRelationsTab && activeTab === 1 && renderRelationsTab()}
      </div>
    </FormModal>
  );
}