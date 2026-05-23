import React from "react";
import { Download, Upload, RefreshCw, Plus } from "lucide-react";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import CustomSelect from "../../components/common/CustomSelect";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import IconButton from "../../components/common/IconButton";   // импорт кастомной кнопки

export default function UserFilterPanel({
  statusFilter,
  setStatusFilter,
  roleFilter,
  roleFilterState,
  setRoleFilterState,
  searchQuery,
  setSearchQuery,
  birthDateFrom,
  setBirthDateFrom,
  birthDateTo,
  setBirthDateTo,
  resetFilters,
  onAddUser,
  roles,
  setPage,
  onExport,
  onImport,
}) {
  // Опции для статуса
  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "ACTIVE", label: "Активен" },
    { value: "PENDING", label: "Ожидает" },
    { value: "BLOCKED", label: "Заблокирован" },
    { value: "ARCHIVED", label: "Архивирован" },
  ];

  // Опции для роли (исключаем SUPER_ADMIN)
  const roleOptions = [
    { value: "", label: "Все роли" },
    ...roles
      .filter(role => role.name !== "SUPER_ADMIN")
      .map(role => ({ value: role.name, label: role.name }))
  ];

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleRoleChange = (value) => {
    setRoleFilterState(value);
    setPage(0);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Первая строка – кнопки и выпадающие списки */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-[#f6a623] text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg"
        >
          <Plus size={18} /> Добавить
        </button>

        <div className="w-48">
          <CustomSelect
            value={statusFilter}
            onChange={handleStatusChange}
            options={statusOptions}
            placeholder="Статус"
            clearable
          />
        </div>

        {roleFilter === null && (
          <div className="w-48">
            <CustomSelect
              value={roleFilterState}
              onChange={handleRoleChange}
              options={roleOptions}
              placeholder="Все роли"
              clearable
            />
          </div>
        )}

        {/* Кнопка сброса – белая с серой иконкой */}
        <IconButton
          onClick={resetFilters}
          title="Сбросить"
          icon={RefreshCw}
          bgColor="bg-white"
          textColor="text-gray-600"
        />

        {/* Кнопка экспорта – белая с серой иконкой */}
        <IconButton
          onClick={onExport}
          title="Экспорт"
          icon={Download}
          bgColor="bg-white"
          textColor="text-gray-600"
        />

        {/* Кнопка импорта – белая с серой иконкой (если есть) */}
        {onImport && (
          <IconButton
            onClick={onImport}
            title="Импорт"
            icon={Upload}
            bgColor="bg-white"
            textColor="text-gray-600"
          />
        )}
      </div>

      {/* Вторая строка – поиск и даты рождения */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 block mb-1">Поиск (ФИО, email)</label>
          <CustomSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск..."
            setPage={setPage}
          />
        </div>

        <div className="w-44">
          <CustomDatePicker
            selected={birthDateFrom}
            onChange={(date) => { setBirthDateFrom(date); setPage(0); }}
            placeholder="ДД.ММ.ГГГГ"
            label="Дата рождения от"
            maxDate={new Date()}
          />
        </div>

        <div className="w-44">
          <CustomDatePicker
            selected={birthDateTo}
            onChange={(date) => { setBirthDateTo(date); setPage(0); }}
            placeholder="ДД.ММ.ГГГГ"
            label="Дата рождения до"
            maxDate={new Date()}
          />
        </div>
      </div>
    </div>
  );
}