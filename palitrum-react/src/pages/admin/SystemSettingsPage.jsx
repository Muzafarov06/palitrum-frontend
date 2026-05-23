// src/pages/admin/SystemSettingsPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Settings, Save, Upload, Globe, BookOpen, Bell, Shield, Link2,
  Database, Activity, CloudDownload, RefreshCw, Trash2, X, Filter
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getSystemSettings, updateSystemSettings, replaceFiles } from "../../api/api";
import CustomInput from "../../components/common/CustomInput";
import CustomSelect from "../../components/common/CustomSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// Компонент переключателя (Toggle)
const Toggle = ({ enabled, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
      enabled ? "bg-[#f6a623]" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// Карточка секции (единый стиль с другими страницами)
const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-[#f6a623]/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-[#f6a623]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      orgName: "",
      email: "",
      phone: "",
      address: "",
      timezone: "UTC+3",
      language: "ru",
      currency: "RUB",
      logoUrl: "",
    },
    academic: {
      maxStudentsPerGroup: 15,
      minAge: 4,
      lessonDuration: 45,
      gradingSystem: "FIVE_POINT",
      autoCreatePeriods: true,
      defaultSemesterWeeks: 16,
    },
    notifications: {
      emailEnabled: true,
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPass: "",
      senderEmail: "",
      smsEnabled: false,
      smsApiKey: "",
      notifyNewApplication: true,
      notifyScheduleChange: true,
      notifyLessonReminder: true,
    },
    security: {
      minPasswordLength: 8,
      requireSpecialChars: true,
      sessionTimeoutMinutes: 60,
      maxLoginAttempts: 5,
      twoFactorEnabled: false,
      allowPasswordReset: true,
    },
    integrations: {
      googleCalendarApiKey: "",
      zoomApiKey: "",
      webhookUrl: "",
      syncCalendar: false,
    },
    backup: {
      autoBackup: true,
      interval: "DAILY",
      startTime: "03:00",
      storage: "LOCAL",
    },
    audit: {
      storeLogs: true,
      logRetentionDays: 90,
    },
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSystemSettings();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn("Не удалось загрузить настройки, используются значения по умолчанию");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Загрузка логотипа...");
    try {
      const uploaded = await replaceFiles("LOGO", 1, [file]);
      if (uploaded && uploaded.length > 0) {
        const newLogoUrl = uploaded[0].fileUrl;
        handleChange("general", "logoUrl", newLogoUrl);
        toast.update(toastId, { render: "Логотип обновлён!", type: "success", isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: "Ошибка загрузки логотипа", type: "error", isLoading: false, autoClose: 3000 });
      console.error(err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSettings(settings);
      toast.success("Настройки успешно сохранены");
    } catch (err) {
      toast.error("Ошибка при сохранении настроек");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const timezones = [
    { value: "UTC-12", label: "UTC-12" },
    { value: "UTC+3", label: "Москва (UTC+3)" },
  ];

  const languages = [
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
  ];

  const currencies = [
    { value: "RUB", label: "RUB (₽)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
  ];

  const gradingSystems = [
    { value: "FIVE_POINT", label: "5-балльная" },
    { value: "TWELVE_POINT", label: "12-балльная" },
    { value: "PASS_FAIL", label: "Зачёт/Незачёт" },
  ];

  const backupIntervals = [
    { value: "DAILY", label: "Ежедневно" },
    { value: "WEEKLY", label: "Еженедельно" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full flex flex-col">
        {/* Шапка - фиксированная, с отступом для сайдбара */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 pl-10 md:pl-0">
              <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
                <Settings size={24} className="text-[#f6a623]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Системные настройки</h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Управление глобальными параметрами платформы</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 whitespace-nowrap text-sm sm:text-base"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Сохранение..." : "Сохранить все"}
            </button>
          </div>
        </div>

        {/* Контент – скроллируемый */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 scrollbar-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Общие данные организации */}
            <SectionCard title="Общие данные организации" icon={Globe}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Название организации"
                  value={settings.general.orgName}
                  onChange={e => handleChange("general", "orgName", e.target.value)}
                  placeholder="ООО «Учебный центр»"
                />
                <CustomInput
                  label="Контактный email"
                  type="email"
                  value={settings.general.email}
                  onChange={e => handleChange("general", "email", e.target.value)}
                  placeholder="info@example.com"
                />
                <CustomInput
                  label="Телефон"
                  value={settings.general.phone}
                  onChange={e => handleChange("general", "phone", e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
                <CustomInput
                  label="Физический адрес"
                  value={settings.general.address}
                  onChange={e => handleChange("general", "address", e.target.value)}
                  placeholder="ул. Примерная, д. 1"
                />
                <CustomSelect
                  label="Часовой пояс"
                  value={settings.general.timezone}
                  onChange={val => handleChange("general", "timezone", val)}
                  options={timezones}
                />
                <CustomSelect
                  label="Язык по умолчанию"
                  value={settings.general.language}
                  onChange={val => handleChange("general", "language", val)}
                  options={languages}
                />
                <CustomSelect
                  label="Валюта"
                  value={settings.general.currency}
                  onChange={val => handleChange("general", "currency", val)}
                  options={currencies}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логотип</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {settings.general.logoUrl ? (
                      <img src={settings.general.logoUrl} alt="Logo" className="h-10 w-10 object-contain rounded border" />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                        <Upload size={16} />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-[#f6a623] hover:underline"
                    >
                      Загрузить
                    </button>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Учебный процесс */}
            <SectionCard title="Учебный процесс" icon={BookOpen}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Макс. студентов в группе"
                  type="number"
                  value={settings.academic.maxStudentsPerGroup}
                  onChange={e => handleChange("academic", "maxStudentsPerGroup", parseInt(e.target.value))}
                />
                <CustomInput
                  label="Минимальный возраст (лет)"
                  type="number"
                  value={settings.academic.minAge}
                  onChange={e => handleChange("academic", "minAge", parseInt(e.target.value))}
                />
                <CustomInput
                  label="Длительность академ. часа (мин)"
                  type="number"
                  value={settings.academic.lessonDuration}
                  onChange={e => handleChange("academic", "lessonDuration", parseInt(e.target.value))}
                />
                <CustomSelect
                  label="Система оценивания"
                  value={settings.academic.gradingSystem}
                  onChange={val => handleChange("academic", "gradingSystem", val)}
                  options={gradingSystems}
                />
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Автоматически создавать учебные периоды</span>
                  <Toggle
                    enabled={settings.academic.autoCreatePeriods}
                    onChange={val => handleChange("academic", "autoCreatePeriods", val)}
                  />
                </div>
                <CustomInput
                  label="Длительность семестра по умолчанию (недель)"
                  type="number"
                  value={settings.academic.defaultSemesterWeeks}
                  onChange={e => handleChange("academic", "defaultSemesterWeeks", parseInt(e.target.value))}
                />
              </div>
            </SectionCard>

            {/* Уведомления */}
            <SectionCard title="Уведомления" icon={Bell}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Email-уведомления</span>
                  <Toggle
                    enabled={settings.notifications.emailEnabled}
                    onChange={val => handleChange("notifications", "emailEnabled", val)}
                  />
                </div>
                {settings.notifications.emailEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 sm:pl-6 border-l-2 border-[#f6a623]/30">
                    <CustomInput
                      label="SMTP хост"
                      value={settings.notifications.smtpHost}
                      onChange={e => handleChange("notifications", "smtpHost", e.target.value)}
                    />
                    <CustomInput
                      label="Порт"
                      type="number"
                      value={settings.notifications.smtpPort}
                      onChange={e => handleChange("notifications", "smtpPort", parseInt(e.target.value))}
                    />
                    <CustomInput
                      label="Пользователь SMTP"
                      value={settings.notifications.smtpUser}
                      onChange={e => handleChange("notifications", "smtpUser", e.target.value)}
                    />
                    <CustomInput
                      label="Пароль SMTP"
                      type="password"
                      value={settings.notifications.smtpPass}
                      onChange={e => handleChange("notifications", "smtpPass", e.target.value)}
                    />
                    <CustomInput
                      label="Email отправителя"
                      value={settings.notifications.senderEmail}
                      onChange={e => handleChange("notifications", "senderEmail", e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">SMS-уведомления</span>
                  <Toggle
                    enabled={settings.notifications.smsEnabled}
                    onChange={val => handleChange("notifications", "smsEnabled", val)}
                  />
                </div>
                {settings.notifications.smsEnabled && (
                  <div className="pl-4 sm:pl-6 border-l-2 border-[#f6a623]/30">
                    <CustomInput
                      label="API ключ SMS-провайдера"
                      type="password"
                      value={settings.notifications.smsApiKey}
                      onChange={e => handleChange("notifications", "smsApiKey", e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">События для уведомлений</h4>
                  <div className="space-y-2">
                    {[
                      { field: "notifyNewApplication", label: "Новая заявка" },
                      { field: "notifyScheduleChange", label: "Изменение расписания" },
                      { field: "notifyLessonReminder", label: "Напоминание о занятии" },
                    ].map(item => (
                      <div key={item.field} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <Toggle
                          enabled={settings.notifications[item.field]}
                          onChange={val => handleChange("notifications", item.field, val)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Безопасность */}
            <SectionCard title="Безопасность" icon={Shield}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Мин. длина пароля"
                  type="number"
                  value={settings.security.minPasswordLength}
                  onChange={e => handleChange("security", "minPasswordLength", parseInt(e.target.value))}
                />
                <div className="flex items-center justify-between self-end">
                  <span className="text-sm font-medium text-gray-700">Специальные символы обязательны</span>
                  <Toggle
                    enabled={settings.security.requireSpecialChars}
                    onChange={val => handleChange("security", "requireSpecialChars", val)}
                  />
                </div>
                <CustomInput
                  label="Таймаут сессии (минут)"
                  type="number"
                  value={settings.security.sessionTimeoutMinutes}
                  onChange={e => handleChange("security", "sessionTimeoutMinutes", parseInt(e.target.value))}
                />
                <CustomInput
                  label="Макс. попыток входа"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={e => handleChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Двухфакторная аутентификация</span>
                  <Toggle
                    enabled={settings.security.twoFactorEnabled}
                    onChange={val => handleChange("security", "twoFactorEnabled", val)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Разрешить восстановление пароля</span>
                  <Toggle
                    enabled={settings.security.allowPasswordReset}
                    onChange={val => handleChange("security", "allowPasswordReset", val)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Интеграции */}
            <SectionCard title="Интеграции" icon={Link2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomInput
                  label="Google Calendar API ключ"
                  type="password"
                  value={settings.integrations.googleCalendarApiKey}
                  onChange={e => handleChange("integrations", "googleCalendarApiKey", e.target.value)}
                />
                <CustomInput
                  label="Zoom API ключ"
                  type="password"
                  value={settings.integrations.zoomApiKey}
                  onChange={e => handleChange("integrations", "zoomApiKey", e.target.value)}
                />
                <div className="sm:col-span-2">
                  <CustomInput
                    label="Webhook URL"
                    value={settings.integrations.webhookUrl}
                    onChange={e => handleChange("integrations", "webhookUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Синхронизация с Google Календарём</span>
                  <Toggle
                    enabled={settings.integrations.syncCalendar}
                    onChange={val => handleChange("integrations", "syncCalendar", val)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Резервное копирование */}
            <SectionCard title="Резервное копирование" icon={Database}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Автоматическое резервное копирование</span>
                  <Toggle
                    enabled={settings.backup.autoBackup}
                    onChange={val => handleChange("backup", "autoBackup", val)}
                  />
                </div>
                {settings.backup.autoBackup && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 sm:pl-6 border-l-2 border-[#f6a623]/30">
                    <CustomSelect
                      label="Интервал"
                      value={settings.backup.interval}
                      onChange={val => handleChange("backup", "interval", val)}
                      options={backupIntervals}
                    />
                    <CustomInput
                      label="Время запуска"
                      type="time"
                      value={settings.backup.startTime}
                      onChange={e => handleChange("backup", "startTime", e.target.value)}
                    />
                    <CustomSelect
                      label="Хранилище"
                      value={settings.backup.storage}
                      onChange={val => handleChange("backup", "storage", val)}
                      options={[
                        { value: "LOCAL", label: "Локально" },
                        { value: "CLOUD", label: "Облако (S3)" },
                      ]}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    className="bg-[#f6a623] hover:bg-[#e09515] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                  >
                    <CloudDownload size={14} /> Создать бэкап
                  </button>
                  <button
                    type="button"
                    className="bg-white border border-gray-300 hover:bg-gray-50 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                  >
                    <RefreshCw size={14} /> Восстановить
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Аудит и логи */}
            <SectionCard title="Аудит и логи" icon={Activity}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Вести журнал действий</span>
                <Toggle
                  enabled={settings.audit.storeLogs}
                  onChange={val => handleChange("audit", "storeLogs", val)}
                />
              </div>
              {settings.audit.storeLogs && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomInput
                    label="Срок хранения логов (дней)"
                    type="number"
                    value={settings.audit.logRetentionDays}
                    onChange={e => handleChange("audit", "logRetentionDays", parseInt(e.target.value))}
                  />
                  <button
                    type="button"
                    className="self-end bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                  >
                    <Trash2 size={14} /> Очистить старые логи
                  </button>
                </div>
              )}
            </SectionCard>

            {/* Дублирующая кнопка сохранения внизу */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#f6a623] hover:bg-[#e09515] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-sm"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Сохранение..." : "Сохранить все настройки"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}