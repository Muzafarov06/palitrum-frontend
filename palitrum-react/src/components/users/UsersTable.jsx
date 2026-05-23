import React from "react";
import { Pencil, Trash, Mail, Phone, ChevronUp, ChevronDown } from "lucide-react";

const getStatusBorderColor = (status) => {
  switch (status) {
    case "ACTIVE": return "#10b981";
    case "PENDING": return "#f59e0b";
    case "BLOCKED": return "#ef4444";
    case "ARCHIVED": return "#6b7280";
    default: return "#e5e7eb";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "ACTIVE": return "Активен";
    case "PENDING": return "Ожидает";
    case "BLOCKED": return "Заблокирован";
    case "ARCHIVED": return "Архивирован";
    default: return status;
  }
};

// Перевод ролей на русский
const getRoleName = (role) => {
  const roleMap = {
    ADMIN: "Администратор",
    SUPER_ADMIN: "Супер-администратор",
    MANAGER: "Менеджер",
    TEACHER: "Преподаватель",
    STUDENT: "Ученик",
    PARENT: "Родитель",
  };
  return roleMap[role] || role;
};

export default function UsersTable({ users, onEdit, onDelete, sortField, sortOrder, onSort }) {
  const SortIcon = ({ field }) => sortField === field ? (sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="hidden md:grid grid-cols-11 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="col-span-3 cursor-pointer hover:text-gray-700" onClick={() => onSort('lastName')}>
          ФИО <SortIcon field="lastName" />
        </div>
        <div className="col-span-3 cursor-pointer hover:text-gray-700" onClick={() => onSort('email')}>
          Контакты <SortIcon field="email" />
        </div>
        <div className="col-span-2 cursor-pointer hover:text-gray-700" onClick={() => onSort('birthDate')}>
          Дата рождения <SortIcon field="birthDate" />
        </div>
        <div className="col-span-2 cursor-pointer hover:text-gray-700" onClick={() => onSort('status')}>
          Статус / Роль <SortIcon field="status" />
        </div>
        <div className="col-span-1 text-right">Действия</div>
      </div>
      <div className="divide-y divide-gray-100">
        {users.map(user => {
          // Получаем список ролей (массив строк) и переводим каждую
          const roles = user.roles || (user.role ? [user.role] : []);
          const rolesRussian = roles.map(getRoleName).join(", ");
          
          return (
            <div
              key={user.id}
              className="block md:grid md:grid-cols-11 gap-3 px-5 py-4 hover:bg-gray-50 transition items-center border-r-4"
              style={{ borderRightColor: getStatusBorderColor(user.status) }}
            >
              {/* ФИО + аватар */}
              <div className="flex items-center gap-3 mb-2 md:mb-0 col-span-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-gray-700 font-semibold shadow-inner">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{user.lastName} {user.firstName}</div>
                  {user.middleName && <div className="text-xs text-gray-400">{user.middleName}</div>}
                </div>
              </div>
              {/* Контакты */}
              <div className="col-span-3 space-y-0.5 mb-2 md:mb-0">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Mail size={14} className="text-[#f6a623]" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone size={14} className="text-[#f6a623]" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
              {/* Дата рождения */}
              <div className="col-span-2 mb-2 md:mb-0 text-sm text-gray-600">
                {user.birthDate ? new Date(user.birthDate).toLocaleDateString('ru-RU') : '—'}
              </div>
              {/* Статус + роль */}
              <div className="col-span-2 mb-2 md:mb-0">
                <div className="text-gray-900 font-medium">{getStatusText(user.status)}</div>
                {rolesRussian && <div className="text-xs text-gray-500 mt-1">{rolesRussian}</div>}
              </div>
              {/* Действия */}
              <div className="col-span-1 flex justify-end gap-2">
                <button onClick={() => onEdit(user)} className="p-1.5 text-[#f6a623] hover:bg-[#f6a623] hover:bg-opacity-10 rounded-lg transition" title="Редактировать">
                  <Pencil size={16} />
                </button>
                <button onClick={() => onDelete(user.id)} className="p-1.5 text-[#f6a623] hover:bg-[#f6a623] hover:bg-opacity-10 rounded-lg transition" title="Удалить">
                  <Trash size={16} />
                </button>
              </div>
              {/* Мобильная версия */}
              <div className="md:hidden mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400 flex flex-wrap gap-x-4">
                {user.birthDate && <span>📅 {new Date(user.birthDate).toLocaleDateString('ru-RU')}</span>}
                <span>Статус: {getStatusText(user.status)}</span>
                {rolesRussian && <span>Роль: {rolesRussian}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}