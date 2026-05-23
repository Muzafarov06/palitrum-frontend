// src/components/common/EntityInfo.jsx
import React from 'react';
import { Calendar, RefreshCw, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

export default function EntityInfo({ createdAt, updatedAt, roleAssignedAt, title = "Данные записи" }) {
  if (!createdAt && !updatedAt && !roleAssignedAt) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <div className="text-xs font-semibold text-gray-500 mb-1">{title}</div>
      {createdAt && (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          <span className="text-xs">Запись создана: {formatDateTime(createdAt)}</span>
        </div>
      )}
      {updatedAt && (
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw size={14} />
          <span className="text-xs">Последнее изменение: {formatDateTime(updatedAt)}</span>
        </div>
      )}
      {roleAssignedAt && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} />
          <span className="text-xs">Роль назначена: {formatDateTime(roleAssignedAt)}</span>
        </div>
      )}
    </div>
  );
}