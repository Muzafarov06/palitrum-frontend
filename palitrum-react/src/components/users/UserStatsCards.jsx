import React from "react";
import { UserCheck, UserCog, UserX, Archive, GraduationCap, BookOpen, Briefcase, UsersRound } from "lucide-react";

// Компонент одной карточки – с кругом для иконки
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-3 rounded-full bg-[#f6a623] bg-opacity-10">
        <Icon size={24} className="text-[#f6a623]" />
      </div>
    </div>
  </div>
);

export default function UserStatsCards({ metrics, roleFilter }) {
  // Страница с конкретной ролью – только одна карточка
  if (roleFilter === "STUDENT") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Ученики"
          value={metrics.students ?? 0}
          icon={GraduationCap}
        />
      </div>
    );
  }
  if (roleFilter === "TEACHER") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Преподаватели"
          value={metrics.teachers ?? 0}
          icon={BookOpen}
        />
      </div>
    );
  }
  if (roleFilter === "PARENT") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Родители"
          value={metrics.parents ?? 0}
          icon={UsersRound}
        />
      </div>
    );
  }

  // Полная страница "Все пользователи" – две строки
  const statusItems = [
    { key: "active", title: "Активных", icon: UserCheck },
    { key: "pending", title: "В ожидании", icon: UserCog },
    { key: "blocked", title: "Заблокированы", icon: UserX },
    { key: "archived", title: "Архив", icon: Archive },
  ];

  const roleItems = [
    { key: "students", title: "Ученики", icon: GraduationCap },
    { key: "teachers", title: "Преподаватели", icon: BookOpen },
    { key: "managers", title: "Менеджеры", icon: Briefcase },
    { key: "parents", title: "Родители", icon: UsersRound },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statusItems.map((item) => (
          <StatCard
            key={item.key}
            title={item.title}
            value={metrics[item.key] ?? 0}
            icon={item.icon}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {roleItems.map((item) => (
          <StatCard
            key={item.key}
            title={item.title}
            value={metrics[item.key] ?? 0}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );
}