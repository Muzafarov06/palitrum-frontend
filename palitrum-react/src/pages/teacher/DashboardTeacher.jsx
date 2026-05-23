import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  BookOpen,
  Bell,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  Award,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Компонент карточки статистики
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +{trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  </div>
);

// Компонент расписания на сегодня
const TodaySchedule = ({ lessons, loading }) => {
  if (loading) return <div className="text-center py-8">Загрузка расписания...</div>;
  if (lessons.length === 0) return <div className="text-center py-8 text-gray-500">Сегодня занятий нет</div>;

  return (
    <div className="space-y-3">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f6a623] bg-opacity-10 flex items-center justify-center">
              <Clock size={18} className="text-[#f6a623]" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{lesson.subjectName}</p>
              <p className="text-xs text-gray-500">{lesson.groupName || "Индивидуально"} • {lesson.room}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{lesson.startTime} – {lesson.endTime}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Компонент моих групп
const MyGroups = ({ groups, loading }) => {
  if (loading) return <div className="text-center py-4">Загрузка групп...</div>;
  if (groups.length === 0) return <div className="text-center py-4 text-gray-500">Нет назначенных групп</div>;

  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{group.name}</p>
            <p className="text-xs text-gray-500">{group.programName} • {group.studentsCount} учеников</p>
          </div>
          <Link to={`/teacher/groups/${group.id}`} className="text-[#f6a623] hover:underline text-sm">
            Журнал
          </Link>
        </div>
      ))}
    </div>
  );
};

// Компонент уведомлений для учителя
const TeacherNotifications = () => {
  const notifications = [
    { id: 1, text: "Завтра в 10:00 педсовет", type: "info", date: "завтра" },
    { id: 2, text: "Необходимо выставить оценки за четверть", type: "warning", date: "до 25.12" },
    { id: 3, text: "Замена урока: вместо 5-го урока будет консультация", type: "action", date: "сегодня" },
  ];

  return (
    <div className="space-y-3">
      {notifications.map((note) => (
        <div key={note.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[#f6a623] mt-2"></div>
          <div>
            <p className="text-sm text-gray-700">{note.text}</p>
            <p className="text-xs text-gray-400 mt-1">{note.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DashboardTeacher() {
  const { user } = useAuth();
  const [todayLessons, setTodayLessons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalGroups: 0,
    totalHoursThisWeek: 0,
    averageAttendance: 0,
  });
  const [loading, setLoading] = useState({
    lessons: true,
    groups: true,
    stats: true,
  });

  useEffect(() => {
    // Загрузка расписания на сегодня (мок)
    const loadTodayLessons = async () => {
      setLoading(prev => ({ ...prev, lessons: true }));
      try {
        // Временно мок – замените на реальный API, когда будет готов
        const mockLessons = [
          { id: 1, subjectName: "Сольфеджио", groupName: "3 класс", room: "Каб. 5", startTime: "10:00", endTime: "11:30" },
          { id: 2, subjectName: "Фортепиано", groupName: "Иванов С.", room: "Каб. 12", startTime: "13:00", endTime: "14:00" },
        ];
        setTodayLessons(mockLessons);
      } catch (err) {
        console.error("Ошибка загрузки расписания", err);
      } finally {
        setLoading(prev => ({ ...prev, lessons: false }));
      }
    };

    // Загрузка групп учителя (мок)
    const loadMyGroups = async () => {
      setLoading(prev => ({ ...prev, groups: true }));
      try {
        // Временно мок
        const mockGroups = [
          { id: 1, name: "Фортепиано 3 класс", programName: "Фортепиано", studentsCount: 8 },
          { id: 2, name: "Сольфеджио 2 класс", programName: "Теория музыки", studentsCount: 12 },
        ];
        setGroups(mockGroups);
      } catch (err) {
        console.error("Ошибка загрузки групп", err);
      } finally {
        setLoading(prev => ({ ...prev, groups: false }));
      }
    };

    // Загрузка статистики (мок)
    const loadStats = async () => {
      setLoading(prev => ({ ...prev, stats: true }));
      try {
        setStats({
          totalStudents: 25,
          totalGroups: 4,
          totalHoursThisWeek: 18,
          averageAttendance: 92,
        });
      } catch (err) {
        console.error("Ошибка загрузки статистики", err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };

    loadTodayLessons();
    loadMyGroups();
    loadStats();
  }, [user]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Панель преподавателя</h1>
          <p className="text-gray-500 mt-1">Добро пожаловать, {user?.firstName || "Преподаватель"}! Ваша рабочая область.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Учеников" value={stats.totalStudents} icon={Users} color="text-blue-600" />
          <StatCard title="Групп" value={stats.totalGroups} icon={Users} color="text-green-600" />
          <StatCard title="Часов в неделю" value={stats.totalHoursThisWeek} icon={Clock} color="text-purple-600" />
          <StatCard title="Посещаемость" value={`${stats.averageAttendance}%`} icon={UserCheck} color="text-amber-600" trend="2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={20} className="text-[#f6a623]" /> Расписание на сегодня
                </h2>
                <Link to="/teacher/schedule" className="text-sm text-[#f6a623] hover:underline flex items-center gap-1">
                  Всё расписание <ChevronRight size={16} />
                </Link>
              </div>
              <div className="p-4">
                <TodaySchedule lessons={todayLessons} loading={loading.lessons} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={20} className="text-[#f6a623]" /> Мои группы
                </h2>
                <Link to="/teacher/groups" className="text-sm text-[#f6a623] hover:underline flex items-center gap-1">
                  Все группы <ChevronRight size={16} />
                </Link>
              </div>
              <div className="p-4">
                <MyGroups groups={groups} loading={loading.groups} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Bell size={20} className="text-[#f6a623]" /> Уведомления
              </h2>
              <TeacherNotifications />
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-100 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ClipboardList size={16} /> Быстрые действия
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/teacher/attendance" className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow transition">
                  <CheckCircle size={16} /> Отметить посещаемость
                </Link>
                <Link to="/teacher/grades" className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow transition">
                  <Award size={16} /> Выставить оценки
                </Link>
                <Link to="/teacher/homework" className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow transition">
                  <BookOpen size={16} /> Домашнее задание
                </Link>
                <Link to="/teacher/messages" className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium hover:shadow transition">
                  <MessageSquare size={16} /> Сообщения
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}