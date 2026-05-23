// src/pages/student/StudentSchedulePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/layout/Sidebar";
import API from "../../api/api";
import { toast } from "react-toastify";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowLeft,
  BookOpen,
  Clock,
  MapPin,
  X,
} from "lucide-react";

const DAYS_OF_WEEK = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
const FULL_DAY_NAMES = {
  ПН: "ПОНЕДЕЛЬНИК",
  ВТ: "ВТОРНИК",
  СР: "СРЕДА",
  ЧТ: "ЧЕТВЕРГ",
  ПТ: "ПЯТНИЦА",
  СБ: "СУББОТА",
};

// Модальное окно для деталей занятия
const LessonModal = ({ lesson, onClose }) => {
  if (!lesson) return null;
  const formatTime = (t) => t?.substring(0, 5);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{lesson.title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={14} className="text-[#f6a623]" />
              <span className="font-medium">Тип занятия:</span>{" "}
              {lesson.groupName
                ? `Групповое, ${lesson.groupName}`
                : lesson.studentName
                ? "Индивидуальное"
                : "—"}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen size={14} className="text-[#f6a623]" />
              <span className="font-medium">Предмет:</span>{" "}
              {lesson.title?.split("(")[0]?.trim() || lesson.title}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={14} className="text-[#f6a623]" />
              <span className="font-medium">Время:</span> {formatTime(lesson.startTime)} – {formatTime(lesson.endTime)}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={14} className="text-[#f6a623]" />
              <span className="font-medium">Аудитория:</span> {lesson.roomName || "не указана"}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={14} className="text-[#f6a623]" />
              <span className="font-medium">Преподаватель:</span> {lesson.teacherName || "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentSchedulePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  // Если передан параметр studentId (родитель смотрит ребёнка) — используем его,
  // иначе берём id текущего пользователя (студент смотрит своё расписание)
  const studentId = searchParams.get("studentId") || user?.id;

  const today = new Date();
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    return d;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(today));
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 5);

  const formatDate = (d) => d.toLocaleDateString("ru-RU");
  const formatTime = (t) => t?.substring(0, 5);

  const fetchLessons = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const start = currentWeekStart.toISOString().split("T")[0];
      const end = weekEnd.toISOString().split("T")[0];
      const response = await API.get(
        `/api/lessons/calendar?start=${start}&end=${end}&studentId=${studentId}`
      );
      setLessons(response.data);
    } catch (err) {
      toast.error("Не удалось загрузить расписание");
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, studentId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const changeWeek = (dir) => {
    setAnimating(true);
    setTimeout(() => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(currentWeekStart.getDate() + dir * 7);
      setCurrentWeekStart(newStart);
      setAnimating(false);
    }, 150);
  };

  const groupedLessons = useMemo(() => {
    const map = {};
    DAYS_OF_WEEK.forEach((day) => (map[day] = []));
    lessons.forEach((lesson) => {
      const lessonDate = new Date(lesson.date);
      const dayOfWeek = (lessonDate.getDay() + 6) % 7;
      const dayKey = DAYS_OF_WEEK[dayOfWeek];
      if (map[dayKey]) {
        map[dayKey].push(lesson);
      }
    });
    Object.keys(map).forEach((day) => {
      map[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [lessons]);

  const getDateForDay = (dayIndex) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const isToday = (date) => date.toDateString() === today.toDateString();

  // Определяем заголовок и ссылку «Назад» в зависимости от того, кто смотрит
  const isParentView = !!searchParams.get("studentId");
  const backLink = isParentView ? "/parent/dashboard" : "/student";
  const headerTitle = isParentView ? "Расписание ребёнка" : "Моё расписание";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl">
              <BookOpen size={28} className="text-[#f6a623]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{headerTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changeWeek(-1)} disabled={animating} className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium bg-white px-3 py-1.5 rounded-lg border shadow-sm">
              {formatDate(currentWeekStart)} – {formatDate(weekEnd)}
            </span>
            <button onClick={() => changeWeek(1)} disabled={animating} className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setCurrentWeekStart(startOfWeek(today))} className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-100 transition">
              Сегодня
            </button>
            <Link to={backLink} className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border rounded-lg px-3 py-2 hover:bg-gray-100 transition shadow-sm">
              <ArrowLeft size={16} className="text-[#f6a623]"/>
              На главную
            </Link>
          </div>
        </div>

        {/* Сетка дней */}
        <div className={`flex-1 flex gap-6 min-h-0 transition-opacity duration-200 ${animating ? "opacity-50" : "opacity-100"}`}>
          <div className="flex-1 grid grid-rows-3 gap-4">
            {DAYS_OF_WEEK.slice(0, 3).map((day, idx) => {
              const date = getDateForDay(idx);
              const lessonsForDay = groupedLessons[day] || [];
              const dayLabel = FULL_DAY_NAMES[day];
              const dateStr = `${date.getDate()}.${("0" + (date.getMonth() + 1)).slice(-2)}`;
              return (
                <div key={day} className={`relative bg-white rounded-xl shadow-sm border ${isToday(date) ? "border-[#f6a623] ring-2 ring-[#f6a623]/20" : "border-gray-100"} p-3 flex gap-3 overflow-hidden`}>
                  <span className="absolute top-0 right-0 text-sm font-regular text-gray-700 bg-white border border-gray-200 rounded-bl-lg shadow-sm px-2 py-0.5 tracking-wide">{dateStr}</span>
                  <div className="flex-shrink-0 flex items-center justify-center" style={{ width: "1.8rem" }}>
                    <div style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", textOrientation: "mixed", whiteSpace: "nowrap" }}>
                      <span className="text-[20px] font-medium text-gray-700 tracking-wide">{dayLabel}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
                    {lessonsForDay.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Нет занятий</p>
                    ) : (
                      lessonsForDay.map((lesson) => (
                        <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="w-full text-left p-1.5 rounded-lg border border-gray-200 hover:border-[#f6a623] hover:shadow-sm transition-all flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-600 whitespace-nowrap pt-0.5">{formatTime(lesson.startTime)}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-800 truncate">{lesson.title}</div>
                            <div className="text-xs text-gray-500 truncate">{lesson.teacherName} • {lesson.roomName || "—"}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex-1 grid grid-rows-3 gap-4">
            {DAYS_OF_WEEK.slice(3, 6).map((day, idx) => {
              const date = getDateForDay(idx + 3);
              const lessonsForDay = groupedLessons[day] || [];
              const dayLabel = FULL_DAY_NAMES[day];
              const dateStr = `${date.getDate()}.${("0" + (date.getMonth() + 1)).slice(-2)}`;
              return (
                <div key={day} className={`relative bg-white rounded-xl shadow-sm border ${isToday(date) ? "border-[#f6a623] ring-2 ring-[#f6a623]/20" : "border-gray-100"} p-3 flex gap-3 overflow-hidden`}>
                  <span className="absolute top-0 right-0 text-sm font-regular text-gray-700 bg-white border border-gray-200 rounded-bl-lg shadow-sm px-2 py-0.5 tracking-wide">{dateStr}</span>
                  <div className="flex-shrink-0 flex items-center justify-center" style={{ width: "1.8rem" }}>
                    <div style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", textOrientation: "mixed", whiteSpace: "nowrap" }}>
                      <span className="text-[20px] font-medium text-gray-700 tracking-wide">{dayLabel}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
                    {lessonsForDay.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Нет занятий</p>
                    ) : (
                      lessonsForDay.map((lesson) => (
                        <button key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="w-full text-left p-1.5 rounded-lg border border-gray-200 hover:border-[#f6a623] hover:shadow-sm transition-all flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-600 whitespace-nowrap pt-0.5">{formatTime(lesson.startTime)}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-800 truncate">{lesson.title}</div>
                            <div className="text-xs text-gray-500 truncate">{lesson.teacherName} • {lesson.roomName || "—"}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedLesson && (
        <LessonModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}

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