// src/pages/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, GraduationCap, Calendar, BookOpen,
  Shield, Timer, FolderKanban, DoorOpen, FileSpreadsheet,
  Newspaper, UserPlus, TrendingUp, Activity, Clock,
  UsersRound, ChevronRight, Briefcase, BadgeCheck,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/api";

// Обычная карточка для десктопа
const StatCard = ({ title, value, icon: Icon, color, to }) => (
  <Link to={to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 block">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  </Link>
);

// Новый компонент для мобильной статистики: иконка, значение и название
const MobileStatItem = ({ value, label, icon: Icon, color, to }) => (
  <Link to={to} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow-md hover:border-[#f6a623] transition group w-full">
    <div className="w-8 h-8 rounded-lg bg-[#f6a623]/10 flex items-center justify-center group-hover:bg-[#f6a623] group-hover:text-white transition flex-shrink-0">
      <Icon size={16} className="text-[#f6a623] group-hover:text-white" />
    </div>
    <span className="font-bold text-gray-800">{value}</span>
    <span className="text-gray-500 truncate">{label}</span>
  </Link>
);

// Компактный индикатор активности для мобильных
const MobileActivityIndicator = ({ icon: Icon, title, value }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex items-center gap-3">
    <div className="p-2 bg-[#f6a623]/10 rounded-full">
      <Icon size={20} className="text-[#f6a623]" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-bold text-gray-800 text-sm">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow-md hover:border-[#f6a623] transition group w-full">
    <div className="w-8 h-8 rounded-lg bg-[#f6a623]/10 flex items-center justify-center group-hover:bg-[#f6a623] group-hover:text-white transition flex-shrink-0">
      <Icon size={16} className="text-[#f6a623] group-hover:text-white" />
    </div>
    <span className="text-gray-700 truncate">{label}</span>
    <ChevronRight size={16} className="ml-auto text-gray-400 hidden sm:block" />
  </Link>
);

const mobileStatsList = [
  { key: "totalUsers", title: "Пользователей", icon: Users, to: "/admin/users" },
  { key: "totalStudents", title: "Учеников", icon: GraduationCap, to: "/admin/students" },
  { key: "totalTeachers", title: "Преподавателей", icon: UserCheck, to: "/admin/teachers" },
  { key: "totalPrograms", title: "Программ", icon: BookOpen, to: "/programs" },
  { key: "totalGroups", title: "Групп", icon: FolderKanban, to: "/admin/groups" },
  { key: "totalRooms", title: "Помещений", icon: DoorOpen, to: "/admin/rooms" },
  { key: "totalStaff", title: "Сотрудников", icon: Briefcase, to: "/staff" },
  { key: "totalPositions", title: "Должностей", icon: BadgeCheck, to: "/positions" },
  { key: "totalPeriods", title: "Периодов", icon: Calendar, to: "/academic-periods" },
  { key: "totalParents", title: "Родителей", icon: UsersRound, to: "/admin/parents" },
];

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0, totalStudents: 0, totalTeachers: 0, totalParents: 0,
    totalPrograms: 0, totalGroups: 0, totalRooms: 0, totalStaff: 0,
    totalPositions: 0, totalPeriods: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAllStats, setShowAllStats] = useState(false);
  const [showMobileActivity, setShowMobileActivity] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, programs, groups, rooms, positions, staff, periods] = await Promise.all([
          API.get("/api/users"),
          API.get("/api/programs"),
          API.get("/api/groups"),
          API.get("/api/rooms"),
          API.get("/api/positions"),
          API.get("/api/staff"),
          API.get("/api/academic-periods", { params: { size: 1 } }),
        ]);
        const u = users.data || [];
        setStats({
          totalUsers: u.length,
          totalStudents: u.filter(x => x.roles?.includes("STUDENT")).length,
          totalTeachers: u.filter(x => x.roles?.includes("TEACHER")).length,
          totalParents: u.filter(x => x.roles?.includes("PARENT")).length,
          totalPrograms: (programs.data || []).length,
          totalGroups: (groups.data || []).length,
          totalRooms: (rooms.data?.content || rooms.data || []).length,
          totalPositions: (positions.data || []).length,
          totalStaff: (staff.data || []).length,
          totalPeriods: (periods.data?.content || periods.data || []).length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const visibleMobileStats = showAllStats ? mobileStatsList : mobileStatsList.slice(0, 6);

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8 pl-10 md:pl-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Панель администратора</h1>
          <p className="text-gray-500 mt-1 text-sm">Добро пожаловать, {user?.firstName || "Администратор"}!</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
          </div>
        ) : (
          <>
            {/* Блок статистики */}
            <div className="mb-4 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">Статистика</h2>
                {mobileStatsList.length > 6 && (
                  <button
                    onClick={() => setShowAllStats(!showAllStats)}
                    className="sm:hidden flex items-center gap-1 text-sm text-[#f6a623] font-medium"
                  >
                    {showAllStats ? (
                      <>
                        <ChevronUp size={18} /> Скрыть
                      </>
                    ) : (
                      <>
                        <ChevronDown size={18} /> Показать всё
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Мобильный список статистики */}
              <div className="flex sm:hidden flex-col space-y-2">
                {visibleMobileStats.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <MobileStatItem
                      key={item.key}
                      value={stats[item.key]}
                      label={item.title}
                      icon={IconComponent}
                      color="text-[#f6a623]"
                      to={item.to}
                    />
                  );
                })}
              </div>

              {/* Десктопная сетка */}
              <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                <StatCard title="Пользователей" value={stats.totalUsers} icon={Users} color="text-[#f6a623]" to="/admin/users" />
                <StatCard title="Учеников" value={stats.totalStudents} icon={GraduationCap} color="text-[#f6a623]" to="/admin/students" />
                <StatCard title="Преподавателей" value={stats.totalTeachers} icon={UserCheck} color="text-[#f6a623]" to="/admin/teachers" />
                <StatCard title="Родителей" value={stats.totalParents} icon={UsersRound} color="text-[#f6a623]" to="/admin/parents" />
                <StatCard title="Программ" value={stats.totalPrograms} icon={BookOpen} color="text-[#f6a623]" to="/programs" />
              </div>
              <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Групп" value={stats.totalGroups} icon={FolderKanban} color="text-[#f6a623]" to="/admin/groups" />
                <StatCard title="Помещений" value={stats.totalRooms} icon={DoorOpen} color="text-[#f6a623]" to="/admin/rooms" />
                <StatCard title="Должностей" value={stats.totalPositions} icon={BadgeCheck} color="text-[#f6a623]" to="/positions" />
                <StatCard title="Сотрудников" value={stats.totalStaff} icon={Briefcase} color="text-[#f6a623]" to="/staff" />
                <StatCard title="Периодов" value={stats.totalPeriods} icon={Calendar} color="text-[#f6a623]" to="/academic-periods" />
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="mb-4 sm:mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-2 sm:mb-4">Быстрые действия</h2>
              <div className="flex flex-col space-y-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
                <QuickAction to="/admin/users" icon={UserPlus} label="Добавить пользователя" />
                <QuickAction to="/positions" icon={BadgeCheck} label="Управление должностями" />
                <QuickAction to="/staff" icon={UserCheck} label="Штатное расписание" />
                <QuickAction to="/admin/teacher-loads" icon={Timer} label="Нагрузка преподавателей" />
                <QuickAction to="/admin/groups" icon={FolderKanban} label="Учебные группы" />
                <QuickAction to="/schedule-templates" icon={Clock} label="Шаблоны расписания" />
                <QuickAction to="/schedule" icon={Calendar} label="Расписание" />
                <QuickAction to="/news" icon={Newspaper} label="Новости" />
                <QuickAction to="/files" icon={FileSpreadsheet} label="Файлы" />
              </div>
            </div>

            {/* Индикаторы активности — теперь и на мобильных */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:hidden">
                <h2 className="text-lg font-bold text-gray-800">Активность</h2>
                <button
                  onClick={() => setShowMobileActivity(!showMobileActivity)}
                  className="flex items-center gap-1 text-sm text-[#f6a623] font-medium"
                >
                  {showMobileActivity ? (
                    <>
                      <ChevronUp size={18} /> Скрыть
                    </>
                  ) : (
                    <>
                      <ChevronDown size={18} /> Показать активность
                    </>
                  )}
                </button>
              </div>
              {showMobileActivity && (
                <div className="sm:hidden flex flex-col space-y-2 mb-4">
                  <MobileActivityIndicator icon={Activity} title="База данных" value="Активна" />
                  <MobileActivityIndicator icon={TrendingUp} title="Версия системы" value="1.0.0" />
                  <MobileActivityIndicator icon={Shield} title="Ролей и прав" value={stats.totalUsers > 0 ? "Настроены" : "—"} />
                </div>
              )}
              <div className="hidden sm:grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                  <div className="p-2 bg-[#f6a623]/10 rounded-full"><Activity size={22} className="text-[#f6a623]" /></div>
                  <div>
                    <p className="text-sm text-gray-500">База данных</p>
                    <p className="font-bold text-gray-800">Активна</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                  <div className="p-2 bg-[#f6a623]/10 rounded-full"><TrendingUp size={22} className="text-[#f6a623]" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Версия системы</p>
                    <p className="font-bold text-gray-800">1.0.0</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                  <div className="p-2 bg-[#f6a623]/10 rounded-full"><Shield size={22} className="text-[#f6a623]" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Ролей и прав</p>
                    <p className="font-bold text-gray-800">{stats.totalUsers > 0 ? "Настроены" : "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}