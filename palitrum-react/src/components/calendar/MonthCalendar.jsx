import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Clock, MapPin } from "lucide-react";
import API from "../../api/api";
import { toast } from "react-toastify";

const DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function MonthCalendar({ groupId, studentId, teacherId, programId, periodId, initialDate, periodStart, periodEnd }) {
  const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateLessons, setSelectedDateLessons] = useState(null);

  useEffect(() => {
    if (initialDate) setCurrentDate(new Date(initialDate));
  }, [initialDate]);

  const monthStart = useMemo(() => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const day = date.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    date.setDate(date.getDate() - diff);
    return date;
  }, [currentDate]);

  const monthEnd = useMemo(() => {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() + 41);
    return date;
  }, [monthStart]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("start", monthStart.toISOString().split("T")[0]);
      params.append("end", monthEnd.toISOString().split("T")[0]);
      if (groupId) params.append("groupId", groupId);
      if (studentId) params.append("studentId", studentId);
      if (teacherId) params.append("teacherId", teacherId);
      if (programId) params.append("programId", programId);
      if (periodId) params.append("periodId", periodId);
      const response = await API.get(`/api/lessons/calendar?${params.toString()}`);
      setLessons(response.data);
    } catch (err) {
      toast.error("Не удалось загрузить расписание");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [monthStart, groupId, studentId, teacherId, programId, periodId]);

  const canGoPrev = () => {
    if (!periodStart) return true;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const newMonthEnd = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    return newMonthEnd >= periodStart;
  };

  const canGoNext = () => {
    if (!periodEnd) return true;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    return newDate <= periodEnd;
  };

  const prevMonth = () => {
    if (!canGoPrev()) {
      toast.info("Достигнуто начало учебного периода");
      return;
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    if (!canGoNext()) {
      toast.info("Достигнут конец учебного периода");
      return;
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    if (periodStart && today < periodStart) setCurrentDate(new Date(periodStart));
    else if (periodEnd && today > periodEnd) setCurrentDate(new Date(periodEnd));
    else setCurrentDate(today);
  };

  const getLessonsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return lessons.filter(l => l.date === dateStr);
  };

  const openModal = (date) => {
    setSelectedDateLessons({ date, lessons: getLessonsForDate(date) });
  };

  const closeModal = () => setSelectedDateLessons(null);

  const renderCells = () => {
    const start = monthStart;
    const end = monthEnd;
    const cells = [];
    let day = new Date(start);
    while (day <= end) {
      const date = new Date(day);
      const lessonsInDay = getLessonsForDate(date);
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === new Date().toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      cells.push(
        <div
          key={date.toISOString()}
          className={`border border-gray-100 p-1 sm:p-2 min-h-[70px] sm:min-h-[100px] bg-white transition cursor-pointer
            ${!isCurrentMonth ? "text-gray-400 bg-gray-50" : ""}
            ${isWeekend && isCurrentMonth ? "bg-gray-50" : ""}
            ${!isCurrentMonth ? "hover:bg-gray-100" : "hover:bg-gray-50"}`}
          onClick={() => openModal(date)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs sm:text-sm font-semibold inline-flex w-6 h-6 sm:w-7 sm:h-7 items-center justify-center rounded-full
              ${isToday ? "bg-[#f6a623] text-white" : isCurrentMonth ? "text-gray-800" : "text-gray-400"}`}>
              {date.getDate()}
            </span>
            {lessonsInDay.length > 0 && (
              <span className="text-[10px] sm:text-xs text-white bg-[#f6a623] rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {lessonsInDay.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-0.5 sm:space-y-1">
            {lessonsInDay.slice(0, 2).map((lesson, i) => (
              <div key={i} className="text-[10px] sm:text-xs bg-[#f6a623]/10 rounded px-1 py-0.5 truncate hidden sm:block" title={`${lesson.title}\n${lesson.startTime}–${lesson.endTime}\n${lesson.teacherName}`}>
                {lesson.title.length > 15 ? lesson.title.slice(0, 12) + "..." : lesson.title}
              </div>
            ))}
            <div className="block sm:hidden">
              {lessonsInDay.slice(0, 1).map((lesson, i) => (
                <div key={i} className="text-[10px] bg-[#f6a623]/10 rounded px-1 py-0.5 truncate">
                  {lesson.title.length > 10 ? lesson.title.slice(0, 8) + "…" : lesson.title}
                </div>
              ))}
            </div>
            {lessonsInDay.length > 2 && (
              <div className="text-[10px] sm:text-xs text-[#f6a623] font-medium">
                +{lessonsInDay.length - 2}
              </div>
            )}
          </div>
        </div>
      );
      day.setDate(day.getDate() + 1);
    }
    return cells;
  };

  if (loading) return <div className="text-center py-12">Загрузка расписания...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 bg-white flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#f6a623]/10 to-white border-b border-gray-200">
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={prevMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623]"><ChevronLeft size={18} /></button>
            <button onClick={goToCurrentMonth} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515] transition shadow-sm">Текущий</button>
            <button onClick={nextMonth} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623]"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-1 text-gray-700 font-semibold text-sm sm:text-base">
            <CalendarIcon size={16} className="text-[#f6a623]" />
            <span className="capitalize">{currentDate.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Календарь */}
      <div className="overflow-y-auto flex-1">
        {/* Дни недели - адаптивные */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-5">
          {DAYS.map((day, idx) => (
            <div key={day} className="p-1 sm:p-2 text-center text-[10px] sm:text-sm font-semibold text-gray-600 truncate">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{DAYS_SHORT[idx]}</span>
            </div>
          ))}
        </div>
        
        {/* Ячейки дней */}
        <div className="grid grid-cols-7 auto-rows-fr">{renderCells()}</div>
      </div>

      {/* Модальное окно с деталями занятия */}
      {selectedDateLessons && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {selectedDateLessons.date.toLocaleDateString("ru-RU", { 
                  day: "numeric", 
                  month: "long",
                  weekday: "short"
                })}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 transition"><X size={20} /></button>
            </div>
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[60vh] space-y-2">
              {selectedDateLessons.lessons.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет занятий</p>
              ) : (
                selectedDateLessons.lessons.map((lesson, idx) => (
                  <div key={idx} 
                    onClick={() => {
                      toast.info(`${lesson.title}\nВремя: ${lesson.startTime}–${lesson.endTime}\nПреподаватель: ${lesson.teacherName}\nАудитория: ${lesson.roomName || "не указана"}`);
                      closeModal();
                    }}
                    className="border-l-4 border-[#f6a623] bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition active:scale-98"
                  >
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{lesson.title}</div>
                    
                    {/* Время с уменьшенной иконкой */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">{lesson.startTime} – {lesson.endTime}</span>
                    </div>
                    
                    {/* Локация с уменьшенной иконкой */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                      <span className="text-[11px] sm:text-xs text-gray-500 truncate">
                        {lesson.roomName || "комната не указана"}
                      </span>
                    </div>
                    
                    {/* Преподаватель */}
                    <div className="text-[11px] sm:text-xs text-gray-400 mt-1.5 pt-1 border-t border-gray-200">
                      {lesson.teacherName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}