import React from "react";
import { useAuth } from "../context/AuthContext";
import ManagerDashboard from "./manager/DashboardManager";
import SuperAdminDashboard from "./admin/DashboardAdmin";

/**
 * Главная страница админки. Показывает разный контент
 * в зависимости от роли пользователя.
 */
export default function AdminHome({ applications, loading, error }) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return <div>Загрузка пользователя...</div>;
  if (!user) return <div>Нет данных пользователя</div>;

  const roles = user.roles || [];

  if (roles.includes("SUPER_ADMIN")) {
    return (
      <SuperAdminDashboard
        applications={applications}
        loading={loading}
        error={error}
      />
    );
  }

  // Для всех остальных ролей админки (MANAGER, ADMIN, DIRECTOR...)
  return (
    <ManagerDashboard
      applications={applications}
      loading={loading}
      error={error}
    />
  );
}
