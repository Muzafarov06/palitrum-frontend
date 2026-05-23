import React, { useState, useEffect, useCallback, useMemo } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  Clock,
  CheckCheck,
  ArrowLeft,
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

// Обычный селект без иконок
const SimpleAttendanceSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50 appearance-none cursor-pointer"
  >
    <option value="PRESENT">Присутствовал</option>
    <option value="ABSENT">Отсутствовал</option>
    <option value="LATE">Опоздал</option>
    <option value="EXCUSED">По уваж. причине</option>
  </select>
);

export default function TeacherJournalPage() {
  const today = new Date();
  const startOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    return d;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(today));
  const [weekLessons, setWeekLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [animating, setAnimating] = useState(false);

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 5);

  const formatDate = (d) => d.toLocaleDateString("ru-RU");
  const formatTime = (t) => t?.substring(0, 5);

  const fetchWeekLessons = useCallback(async () => {
    setLoadingWeek(true);
    try {
      const start = currentWeekStart.toISOString().split("T")[0];
      const end = weekEnd.toISOString().split("T")[0];
      const response = await API.get(
        `/api/journal/teacher/lessons?start=${start}&end=${end}`
      );
      setWeekLessons(response.data);
    } catch (err) {
      toast.error("Не удалось загрузить расписание на неделю");
    } finally {
      setLoadingWeek(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchWeekLessons();
  }, [fetchWeekLessons]);

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
    weekLessons.forEach((lesson) => {
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
  }, [weekLessons]);

  const openLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setLoadingParticipants(true);
    try {
      const res = await API.get(`/api/journal/lessons/${lesson.id}/participants`);
      setParticipants(res.data);
    } catch (err) {
      toast.error("Не удалось загрузить список учеников");
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const backToWeek = () => {
    setSelectedLesson(null);
    setParticipants([]);
  };

  const updateParticipant = async (participantId, field, value) => {
    const current = participants.find((p) => p.id === participantId);
    if (!current) return;
    const body = {
      attendanceStatus: current.attendanceStatus,
      gradeValue: current.gradeValue,
    };
    if (field === "attendanceStatus") body.attendanceStatus = value;
    if (field === "gradeValue") body.gradeValue = value;

    try {
      await API.patch(`/api/journal/participants/${participantId}`, body);
      setParticipants((prev) =>
        prev.map((p) => (p.id === participantId ? { ...p, [field]: value } : p))
      );
      toast.success("Сохранено");
    } catch (err) {
      toast.error("Ошибка сохранения");
    }
  };

  const markAllPresent = async () => {
    if (!participants.length) return;
    const updates = participants.map((p) =>
      API.patch(`/api/journal/participants/${p.id}`, {
        attendanceStatus: "PRESENT",
        gradeValue: p.gradeValue,
      })
    );
    try {
      await Promise.all(updates);
      setParticipants((prev) =>
        prev.map((p) => ({ ...p, attendanceStatus: "PRESENT" }))
      );
      toast.success("Все отмечены присутствующими");
    } catch (err) {
      toast.error("Ошибка массового сохранения");
    }
  };

  const getDateForDay = (dayIndex) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const isToday = (date) => date.toDateString() === today.toDateString();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-6 pb-10 flex flex-col">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#f6a623]/10 rounded-xl">
            <BookOpen size={28} className="text-[#f6a623]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedLesson ? "Журнал занятия" : "Журнал"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!selectedLesson ? (
            <>
              <button onClick={() => changeWeek(-1)} disabled={animating}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                {formatDate(currentWeekStart)} – {formatDate(weekEnd)}
              </span>
              <button onClick={() => changeWeek(1)} disabled={animating}
                className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setCurrentWeekStart(startOfWeek(today))}
                className="px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-100 transition">
                Сегодня
              </button>
            </>
          ) : (
            <button onClick={backToWeek}
              className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-100 transition flex items-center gap-2">
              <ArrowLeft size={16} /> Назад к расписанию
            </button>
          )}
        </div>
      </div>

      {/* Контент: неделя или детали урока */}
      {!selectedLesson ? (
        <div className={`flex-1 flex gap-6 min-h-0 transition-opacity duration-200 ${animating ? "opacity-50" : "opacity-100"}`}>
          {/* Левая колонка: ПН-СР */}
          <div className="flex-1 grid grid-rows-3 gap-4">
            {DAYS_OF_WEEK.slice(0, 3).map((day, idx) => {
              const date = getDateForDay(idx);
              const lessonsForDay = groupedLessons[day] || [];
              const dayLabel = FULL_DAY_NAMES[day];
              const dateStr = `${date.getDate()}.${("0" + (date.getMonth() + 1)).slice(-2)}`;
              return (
                <div key={day}
                  className={`relative bg-white rounded-xl shadow-sm border ${
                    isToday(date) ? "border-[#f6a623] ring-2 ring-[#f6a623]/20" : "border-gray-100"
                  } p-3 flex gap-3 overflow-hidden`}>
                  <span className="absolute top-0 right-0 text-sm font-regular text-gray-700 bg-white border border-gray-200 rounded-bl-lg shadow-sm px-2 py-0.5 tracking-wide">
                    {dateStr}
                  </span>

                  <div className="flex-shrink-0 flex items-center justify-center"
                       style={{ width: "1.8rem" }}>
                    <div style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                      textOrientation: "mixed",
                      whiteSpace: "nowrap",
                    }}>
                      <span className="text-[20px] font-medium text-gray-700 tracking-wide">
                        {dayLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
                    {lessonsForDay.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Нет занятий</p>
                    ) : (
                      lessonsForDay.map((lesson) => (
                        <button key={lesson.id} onClick={() => openLesson(lesson)}
                          className="w-full text-left p-1.5 rounded-lg border border-gray-200 hover:border-[#f6a623] hover:shadow-sm transition-all flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-600 whitespace-nowrap pt-0.5">
                            {formatTime(lesson.startTime)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {lesson.groupName || lesson.studentName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {lesson.subjectName}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Правая колонка: ЧТ-СБ */}
          <div className="flex-1 grid grid-rows-3 gap-4">
            {DAYS_OF_WEEK.slice(3, 6).map((day, idx) => {
              const date = getDateForDay(idx + 3);
              const lessonsForDay = groupedLessons[day] || [];
              const dayLabel = FULL_DAY_NAMES[day];
              const dateStr = `${date.getDate()}.${("0" + (date.getMonth() + 1)).slice(-2)}`;
              return (
                <div key={day}
                  className={`relative bg-white rounded-xl shadow-sm border ${
                    isToday(date) ? "border-[#f6a623] ring-2 ring-[#f6a623]/20" : "border-gray-100"
                  } p-3 flex gap-3 overflow-hidden`}>
                  <span className="absolute top-0 right-0 text-sm font-regular text-gray-700 bg-white border border-gray-200 rounded-bl-lg shadow-sm px-2 py-0.5 tracking-wide">
                    {dateStr}
                  </span>

                  <div className="flex-shrink-0 flex items-center justify-center"
                       style={{ width: "1.8rem" }}>
                    <div style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                      textOrientation: "mixed",
                      whiteSpace: "nowrap",
                    }}>
                      <span className="text-[20px] font-medium text-gray-700 tracking-wide">
                        {dayLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1.5">
                    {lessonsForDay.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2">Нет занятий</p>
                    ) : (
                      lessonsForDay.map((lesson) => (
                        <button key={lesson.id} onClick={() => openLesson(lesson)}
                          className="w-full text-left p-1.5 rounded-lg border border-gray-200 hover:border-[#f6a623] hover:shadow-sm transition-all flex items-start gap-2">
                          <span className="text-xs font-bold text-gray-600 whitespace-nowrap pt-0.5">
                            {formatTime(lesson.startTime)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {lesson.groupName || lesson.studentName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {lesson.subjectName}
                            </div>
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
      ) : (
        /* Детальный просмотр урока */
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-[#f6a623]" />
                {selectedLesson.groupName || selectedLesson.studentName}
              </h2>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen size={14} /> {selectedLesson.subjectName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {formatTime(selectedLesson.startTime)}–{formatTime(selectedLesson.endTime)}
                </span>
                <span>{formatDate(new Date(selectedLesson.date))}</span>
              </div>
            </div>
            <button
              onClick={markAllPresent}
              className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition flex items-center gap-1"
            >
              <CheckCheck size={14} /> Все присутствуют
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
            {loadingParticipants ? (
              <p className="text-gray-500">Загрузка учеников...</p>
            ) : participants.length === 0 ? (
              <p className="text-gray-500">Нет учеников</p>
            ) : (
              <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-[600px] w-full divide-y divide-gray-200 border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-10 px-2 py-3 text-center text-sm font-semibold text-gray-600">№</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ученик</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 w-1/4">Посещаемость</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-1/6">Оценка</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {participants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-2 py-3 text-sm text-gray-400 text-center">{idx + 1}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-800">{p.studentFullName}</td>
                        <td className="px-4 py-3">
                          <SimpleAttendanceSelect
                            value={p.attendanceStatus}
                            onChange={(val) => updateParticipant(p.id, "attendanceStatus", val)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="text"
                            value={p.gradeValue || ""}
                            onChange={(e) => updateParticipant(p.id, "gradeValue", e.target.value)}
                            onBlur={(e) => {
                              if (e.target.value !== p.gradeValue) {
                                updateParticipant(p.id, "gradeValue", e.target.value);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const inputs = Array.from(document.querySelectorAll('.grade-input'));
                                const index = inputs.indexOf(e.target);
                                if (index !== -1 && index < inputs.length - 1) {
                                  inputs[index + 1].focus();
                                }
                              }
                            }}
                            className="grade-input w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50"
                            placeholder="5"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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