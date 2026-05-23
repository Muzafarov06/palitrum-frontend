import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, User, BookOpen, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import API from "../../api/api";
import { toast } from "react-toastify";

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const getLessonTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "lecture": case "лекция": return <BookOpen size={10} className="text-purple-500" />;
    case "practice": case "практика": return <Users size={10} className="text-green-500" />;
    case "lab": case "лабораторная": return <User size={10} className="text-orange-500" />;
    default: return null;
  }
};

export default function WeekCalendar({ groupId, studentId, teacherId, programId, periodId, initialDate, periodStart, periodEnd }) {
  const [baseDate, setBaseDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHourSelector, setShowHourSelector] = useState(false);
  const [selectedHours, setSelectedHours] = useState(HOURS.map((_, i) => i));

  useEffect(() => {
    if (periodStart) setBaseDate(new Date(periodStart));
  }, [periodStart]);

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? 6 : day - 1);
    d.setDate(d.getDate() - diff);
    return d;
  };

  const [monday, setMonday] = useState(() => getMonday(baseDate));

  useEffect(() => {
    setMonday(getMonday(baseDate));
  }, [baseDate]);

  const fetchWeekLessons = async () => {
    setLoading(true);
    try {
      const startDate = new Date(monday);
      const endDate = new Date(monday);
      endDate.setDate(monday.getDate() + 6);
      const params = new URLSearchParams();
      params.append("start", startDate.toISOString().split("T")[0]);
      params.append("end", endDate.toISOString().split("T")[0]);
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
    fetchWeekLessons();
  }, [monday, groupId, studentId, teacherId, programId, periodId]);

  const toggleHour = (hourIdx) => {
    setSelectedHours(prev =>
      prev.includes(hourIdx) ? prev.filter(h => h !== hourIdx) : [...prev, hourIdx]
    );
  };

  const canGoPrev = () => {
    if (!periodStart) return true;
    const newMonday = new Date(monday);
    newMonday.setDate(monday.getDate() - 7);
    const weekEnd = new Date(newMonday);
    weekEnd.setDate(newMonday.getDate() + 6);
    return weekEnd >= periodStart;
  };

  const canGoNext = () => {
    if (!periodEnd) return true;
    const newMonday = new Date(monday);
    newMonday.setDate(monday.getDate() + 7);
    return newMonday <= periodEnd;
  };

  const prevWeek = () => {
    if (!canGoPrev()) {
      toast.info("Достигнуто начало учебного периода");
      return;
    }
    const newMonday = new Date(monday);
    newMonday.setDate(monday.getDate() - 7);
    setBaseDate(newMonday);
  };

  const nextWeek = () => {
    if (!canGoNext()) {
      toast.info("Достигнут конец учебного периода");
      return;
    }
    const newMonday = new Date(monday);
    newMonday.setDate(monday.getDate() + 7);
    setBaseDate(newMonday);
  };

  const goToToday = () => {
    const today = new Date();
    if (periodStart && today < periodStart) setBaseDate(new Date(periodStart));
    else if (periodEnd && today > periodEnd) setBaseDate(new Date(periodEnd));
    else setBaseDate(today);
  };

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  const formatLessonTime = (time) => time.substring(0, 5);

  const buildDayLessons = () => {
    const dayLessons = Array(7).fill().map(() => []);
    lessons.forEach((lesson) => {
      const lessonDate = new Date(lesson.date);
      const dayIndex = (lessonDate.getDay() + 6) % 7;
      if (dayIndex < 0 || dayIndex >= 7) return;
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
      dayLessons[dayIndex].push({
        ...lesson,
        startHourIdx,
        endHourIdx,
        span: endHourIdx - startHourIdx + 1,
      });
    });
    return dayLessons;
  };

  const buildLayers = (dayLessons) => {
    const sorted = [...dayLessons].sort((a, b) => {
      if (a.startHourIdx !== b.startHourIdx) return a.startHourIdx - b.startHourIdx;
      return b.span - a.span;
    });
    const layers = [];
    for (const lesson of sorted) {
      let placed = false;
      for (const layer of layers) {
        let conflict = false;
        for (const existing of layer) {
          if (lesson.startHourIdx < existing.startHourIdx + existing.span && 
              lesson.startHourIdx + lesson.span > existing.startHourIdx) {
            conflict = true;
            break;
          }
        }
        if (!conflict) {
          layer.push(lesson);
          placed = true;
          break;
        }
      }
      if (!placed) layers.push([lesson]);
    }
    return layers;
  };

  const dayLessons = buildDayLessons();
  const layersPerDay = dayLessons.map(dl => buildLayers(dl));

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

  const filteredHourIndices = useMemo(() => {
    const allIndices = Array.from(visibleHourIndices);
    return allIndices.filter(idx => selectedHours.includes(idx)).sort((a, b) => a - b);
  }, [visibleHourIndices, selectedHours]);

  const getVisibleSpan = (startIdx, span) => {
    let count = 0;
    for (let i = startIdx; i < startIdx + span; i++) {
      if (filteredHourIndices.includes(i)) count++;
    }
    return count;
  };

  const formatDayColumn = (date) => {
    const dayName = DAYS_SHORT[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const dayNum = date.getDate();
    return `${dayName} ${dayNum}`;
  };

  if (loading) return <div className="text-center py-12">Загрузка расписания...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Верхняя панель */}
      <div className="sticky top-0 z-10 bg-white flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#f6a623]/10 to-white border-b border-gray-200">
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={prevWeek} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623]"><ChevronLeft size={18} /></button>
            <button onClick={goToToday} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515] transition shadow-sm">Сегодня</button>
            <button onClick={nextWeek} className="p-1.5 sm:p-2 rounded-lg hover:bg-[#f6a623]/20 transition text-[#f6a623]"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-1 text-gray-700 font-semibold text-xs sm:text-base">
            <CalendarIcon size={14} className="text-[#f6a623]" />
            <span>{monday.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} – {new Date(monday.getTime() + 6 * 86400000).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
          </div>
        </div>

        {/* Мобильный выбор часов */}
        {filteredHourIndices.length > 0 && (
          <div className="md:hidden px-3 py-2 border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => setShowHourSelector(!showHourSelector)}
              className="flex items-center justify-between w-full text-xs text-gray-700"
            >
              <span className="flex items-center gap-2">
                <Clock size={12} className="text-[#f6a623]" />
                Часы ({selectedHours.length} из {HOURS.length})
              </span>
              {showHourSelector ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showHourSelector && (
              <div className="flex flex-wrap gap-1 mt-2">
                {HOURS.map((hour, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleHour(idx)}
                    className={`px-2 py-0.5 text-[10px] rounded-full transition ${
                      selectedHours.includes(idx)
                        ? "bg-[#f6a623] text-white"
                        : visibleHourIndices.has(idx)
                          ? "bg-white border border-gray-300 text-gray-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!visibleHourIndices.has(idx)}
                  >
                    {hour}:00
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Таблица расписания */}
      <div className="overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-white shadow-sm">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 z-30 bg-gray-50 px-2 sm:px-4 py-2 text-left text-[10px] sm:text-sm font-semibold text-gray-600 w-16 sm:w-28">
                <span className="hidden sm:inline">Время</span>
                <span className="sm:hidden">Час</span>
              </th>
              {filteredHourIndices.map((idx) => (
                <th key={idx} className="px-1 sm:px-2 py-2 text-center text-[10px] sm:text-sm font-semibold text-gray-600 min-w-[60px] sm:min-w-[100px]">
                  {HOURS[idx]}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((_, dayIdx) => {
              const currentDate = new Date(monday);
              currentDate.setDate(monday.getDate() + dayIdx);
              const isToday = new Date().toDateString() === currentDate.toDateString();
              const dayColumnText = formatDayColumn(currentDate);
              const layers = layersPerDay[dayIdx];
              const rowsToRender = layers.length ? layers : [[]];
              
              return rowsToRender.map((layer, layerIdx) => (
                <tr key={`${dayIdx}-${layerIdx}`} className={`border-b border-gray-100 ${isToday ? "bg-[#f6a623]/5" : ""}`}>
                  {layerIdx === 0 && (
                    <td className="sticky left-0 z-10 bg-white px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 border-r border-gray-100 whitespace-nowrap align-top" rowSpan={rowsToRender.length}>
                      <span className="font-semibold">{dayColumnText}</span>
                      <span className="hidden sm:inline text-gray-400 ml-1">{currentDate.toLocaleDateString("ru-RU", { month: "short" })}</span>
                    </td>
                  )}
                  {filteredHourIndices.map((hourIdx) => {
                    if (layer.length === 0) return <td key={hourIdx} className="px-1 sm:px-2 py-2 text-center text-gray-300 text-[10px] sm:text-sm">—</td>;
                    const lessonInLayer = layer.find(l => hourIdx >= l.startHourIdx && hourIdx < l.startHourIdx + l.span);
                    if (lessonInLayer) {
                      if (hourIdx === lessonInLayer.startHourIdx) {
                        const visibleSpan = getVisibleSpan(lessonInLayer.startHourIdx, lessonInLayer.span);
                        return (
                          <td key={hourIdx} colSpan={visibleSpan} className="px-0.5 sm:px-1 py-0.5 align-top">
                            <div
                              onClick={() => toast.info(`${lessonInLayer.title}\nВремя: ${lessonInLayer.startTime}–${lessonInLayer.endTime}\nАудитория: ${lessonInLayer.roomName || "не указана"}\nПреподаватель: ${lessonInLayer.teacherName}`)}
                              className="bg-white rounded-lg border-l-4 border-[#f6a623] p-1.5 sm:p-2 cursor-pointer transition-all hover:shadow-md shadow-sm w-full active:scale-98"
                            >
                              <div className="text-[11px] sm:text-sm font-semibold text-gray-800 break-words leading-tight line-clamp-2">
                                {lessonInLayer.title}
                              </div>
                              
                              {/* Время с иконкой часов - исправлено */}
                              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-500 mt-0.5 flex-wrap">
                                <Clock size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="font-medium">{formatLessonTime(lessonInLayer.startTime)}–{formatLessonTime(lessonInLayer.endTime)}</span>
                                {lessonInLayer.lessonType && (
                                  <span className="flex items-center gap-0.5 ml-0.5">
                                    {getLessonTypeIcon(lessonInLayer.lessonType)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Локация с иконкой MapPin - исправлено */}
                              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-gray-400 mt-0.5 truncate">
                                <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{lessonInLayer.roomName || "—"}</span>
                              </div>
                              
                              {/* Преподаватель с иконкой User */}
                              <div className="hidden sm:flex items-center gap-1 text-[9px] sm:text-xs text-gray-400 mt-0.5 truncate">
                                <User size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{lessonInLayer.teacherName}</span>
                              </div>
                            </div>
                          </td>
                        );
                      } else return null;
                    } else return <td key={hourIdx} className="px-1 sm:px-2 py-2 text-center text-gray-300 text-[10px] sm:text-sm">—</td>;
                  })}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}