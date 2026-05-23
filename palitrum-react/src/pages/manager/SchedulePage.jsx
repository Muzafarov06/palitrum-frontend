import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import WeekCalendar from "../../components/calendar/WeekCalendar";
import DayCalendar from "../../components/calendar/DayCalendar";
import MonthCalendar from "../../components/calendar/MonthCalendar";
import { fetchAcademicPeriods, fetchAllPrograms } from "../../api/api";
import CustomSelect from "../../components/common/CustomSelect";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

export default function SchedulePage() {
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));
  const isTeacher = roles.includes("TEACHER");
  const isStudent = roles.includes("STUDENT");

  const [viewMode, setViewMode] = useState("week");
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [initialDate, setInitialDate] = useState(null);
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAllPrograms()
        .then(data => {
          setPrograms(data);
          if (data.length > 0) setSelectedProgram(data[0]);
        })
        .catch(() => {});
    }
    fetchAcademicPeriods()
      .then(data => {
        const content = data.content || [];
        setPeriods(content);
        const current = content.find(p => p.isCurrent);
        if (current) {
          setSelectedPeriod(current);
          setInitialDate(new Date(current.startDate));
          setPeriodStart(new Date(current.startDate));
          setPeriodEnd(new Date(current.endDate));
        } else if (content.length > 0) {
          setSelectedPeriod(content[0]);
          setInitialDate(new Date(content[0].startDate));
          setPeriodStart(new Date(content[0].startDate));
          setPeriodEnd(new Date(content[0].endDate));
        }
      })
      .catch(() => {});
  }, [isAdmin]);

  const handlePeriodChange = (periodId) => {
    const period = periods.find(p => p.id === periodId);
    if (period) {
      setSelectedPeriod(period);
      setInitialDate(new Date(period.startDate));
      setPeriodStart(new Date(period.startDate));
      setPeriodEnd(new Date(period.endDate));
    }
  };

  let studentId = null;
  let teacherId = null;
  if (isStudent) studentId = user.id;
  if (isTeacher) teacherId = user.id;

  const commonProps = {
    programId: isAdmin ? selectedProgram?.id : null,
    studentId,
    teacherId,
    initialDate: initialDate,
    periodId: selectedPeriod?.id,
    periodStart: periodStart,
    periodEnd: periodEnd,
  };

  const renderCalendar = () => {
    switch (viewMode) {
      case "day": return <DayCalendar {...commonProps} />;
      case "week": return <WeekCalendar {...commonProps} />;
      case "month": return <MonthCalendar {...commonProps} />;
      default: return <WeekCalendar {...commonProps} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full flex flex-col p-3 sm:p-6">
        {/* Заголовок */}
        <div className="flex items-center gap-2 pl-10 md:pl-0 mb-3 flex-shrink-0">
          <div className="p-1.5 bg-[#f6a623]/10 rounded-lg shrink-0">
            <Calendar size={20} className="text-[#f6a623]" />
          </div>
          <h1 className="text-lg sm:text-3xl font-bold text-gray-800 truncate">Расписание</h1>
        </div>

        {/* Переключатель видов (День/Неделя/Месяц) */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm mb-3 flex-shrink-0 self-start">
          <button
            onClick={() => setViewMode("day")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition ${
              viewMode === "day"
                ? "bg-[#f6a623] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            День
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition ${
              viewMode === "week"
                ? "bg-[#f6a623] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition ${
              viewMode === "month"
                ? "bg-[#f6a623] text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Месяц
          </button>
        </div>

        {/* Кнопка показа/скрытия фильтров на мобильных */}
        {(periods.length > 0 || (isAdmin && programs.length > 0)) && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-xl mb-3 text-sm text-gray-700"
          >
            <span className="flex items-center gap-2">
              <Calendar size={14} className="text-[#f6a623]" />
              Фильтры расписания
            </span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {/* Фильтры - на десктопе всегда видно, на мобильных скрываются */}
        <div className={`${showFilters ? 'block' : 'hidden md:flex'} flex-col md:flex-row gap-3 mb-4 flex-shrink-0`}>
          {periods.length > 0 && (
            <div className="w-full md:w-64">
              <CustomSelect
                label="Учебный период"
                value={selectedPeriod?.id || ""}
                onChange={handlePeriodChange}
                options={periods.map(p => ({ value: p.id, label: p.name }))}
              />
            </div>
          )}
          {isAdmin && programs.length > 0 && (
            <div className="w-full md:w-64">
              <CustomSelect
                label="Учебная программа"
                value={selectedProgram?.id || ""}
                onChange={(id) => setSelectedProgram(programs.find(p => p.id === id))}
                options={programs.map(p => ({ value: p.id, label: p.name }))}
                clearable
              />
            </div>
          )}
        </div>

        {/* Календарь */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {renderCalendar()}
        </div>
      </div>

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}