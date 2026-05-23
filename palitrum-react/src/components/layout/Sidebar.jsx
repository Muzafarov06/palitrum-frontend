import React, { useMemo, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, Users, UserCheck, UserCog, GraduationCap, FolderKanban, Calendar,
  ClipboardList, Mail, LogOut, ChevronRight, ChevronLeft, Menu, X, FileText,
  BookOpen, Building, Bookmark, UsersRound, ChartNoAxesCombined, Database,
  FileSpreadsheet, CalendarDays, Timer, Scale, Repeat, Bell, CreditCard,
  MessageSquare, Award, User, LayoutDashboard, UserPlus, Shield,
  Briefcase, ListChecks, GraduationCap as GraduationIcon, Newspaper, DollarSign, Settings,
  DoorOpen, CalendarClock, Activity, FileOutput
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileToggle }) {
  const { user, logout } = useAuth();

  const normalizedPermissions = useMemo(
    () => user?.permissions?.map((p) => p.toLowerCase()) ?? [],
    [user]
  );

  const userRoles = useMemo(() => user?.roles ?? [], [user]);

  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isTeacher = userRoles.includes("TEACHER");
  const isManager = userRoles.some(r => ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(r));
  const isFullAdmin = userRoles.includes("SUPER_ADMIN");

  const homePath = useMemo(() => {
    if (!user) return "/";
    if (isStudent) return "/student";
    if (isParent) return "/parent/dashboard";
    if (isTeacher) return "/teacher/dashboard";
    if (isManager) return isFullAdmin ? "/admin/dashboard" : "/manager/dashboard";
    return "/";
  }, [user, isStudent, isParent, isTeacher, isManager, isFullAdmin]);

  const hasPermission = useCallback((permission) => {
    if (!permission) return true;
    return normalizedPermissions.includes(permission.toLowerCase());
  }, [normalizedPermissions]);

  const menuItems = useMemo(() => {
    const items = [];
    // Навигация
    const navItems = [];
    if (hasPermission("dashboard.view")) navItems.push({ label: "Главная", href: homePath, icon: <Home size={18} />, permission: "dashboard.view" });
    if (hasPermission("import.data")) navItems.push({ label: "Импорт данных", href: "/admin/import", icon: <Database size={18} />, permission: "import.data" });
    //if (hasPermission("export.data")) navItems.push({ label: "Экспорт данных", href: "/admin/export", icon: <FileOutput size={18} />, permission: "export.data" });
    if (navItems.length) items.push({ section: "Навигация", items: navItems });

    // Образовательные структуры
    const eduStructure = [];
    if (hasPermission("department.view")) eduStructure.push({ label: "Отделения", href: "/departments", icon: <Building size={18} />, permission: "department.view" });
    if (hasPermission("program.view")) eduStructure.push({ label: "Программы", href: "/admin/programs", icon: <Bookmark size={18} />, permission: "program.view" });
    if (hasPermission("subject.view")) eduStructure.push({ label: "Предметы", href: isManager ? "/admin/subjects-crud" : "/subjects", icon: <BookOpen size={18} />, permission: "subject.view" });
    if (hasPermission("academic_period.view")) eduStructure.push({ label: "Учебные периоды", href: "/academic-periods", icon: <CalendarDays size={18} />, permission: "academic_period.view" });
    if (hasPermission("room.view")) eduStructure.push({ label: "Помещения", href: "/admin/rooms", icon: <DoorOpen size={18} />, permission: "room.view" });
    if (hasPermission("position.view")) eduStructure.push({ label: "Должности", href: "/positions", icon: <Briefcase size={18} />, permission: "position.view" });
    if (hasPermission("staff.view")) eduStructure.push({ label: "Штатное расписание", href: "/staff", icon: <Users size={18} />, permission: "staff.view" });
    if (hasPermission("news.view")) eduStructure.push({ label: "Новости", href: "/news", icon: <Newspaper size={18} />, permission: "news.view" });
    if (eduStructure.length) items.push({ section: "Образовательные структуры", items: eduStructure });

    // Студент / Родитель
    if (isStudent || isParent) {
      const studentParentItems = [];
      studentParentItems.push(
        { label: "Мои занятия", href: "/student/schedule", icon: <CalendarDays size={18} />, permission: "lesson.view" },
        { label: "Оценки и успеваемость", href: "/student/progress", icon: <ChartNoAxesCombined size={18} />, permission: "grade.view" },
        //{ label: "Домашние задания", href: "/student/homework", icon: <ClipboardList size={18} />, permission: "homework.view" },
        //{ label: "Материалы", href: "/student/resources", icon: <BookOpen size={18} />, permission: null }
      );
      if (isParent) studentParentItems.push({ label: "Мои дети", href: "/parent/children", icon: <UsersRound size={18} />, permission: "user.view_details" });
      //if (hasPermission("payment.view")) studentParentItems.push({ label: "Оплата", href: "/student/payments", icon: <CreditCard size={18} />, permission: "payment.view" });
      studentParentItems.push(
        //{ label: "Уведомления", href: "/student/notifications", icon: <Bell size={18} />, permission: "notification.view" },
        //{ label: "Мои достижения", href: "/student/achievements", icon: <Award size={18} />, permission: null },
        //{ label: "Личный кабинет", href: "/student/profile", icon: <User size={18} />, permission: null }
      );
      //if (isParent || isStudent) studentParentItems.push({ label: "Задать вопрос", href: "/student/support", icon: <MessageSquare size={18} />, permission: null });
      items.push({ section: "Учебный процесс", items: studentParentItems });
    }

    // Преподаватель
    if (isTeacher) {
      const teacherItems = [];
      if (hasPermission("lesson.view")) teacherItems.push({ label: "Мои занятия", href: "/journal", icon: <Calendar size={18} />, permission: "lesson.view" });
      //if (hasPermission("attendance.mark")) teacherItems.push({ label: "Посещаемость", href: "/teacher/attendance", icon: <CalendarDays size={18} />, permission: "attendance.mark" });
      //if (hasPermission("grade.set")) teacherItems.push({ label: "Оценки", href: "/teacher/grades", icon: <ChartNoAxesCombined size={18} />, permission: "grade.set" });
      //if (hasPermission("homework.create")) teacherItems.push({ label: "Домашние задания", href: "/teacher/homework", icon: <FileText size={18} />, permission: "homework.create" });
      //if (hasPermission("group.view")) teacherItems.push({ label: "Мои группы", href: "/teacher/groups", icon: <Users size={18} />, permission: "group.view" });
      if (hasPermission("teacher_load.view")) teacherItems.push({ label: "Моя нагрузка", href: "/admin/teacher-loads", icon: <Timer size={18} />, permission: "teacher_load.view" });
      //if (hasPermission("notification.send")) teacherItems.push({ label: "Уведомления", href: "/teacher/notifications", icon: <Bell size={18} />, permission: "notification.send" });
      //teacherItems.push({ label: "Личный кабинет", href: "/teacher/profile", icon: <User size={18} />, permission: null });
      if (teacherItems.length) items.push({ section: "Преподаватель", items: teacherItems });
    }

    // Административные разделы
    if (isManager) {
  const userMgmt = [];
  if (hasPermission("user.view")) {
    if (isFullAdmin) userMgmt.push({ label: "Все пользователи", href: "/admin/users", icon: <Users size={18} />, permission: "user.view" });
    else {
      userMgmt.push(
        { label: "Ученики", href: "/admin/students", icon: <GraduationCap size={18} />, permission: "user.view" },
        { label: "Родители", href: "/admin/parents", icon: <UsersRound size={18} />, permission: "user.view" },
        { label: "Преподаватели", href: "/admin/teachers", icon: <UserCheck size={18} />, permission: "user.view" }
      );
    }
  }
  
  // ДОБАВИТЬ ЗДЕСЬ - пункт "Роли и права" только для SUPER_ADMIN
  if (isFullAdmin && hasPermission("role.view")) {
    userMgmt.push({ label: "Роли и права", href: "/roles-permissions", icon: <Shield size={18} />, permission: "role.view" });
  }
  
  if (hasPermission("group.view")) userMgmt.push({ label: "Учебные группы", href: "/admin/groups", icon: <FolderKanban size={18} />, permission: "group.view" });
  //if (hasPermission("program_teacher.assign")) userMgmt.push({ label: "Преподаватели в программах", href: "/program-teachers", icon: <UserCog size={18} />, permission: "program_teacher.assign" });
  if (hasPermission("teacher_load.view")) {
    userMgmt.push({ label: "Нагрузка преподавателей", href: "/admin/teacher-loads", icon: <Timer size={18} />, permission: "teacher_load.view" });
    //userMgmt.push({ label: "Доступность преподавателей", href: "/admin/teacher-availability", icon: <CalendarClock size={18} />, permission: "teacher_load.view" });
  }
  if (userMgmt.length) items.push({ section: "Управление пользователями", items: userMgmt });

      const schedule = [];
      if (hasPermission("lesson.view_all")) {
        schedule.push({ label: "Расписание занятий", href: "/schedule", icon: <Calendar size={18} />, permission: "lesson.view_all" });
        //schedule.push({ label: "Участники занятий", href: "/lesson-participants", icon: <UsersRound size={18} />, permission: "lesson.view_all" });
      }
      if (hasPermission("schedule_template.view")) schedule.push({ label: "Шаблоны расписания", href: "/schedule-templates", icon: <Repeat size={18} />, permission: "schedule_template.view" });
      //if (hasPermission("attendance.view_all")) schedule.push({ label: "Посещаемость", href: "/admin/attendance", icon: <ClipboardList size={18} />, permission: "attendance.view_all" });
      //if (hasPermission("grade.view_all")) schedule.push({ label: "Оценки", href: "/admin/grades", icon: <ChartNoAxesCombined size={18} />, permission: "grade.view_all" });
      if (schedule.length) items.push({ section: "Расписание и успеваемость", items: schedule });

      const enrollment = [];
      if (hasPermission("application.view")) enrollment.push({ label: "Заявки", href: "/applications", icon: <Mail size={18} />, permission: "application.view" });
      if (hasPermission("student_program.view")) enrollment.push({ label: "Зачисление на программы", href: "/student-programs", icon: <GraduationIcon size={18} />, permission: "student_program.view" });
      //if (hasPermission("student_subject.view")) enrollment.push({ label: "Индивидуальные учебные планы", href: "/student-subjects", icon: <ListChecks size={18} />, permission: "student_subject.view" });
      if (enrollment.length) items.push({ section: "Заявки и зачисления", items: enrollment });

      const learning = [];
      //if (hasPermission("homework.view")) learning.push({ label: "Домашние задания", href: "/admin/homework", icon: <FileText size={18} />, permission: "homework.view" });
      //if (hasPermission("file.view")) learning.push({ label: "Материалы", href: "/admin/resources", icon: <BookOpen size={18} />, permission: "file.view" });
      if (learning.length) items.push({ section: "Учебные материалы", items: learning });

      if (hasPermission("file.upload")) items.push({ section: "Файлы", items: [{ label: "Файлы", href: "/files", icon: <FileSpreadsheet size={18} />, permission: "file.upload" }] });


      const reports = [];
      if (hasPermission("report.generate")) {
        reports.push(
          { label: "Учебные планы", href: "/reports/curriculum", icon: <BookOpen size={18} />, permission: "report.generate" },
          { label: "Штатное расписание", href: "/reports/staffing", icon: <Briefcase size={18} />, permission: "report.generate" },
          { label: "Списочный состав групп", href: "/reports/group-members", icon: <FolderKanban size={18} />, permission: "report.generate" },
          { label: "Табель посещаемости", href: "/reports/attendance", icon: <ClipboardList size={18} />, permission: "report.generate" },
          { label: "Ведомость успеваемости", href: "/reports/grades", icon: <ChartNoAxesCombined size={18} />, permission: "report.generate" },
          { label: "Приказы о зачислении", href: "/reports/enrollment-orders", icon: <FileText size={18} />, permission: "report.generate" },
          { label: "Сводные отчёты", href: "/reports/summary", icon: <Scale size={18} />, permission: "report.generate" }
        );
      }
      if (reports.length) items.push({ section: "Документооборот", items: reports });

      //if (isFullAdmin && hasPermission("audit.view")) items.push({ section: "Аудит", items: [{ label: "Журнал действий", href: "/admin/audit-logs", icon: <Activity size={18} />, permission: "audit.view" }] });
      if (isFullAdmin && hasPermission("system.settings.view")) items.push({ section: "Системные настройки", items: [{ label: "Настройки", href: "/settings", icon: <Settings size={18} />, permission: "system.settings.view" }] });
    }

    return items;
  }, [isStudent, isParent, isTeacher, isManager, isFullAdmin, homePath, hasPermission]);

  return (
    <>
      {/* Мобильное меню */}
      <button
        onClick={onMobileToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md border"
        aria-label="Открыть меню"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={onMobileToggle} />}

      <aside
        className={`bg-white border-r flex flex-col h-screen sticky top-0 transition-all duration-300 z-50
          ${collapsed ? "w-16" : "w-64"}
          max-md:fixed max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:w-64
          ${mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
        `}
      >
        {/* Навигация */}
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((section) => {
            const visibleItems = section.items.filter((i) => hasPermission(i.permission));
            if (!visibleItems.length) return null;
            return (
              <div key={section.section}>
                {!collapsed && (
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">{section.section}</div>
                )}
                {visibleItems.map((item) => (
                  <SidebarLink key={item.href} to={item.href} icon={item.icon} collapsed={collapsed}>
                    {item.label}
                  </SidebarLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Футер с аватаром и выходом */}
        <div className="p-3 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold shrink-0 ${collapsed ? "w-8 h-8" : "w-10 h-10"}`}>
              {user?.firstName?.[0] ?? "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-600 truncate">{user?.email}</div>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#f6a623] hover:bg-[#e09515] text-white hover:shadow-md rounded-lg transition"
            title="Выйти"
          >
            {!collapsed && <span>Выйти</span>}
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Кнопка сворачивания на границе сайдбара и контента */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute top-6 z-50 w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full items-center justify-center shadow-lg hover:shadow-xl hover:bg-white hover:border-gray-300 transition-all duration-200"
        style={{
          left: collapsed ? "64px" : "256px",
          transform: "translate(-50%, -50%)",
          transition: "left 0.3s",
        }}
        title={collapsed ? "Развернуть меню" : "Свернуть меню"}
      >
        {collapsed ? <ChevronRight size={16} className="text-gray-600" /> : <ChevronLeft size={16} className="text-gray-600" />}
      </button>
    </>
  );
}

function SidebarLink({ to, icon, children, collapsed }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 rounded-md text-gray-800 hover:bg-gray-100 transition ${
          isActive ? "bg-gray-100 font-semibold" : ""
        } ${collapsed ? "justify-center" : ""}`
      }
      title={collapsed ? children : undefined}
    >
      <span className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        {icon}
        {!collapsed && children}
      </span>
      {!collapsed && <ChevronRight size={16} className="text-gray-400" />}
    </NavLink>
  );
}