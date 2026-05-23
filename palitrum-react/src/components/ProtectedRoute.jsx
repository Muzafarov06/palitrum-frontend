import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [], permissions = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/" replace />;

  const userRoles = user.roles || [];
  const userPermissions = user.permissions || [];

  // Проверка ролей (приводим к верхнему регистру для единообразия)
  if (roles.length > 0) {
    const need = roles.map((r) => r.toUpperCase());
    const ok = need.some((r) => userRoles.includes(r));
    if (!ok) return <Navigate to="/" replace />;
  }

  // Проверка прав (приводим к нижнему регистру, так как бэкенд возвращает права в нижнем)
  if (permissions.length > 0) {
    const need = permissions.map((p) => p.toLowerCase());
    const ok = need.some((p) => userPermissions.includes(p));
    if (!ok) return <Navigate to="/" replace />;
  }

  return children;
}