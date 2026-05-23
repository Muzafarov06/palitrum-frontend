import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, User, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import API from "../../api/api";
import { toast } from "react-toastify";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const getLessonTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "lecture": case "лекция": return <BookOpen size={12} className="text-purple-500" />;
    case "practice": case "практика": return <Users size={12} className="text-green-500" />;
    case "lab": case "лабораторная": return <User size={12} className="text-orange-500" />;
    default: return null;
  }
};

export default function DayCalendar({ groupId, studentId, teacherId, programId, periodId, initialDate, periodStart, periodEnd }) {
  const [currentDate, setCurrentDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [lessons, setLessons] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState([]);

  useEffect(() => {
    if (periodStart) setCurrentDate(new Date(periodStart));
  }, [periodStart]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await API.get("/api/rooms");
        let roomsData = [];
        if (Array.isArray(response.data)) roomsData = response.data;
        else if (response.data && Array.isArray(response.data.content)) roomsData = response.data.content;
        setRooms(roomsData);
        setSelectedRooms(roomsData.map(r => r.id));
      } catch (err) {
        toast.error("Не удалось загрузить комнаты");
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (initialDate) setCurrentDate(new Date(initialDate));
  }, [initialDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split("T")[0];
      const params = new URLSearchParams();
      params.append("start", dateStr);
      params.append("end", dateStr);
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
  }, [currentDate, groupId, studentId, teacherId, programId, periodId]);

  const canGoPrev = () => {
    if (!periodStart) return true;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    return newDate >= periodStart;
  };

  const canGoNext = () => {
    if (!periodEnd) return true;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    return newDate <= periodEnd;
  };

  const prevDay = () => {
    if (!canGoPrev()) return;
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    if (!canGoNext()) return;
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() + 1);
    setCurrentDate(d);
  };

  const goToToday = () => {
    const today = new Date();
    if (periodStart && today < periodStart) setCurrentDate(new Date(periodStart));
    else if (periodEnd && today > periodEnd) setCurrentDate(new Date(periodEnd));
    else setCurrentDate(today);
  };

  const toggleRoom = (roomId) => {
    setSelectedRooms(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  const formatLessonTime = (time) => time.substring(0, 5);

  const filteredRooms = rooms.filter(room => selectedRooms.includes(room.id));
  const sortedRooms = useMemo(() => {
    const dateStr = currentDate.toISOString().split("T")[0];
    const roomsWithLessonsToday = new Set(lessons.filter(l => l.date === dateStr).map(l => l.roomId));
    const withLessons = filteredRooms.filter(r => roomsWithLessonsToday.has(r.id));
    const withoutLessons = filteredRooms.filter(r => !roomsWithLessonsToday.has(r.id));
    const sortByName = (a, b) => a.name.localeCompare(b.name);
    return [...withLessons.sort(sortByName), ...withoutLessons.sort(sortByName)];
  }, [filteredRooms, lessons, currentDate]);

  const visibleHourIndices = useMemo(() => {
    const indices = new Set();
    lessons.forEach((lesson) => {
      const start = parseTime(lesson.startTime);
      const end = parseTime(lesson.endTime);
      let startHourIdx = -1, endHourIdx = -1;
      for (let i = 0; i < HOURS.length; i++) {
        const hourStart = HOURS[i];
        const hourEnd = hourStart + 1;
        if (start < hourEnd && end > hourStart) {
          if (startHourIdx === -1) startHourIdx = i;
          endHourIdx = i;
        }
      }
      if (startHourIdx === -1) return;
      for (let i = startHourIdx; i <= endHourIdx; i++) indices.add(i);
    });
    return indices;
  }, [lessons]);

  const visibleIndicesSorted = useMemo(() => Array.from(visibleHourIndices).sort((a, b) => a - b), [visibleHourIndices]);

  if (loading) return <div className="text-center py-12">Загрузка расписания...</div>;
  if (!rooms.length) return <div className="text-center py-12">Нет доступных комнат</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 bg-white flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#f6a623]/10 to-white border-b border-gray-200">
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={prevDay} disabled={!canGoPrev()} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623] disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button onClick={goToToday} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515] transition shadow-sm">Сегодня</button>
            <button onClick={nextDay} disabled={!canGoNext()} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623] disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-1 text-gray-700 font-semibold text-sm sm:text-base">
            <CalendarIcon size={16} className="text-[#f6a623]" />
            <span>{currentDate.toLocaleDateString("ru-RU")}</span>
          </div>
        </div>

        {/* Мобильный выбор аудиторий */}
        <div className="md:hidden px-3 py-2 border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => setShowRoomSelector(!showRoomSelector)}
            className="flex items-center justify-between w-full text-sm text-gray-700"
          >
            <span className="flex items-center gap-2">
              <Users size={14} className="text-[#f6a623]" />
              Аудитории ({selectedRooms.length} из {rooms.length})
            </span>
            {showRoomSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showRoomSelector && (
            <div className="flex flex-wrap gap-2 mt-3">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => toggleRoom(room.id)}
                  className={`px-2 py-1 text-xs rounded-full transition ${
                    selectedRooms.includes(room.id)
                      ? "bg-[#f6a623] text-white"
                      : "bg-white border border-gray-300 text-gray-600"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Таблица расписания */}
      <div className="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
        {sortedRooms.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Нет выбранных аудиторий</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 z-30 bg-gray-50 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600 w-20 sm:w-28">Время</th>
                {sortedRooms.map(room => (
                  <th key={room.id} className="px-2 sm:px-3 py-2 text-left text-xs sm:text-sm font-semibold text-gray-600 min-w-[140px] sm:min-w-[180px] max-w-[180px] bg-gray-50 truncate">
                    {room.name}
                  </th>
                ))}
               </tr>
            </thead>
            <tbody>
              {visibleIndicesSorted.map((hourIdx) => {
                const hour = HOURS[hourIdx];
                const isCurrentHour = new Date().toISOString().split("T")[0] === currentDate.toISOString().split("T")[0] && hour === new Date().getHours();
                return (
                  <tr key={hourIdx} className={`border-b border-gray-100 ${isCurrentHour ? "bg-[#f6a623]/5" : ""}`}>
                    <td className="sticky left-0 z-10 bg-white px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-500 border-r border-gray-100 font-medium align-top">{hour}:00</td>
                    {sortedRooms.map(room => {
                      // Находим занятия в этой аудитории в этот час
                      const lessonsInRoom = lessons.filter(l => l.roomId === room.id && l.date === currentDate.toISOString().split("T")[0]);
                      const lessonsInHour = lessonsInRoom.filter(l => {
                        const start = parseTime(l.startTime);
                        const end = parseTime(l.endTime);
                        const hourStart = hour;
                        const hourEnd = hour + 1;
                        return start < hourEnd && end > hourStart;
                      });
                      
                      if (lessonsInHour.length === 0) {
                        return <td key={room.id} className="px-2 py-2 text-center text-gray-300 text-xs sm:text-sm align-top">—</td>;
                      }
                      return (
                        <td key={room.id} className="px-1 sm:px-2 py-1 align-top">
                          <div className="space-y-1">
                            {lessonsInHour.map((lesson, idx) => {
                              const startHourFloat = parseTime(lesson.startTime);
                              const startHourWhole = Math.floor(startHourFloat);
                              const isStartHour = startHourWhole === hour;
                              const endHourFloat = parseTime(lesson.endTime);
                              const lastHour = endHourFloat % 1 === 0 ? endHourFloat - 1 : Math.floor(endHourFloat);
                              const isEndHour = hour === lastHour;
                              
                              return (
                                <div
                                  key={idx}
                                  onClick={() => toast.info(`${lesson.title}\nВремя: ${lesson.startTime}–${lesson.endTime}\nПреподаватель: ${lesson.teacherName}\nСтатус: ${lesson.status || 'не указан'}`)}
                                  className={`bg-white p-1.5 sm:p-2 transition-all hover:shadow-md border-l-4 border-[#f6a623] shadow-sm w-full cursor-pointer
                                    ${!isStartHour && !isEndHour ? 'rounded-none' : ''}
                                    ${isStartHour && isEndHour ? 'rounded-lg' : ''}
                                    ${isStartHour && !isEndHour ? 'rounded-t-lg rounded-b-none' : ''}
                                    ${!isStartHour && isEndHour ? 'rounded-t-none rounded-b-lg' : ''}
                                    ${isEndHour ? 'border-b-4 border-b-[#f6a623]' : ''}
                                  `}
                                >
                                  <div className={isStartHour ? '' : 'invisible'}>
                                    <div className="text-xs sm:text-sm font-semibold text-gray-800 break-words leading-tight">{lesson.title}</div>
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                                      <Clock size={10} />
                                      <span>{formatLessonTime(lesson.startTime)}–{formatLessonTime(lesson.endTime)}</span>
                                      {lesson.lessonType && (
                                        <span className="flex items-center gap-0.5">
                                          {getLessonTypeIcon(lesson.lessonType)}
                                          <span className="capitalize text-gray-400 hidden sm:inline">{lesson.lessonType.substring(0, 3)}</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                                      <User size={10} />
                                      <span className="truncate">{lesson.teacherName}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}