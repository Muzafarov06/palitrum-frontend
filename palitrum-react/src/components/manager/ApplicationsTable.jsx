import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function ApplicationsTable({
  applications,
  loading,
  error,
  onRowClick,
  statusMap,
  formatCreatedAt,
  sortField,
  sortOrder,
  onSort,
}) {
  if (loading) return <p className="text-center py-10">Загрузка...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "NEW": return "#10b981";
      case "REVIEWED": return "#f59e0b";
      case "ACCEPTED": return "#2563eb";
      case "REJECTED": return "#ef4444";
      case "WAITLIST": return "#475569";
      default: return "#e5e7eb";
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" 
      ? <ChevronUp size={14} className="inline ml-1" />
      : <ChevronDown size={14} className="inline ml-1" />;
  };

  // Функция для отображения названия итоговой программы
  const getFinalProgramName = (app) => {
    if (app.finalProgramName) return app.finalProgramName;
    if (app.finalProgramId) return `Программа ID: ${app.finalProgramId}`;
    if (app.preferredProgramName) return `(предпочтение) ${app.preferredProgramName}`;
    return "—";
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="min-w-[800px] w-full divide-y divide-gray-200 border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500">
          <tr>
            <th
              className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:text-gray-700"
              onClick={() => onSort("childLastName")}
            >
              Данные ребёнка <SortIcon field="childLastName" />
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:text-gray-700"
              onClick={() => onSort("parentLastName")}
            >
              Данные родителя <SortIcon field="parentLastName" />
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:text-gray-700"
              onClick={() => onSort("finalProgramName")}
            >
              Итоговая программа <SortIcon field="finalProgramName" />
            </th>
            <th
              className="px-6 py-3 text-left text-sm font-semibold cursor-pointer hover:text-gray-700"
              onClick={() => onSort("createdAt")}
            >
              Статус / Дата <SortIcon field="createdAt" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app) => (
            <tr
              key={app.id}
              onClick={() => onRowClick(app)}
              className="hover:bg-gray-50 cursor-pointer transition"
            >
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{`${app.childLastName || ""} ${app.childFirstName || ""}`.trim()}</div>
                <div className="text-sm text-gray-500">
                  {app.childMiddleName ? `${app.childMiddleName} ` : ""}
                  {app.childBirthDate ? `(${new Date(app.childBirthDate).toLocaleDateString("ru-RU")})` : ""}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">{`${app.parentLastName || ""} ${app.parentFirstName || ""}`.trim()}</div>
                <div className="text-sm text-gray-500">{app.parentPhone}</div>
                <div className="text-sm text-gray-500">{app.parentEmail}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">{getFinalProgramName(app)}</div>
                {/* Если нужно показать дату начала? В оригинале был preferredStartDate, но для итоговой программы может быть своя дата или убираем */}
              </td>
              <td
                className="px-6 py-4 border-r-4"
                style={{ borderRightColor: getStatusBorderColor(app.status) }}
              >
                <div className="text-gray-900 font-medium">{statusMap[app.status] || app.status}</div>
                <div className="text-sm text-gray-500 mt-1">{formatCreatedAt(app.createdAt)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}