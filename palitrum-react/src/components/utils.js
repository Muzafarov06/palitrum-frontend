export function getDashboardRoute(user) {
  if (!user?.roles) return "/";

  const roles = user.roles.map(r => r.toUpperCase());

  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
    return "/admin/dashboard";
  }
  if (roles.includes("MANAGER")) {
    return "/manager/dashboard";
  }
  if (roles.includes("TEACHER")) {
    return "/teacher/dashboard";
  }
  if (roles.includes("STUDENT")) {
    return "/student";
  }
  if (roles.includes("PARENT")) {
    return "/parent/dashboard";
  }
  return "/";
}