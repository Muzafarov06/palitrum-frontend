// src/pages/parent/DashboardParent.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Bell, ChevronRight, BookOpen, Star,
  Clock, MapPin, Gift, Users, Phone, CreditCard,
  MessageSquare,
} from "lucide-react";
import {
  fetchChildrenByParent, fetchStudentGrades,
  fetchStudentLessons, fetchStudentPrograms,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

// -------------------------------------------------------
// Компонент выбора ребёнка (инициалы + имя)
// -------------------------------------------------------
const ChildSelector = ({ children, selectedChild, onSelect }) => {
  if (children.length <= 1) return null;
  return (
    <div className="flex gap-2 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelect(child)}
          className={`relative px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
            selectedChild?.id === child.id
              ? "bg-[#f6a623] text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              selectedChild?.id === child.id
                ? "bg-white text-[#f6a623]"
                : "bg-[#f6a623]/10 text-[#f6a623]"
            }`}
          >
            {child.firstName?.[0]}{child.lastName?.[0]}
          </div>
          <span>{child.firstName}</span>
        </button>
      ))}
    </div>
  );
};

// -------------------------------------------------------
// Ближайшее занятие
// -------------------------------------------------------
const NextLesson = ({ schedule, loading }) => {
  const now = new Date();
  const upcoming = schedule
    .filter((l) => {
      const lessonDate = new Date(l.date);
      const [h, m] = l.startTime.split(":").map(Number);
      lessonDate.setHours(h, m, 0, 0);
      return lessonDate > now;
    })
    .sort(
      (a, b) =>
        new Date(a.date + "T" + a.startTime) - new Date(b.date + "T" + b.startTime)
    );
  if (loading) return <div className="animate-pulse h-16 bg-gray-200 rounded-xl" />;
  if (upcoming.length === 0)
    return <p className="text-sm text-gray-400">Нет предстоящих занятий</p>;
  const next = upcoming[0];
  const date = new Date(next.date);
  return (
    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-[#f6a623]/10 to-white rounded-xl border border-[#f6a623]/20">
      <div className="w-12 h-12 rounded-xl bg-[#f6a623] text-white flex flex-col items-center justify-center shrink-0">
        <span className="text-xs font-bold">{date.toLocaleDateString("ru-RU", { month: "short" })}</span>
        <span className="text-lg font-bold leading-none">{date.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate">{next.title}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <Clock size={12} /> {next.startTime?.substring(0, 5)}–{next.endTime?.substring(0, 5)}
          {next.roomName && (<><MapPin size={12} /> {next.roomName}</>)}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------
// Шкала посещаемости (оттенки оранжевого)
// -------------------------------------------------------
const AttendanceBar = ({ grades }) => {
  const total = grades.reduce((sum, g) => sum + (g.absences || 0) + 1, 0);
  if (total === 0) return null;
  const present = grades.filter((g) => (g.absences || 0) === 0).length;
  const percent = Math.round((present / Math.max(total, 1)) * 100);
  const barColor = percent >= 80 ? "bg-[#f6a623]" : percent >= 60 ? "bg-[#f8b84e]" : "bg-[#fcd9a1]";
  const textColor = percent >= 80 ? "text-[#c17d00]" : percent >= 60 ? "text-[#d18e00]" : "text-[#eaa200]";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-sm font-bold ${textColor}`}>{percent}%</span>
    </div>
  );
};

// -------------------------------------------------------
// Дни рождения
// -------------------------------------------------------
const BirthdaysCard = ({ children }) => {
  const today = new Date();
  const upcoming = children
    .filter((c) => {
      if (!c.birthDate) return false;
      const bd = new Date(c.birthDate);
      const bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      if (bdThisYear < today) bdThisYear.setFullYear(today.getFullYear() + 1);
      return Math.ceil((bdThisYear - today) / 86400000) <= 30;
    })
    .sort((a, b) => {
      const bdA = new Date(a.birthDate);
      const bdB = new Date(b.birthDate);
      const bdAThisYear = new Date(today.getFullYear(), bdA.getMonth(), bdA.getDate());
      const bdBThisYear = new Date(today.getFullYear(), bdB.getMonth(), bdB.getDate());
      if (bdAThisYear < today) bdAThisYear.setFullYear(today.getFullYear() + 1);
      if (bdBThisYear < today) bdBThisYear.setFullYear(today.getFullYear() + 1);
      return bdAThisYear - bdBThisYear;
    });
  if (upcoming.length === 0) return null;
  return (
    <div className="space-y-2">
      {upcoming.map((child) => {
        const bd = new Date(child.birthDate);
        const bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (bdThisYear < today) bdThisYear.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil((bdThisYear - today) / 86400000);
        const age = today.getFullYear() - bd.getFullYear();
        return (
          <div key={child.id} className="flex items-center justify-between text-sm">
            <span className="font-medium">{child.firstName} {child.lastName}</span>
            <span className="text-xs text-gray-500">
              {diffDays === 0 ? "🎉 Сегодня!" : `через ${diffDays} дн.`} (будет {age})
            </span>
          </div>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------
// Мини-расписание на неделю
// -------------------------------------------------------
const WeekMiniSchedule = ({ schedule, loading }) => {
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
  const grouped = useMemo(() => {
    const map = {};
    days.forEach((d) => (map[d] = []));
    schedule.forEach((l) => {
      const d = new Date(l.date);
      const idx = (d.getDay() + 6) % 7;
      if (idx < 6) map[days[idx]].push(l);
    });
    return map;
  }, [schedule]);
  if (loading) return <div className="animate-pulse h-24 bg-gray-200 rounded-xl" />;
  return (
    <div className="grid grid-cols-6 gap-1">
      {days.map((day) => (
        <div key={day} className="text-center">
          <div className="text-xs font-bold text-gray-500 mb-1">{day}</div>
          <div className="space-y-1">
            {grouped[day].length === 0 ? (
              <div className="h-2 w-2 rounded-full bg-gray-200 mx-auto" />
            ) : (
              grouped[day].slice(0, 2).map((l, i) => (
                <div key={i} className="h-1.5 rounded-full bg-[#f6a623]" title={l.title} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// -------------------------------------------------------
// Основной компонент
// -------------------------------------------------------
export default function DashboardParent() {
  const { user } = useAuth();
  const parentId = user?.id;
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState({ children: true, schedule: false, grades: false });

  // Загрузка детей
  useEffect(() => {
    if (!parentId) return;
    (async () => {
      try {
        const list = await fetchChildrenByParent(parentId);
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0]);
      } catch {
        toast.error("Не удалось загрузить список детей");
      } finally {
        setLoading((prev) => ({ ...prev, children: false }));
      }
    })();
  }, [parentId]);

  // Загрузка данных выбранного ребёнка
  useEffect(() => {
    if (!selectedChild) return;
    (async () => {
      setLoading((prev) => ({ ...prev, schedule: true, grades: true }));
      try {
        const today = new Date();
        const end = new Date(today.getTime() + 7 * 86400000);
        const lessons = await fetchStudentLessons(
          selectedChild.id,
          today.toISOString().split("T")[0],
          end.toISOString().split("T")[0]
        );
        setSchedule(lessons);

        const progs = await fetchStudentPrograms(selectedChild.id);
        const gradesData = await fetchStudentGrades(
          selectedChild.id,
          progs.length === 1 ? progs[0].programId : null
        );
        setGrades(gradesData);
      } catch {
        toast.error("Не удалось загрузить данные ребёнка");
      } finally {
        setLoading((prev) => ({ ...prev, schedule: false, grades: false }));
      }
    })();
  }, [selectedChild]);

  const upcomingBirthdays = children.filter((c) => {
    if (!c.birthDate) return false;
    const bd = new Date(c.birthDate);
    const bdThisYear = new Date(new Date().getFullYear(), bd.getMonth(), bd.getDate());
    if (bdThisYear < new Date()) bdThisYear.setFullYear(new Date().getFullYear() + 1);
    return Math.ceil((bdThisYear - new Date()) / 86400000) <= 30;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и выбор детей */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Панель родителя</h1>
            <p className="text-gray-500 mt-1">Добро пожаловать, {user?.firstName}!</p>
          </div>
          {!loading.children && children.length > 0 && (
            <ChildSelector children={children} selectedChild={selectedChild} onSelect={setSelectedChild} />
          )}
        </div>

        {selectedChild && (
          <>
            {/* 1-я строка: Ближайшее занятие + Посещаемость */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Clock size={20} className="text-[#f6a623]" /> Ближайшее занятие
                </h2>
                <NextLesson schedule={schedule} loading={loading.schedule} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Star size={20} className="text-[#f6a623]" /> Успеваемость и посещаемость
                </h2>
                <AttendanceBar grades={grades} />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <Link
                    to={`/student/progress?studentId=${selectedChild.id}`}
                    className="flex items-center gap-1 text-[#f6a623] hover:underline"
                  >
                    <Star size={14} /> Все оценки
                  </Link>
                  <Link
                    to={`/student/schedule?studentId=${selectedChild.id}`}
                    className="flex items-center gap-1 text-[#f6a623] hover:underline"
                  >
                    <Calendar size={14} /> Подробное расписание
                  </Link>
                </div>
              </div>
            </div>

            {/* 2-я строка: Мини-расписание + Уведомления + Дни рождения */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Calendar size={20} className="text-[#f6a623]" /> Неделя
                </h2>
                <WeekMiniSchedule schedule={schedule} loading={loading.schedule} />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Bell size={20} className="text-[#f6a623]" /> Уведомления
                </h2>
                <div className="space-y-3 text-sm">
                  {[
                    "Концерт 25 декабря в 18:00",
                    "Оплатить обучение до 30 декабря",
                    "Родительское собрание в четверг",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f6a623] mt-1.5" />
                      <p className="text-gray-700">{t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  {upcomingBirthdays.length > 0 ? (
                    <Gift size={20} className="text-[#f6a623]" />
                  ) : (
                    <Phone size={20} className="text-[#f6a623]" />
                  )}
                  {upcomingBirthdays.length > 0 ? "Дни рождения" : "На связи"}
                </h2>
                {upcomingBirthdays.length > 0 ? (
                  <BirthdaysCard children={children} />
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#f6a623]" />
                      <span className="text-gray-600">Написать преподавателю</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-[#f6a623]" />
                      <Link to="/parent/payments" className="text-[#f6a623] hover:underline">
                        Перейти к оплате
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}