// src/pages/manager/DashboardManager.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, GraduationCap, Calendar, Mail, Clock,
  BookOpen, ChevronRight, UserPlus, FolderKanban, Timer,
  DoorOpen, Newspaper, Megaphone, Plus, FileText, Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/api";

const StatCard = ({ title, value, icon: Icon, color, to }) => (
  <Link to={to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 block">
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

const QuickAction = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium hover:shadow-md hover:border-[#f6a623] transition group">
    <div className="w-10 h-10 rounded-lg bg-[#f6a623]/10 flex items-center justify-center group-hover:bg-[#f6a623] group-hover:text-white transition">
      <Icon size={18} className="text-[#f6a623] group-hover:text-white" />
    </div>
    <span className="text-gray-700">{label}</span>
    <ChevronRight size={16} className="ml-auto text-gray-400" />
  </Link>
);

export default function DashboardManager() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0, totalTeachers: 0, totalParents: 0,
    totalPrograms: 0, totalGroups: 0, totalRooms: 0,
    totalApplications: 0, pendingApplications: 0,
  });
  const [recentApps, setRecentApps] = useState([]);
  const [teacherLoads, setTeacherLoads] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, programs, groups, rooms, apps, loads, news] = await Promise.all([
          API.get("/api/users"),
          API.get("/api/programs"),
          API.get("/api/groups"),
          API.get("/api/rooms"),
          API.get("/api/applications"),
          API.get("/api/teacher-loads"),
          API.get("/api/news", { params: { size: 3, sort: "createdAt,desc" } }),
        ]);
        const u = users.data || [];
        const appData = apps.data || [];
        const loadData = loads.data || [];
        const newsData = news.data?.content || news.data || [];

        setStats({
          totalStudents: u.filter(x => x.roles?.includes("STUDENT")).length,
          totalTeachers: u.filter(x => x.roles?.includes("TEACHER")).length,
          totalParents: u.filter(x => x.roles?.includes("PARENT")).length,
          totalPrograms: (programs.data || []).length,
          totalGroups: (groups.data || []).length,
          totalRooms: (rooms.data?.content || rooms.data || []).length,
          totalApplications: appData.length,
          pendingApplications: appData.filter(a => a.status === "NEW" || a.status === "REVIEWED").length,
        });

        setRecentApps(appData.slice(0, 5));
        setTeacherLoads(loadData.slice(0, 5));
        setLatestNews(newsData.slice(0, 3));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColors = {
    NEW: "bg-blue-100 text-blue-700",
    REVIEWED: "bg-yellow-100 text-yellow-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    WAITLIST: "bg-purple-100 text-purple-700",
  };
  const statusLabels = {
    NEW: "Новая", REVIEWED: "На проверке", ACCEPTED: "Принята",
    REJECTED: "Отклонена", WAITLIST: "В ожидании",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Верхняя строка с заголовком и единственной кнопкой "Зачислить студента" */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Панель менеджера</h1>
            <p className="text-gray-500 mt-1">Добро пожаловать, {user?.firstName || "Менеджер"}!</p>
          </div>
          <Link
            to="/admin/student-programs"
            className="bg-[#f6a623] hover:bg-[#e09515] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <UserPlus size={18} /> Зачислить студента
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
          </div>
        ) : (
          <>
            {/* Карточки статистики */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Учеников" value={stats.totalStudents} icon={GraduationCap} color="text-blue-600" to="/admin/students" />
              <StatCard title="Преподавателей" value={stats.totalTeachers} icon={UserCheck} color="text-[#f6a623]" to="/admin/teachers" />
              <StatCard title="Родителей" value={stats.totalParents} icon={Users} color="text-purple-600" to="/admin/parents" />
              <StatCard title="Программ" value={stats.totalPrograms} icon={BookOpen} color="text-cyan-600" to="/programs" />
              <StatCard title="Групп" value={stats.totalGroups} icon={FolderKanban} color="text-teal-600" to="/admin/groups" />
              <StatCard title="Помещений" value={stats.totalRooms} icon={DoorOpen} color="text-rose-600" to="/admin/rooms" />
              <StatCard title="Заявок" value={stats.totalApplications} icon={Mail} color="text-amber-600" to="/applications" />
              <StatCard title="На рассмотрении" value={stats.pendingApplications} icon={Clock} color="text-red-500" to="/applications" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Левая колонка: Заявки + Новости */}
              <div className="lg:col-span-2 space-y-6">
                {/* Последние заявки */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Mail size={20} className="text-[#f6a623]" /> Последние заявки
                    </h2>
                    <Link to="/applications" className="text-sm text-[#f6a623] hover:underline flex items-center gap-1">
                      Все заявки <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ребёнок</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Программа</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {recentApps.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.childLastName} {app.childFirstName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{app.programName || app.programId}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[app.status]}`}>{statusLabels[app.status]}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString("ru-RU")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {recentApps.length === 0 && <div className="text-center py-8 text-gray-500">Нет заявок</div>}
                  </div>
                </div>

                {/* Последние новости */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Megaphone size={20} className="text-[#f6a623]" /> Последние новости
                    </h2>
                    <Link to="/news" className="text-sm text-[#f6a623] hover:underline flex items-center gap-1">
                      Все новости <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {latestNews.map(n => (
                      <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                        <div className="w-10 h-10 rounded-lg bg-[#f6a623]/10 flex items-center justify-center flex-shrink-0">
                          <Newspaper size={18} className="text-[#f6a623]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleDateString("ru-RU")}</p>
                        </div>
                      </div>
                    ))}
                    {latestNews.length === 0 && <p className="text-sm text-gray-400">Нет новостей</p>}
                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                {/* Загрузка преподавателей */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Timer size={20} className="text-[#f6a623]" /> Загрузка преподавателей
                  </h2>
                  <div className="space-y-3">
                    {teacherLoads.map(tl => {
                      const planned = tl.weeklyHoursPlanned || 0;
                      const max = tl.maxWeeklyHours || 0;
                      const percent = max > 0 ? Math.round((planned / max) * 100) : 0;
                      const barColor = percent > 100 ? "bg-red-500" : percent >= 80 ? "bg-green-500" : "bg-yellow-500";
                      return (
                        <div key={tl.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium truncate mr-2">{tl.teacherName}</span>
                            <span className="text-gray-500 whitespace-nowrap">{planned} / {max} ч</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(percent, 100)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {teacherLoads.length === 0 && <p className="text-sm text-gray-400">Нет данных</p>}
                  </div>
                  <Link to="/admin/teacher-loads" className="mt-4 inline-block text-sm text-[#f6a623] hover:underline">
                    Подробная нагрузка
                  </Link>
                </div>

                {/* Быстрые действия */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-5">
                  <h3 className="font-semibold mb-3">Быстрые действия</h3>
                  <div className="space-y-2">
                    <QuickAction to="/admin/student-programs" icon={UserPlus} label="Зачислить студента" />
                    <QuickAction to="/admin/groups" icon={FolderKanban} label="Учебные группы" />
                    <QuickAction to="/admin/teacher-loads" icon={Timer} label="Нагрузка преподавателей" />
                    <QuickAction to="/schedule-templates" icon={Calendar} label="Шаблоны расписания" />
                    <QuickAction to="/news" icon={Newspaper} label="Новости" />
                    <QuickAction to="/files" icon={FileText} label="Файлы" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}