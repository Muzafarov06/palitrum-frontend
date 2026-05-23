import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomDatePicker({
  selected,
  onChange,
  placeholder = "Выберите дату",
  label = null,
  required = false,
  className = "",
  maxDate = null,                // ← теперь по умолчанию без ограничения
  minDate = null,
  isClearable = true,
  popperClassName = "z-30",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(selected || new Date());
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (selected) {
      setDisplayDate(selected);
    }
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthChange = (month) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(parseInt(month));
    setDisplayDate(newDate);
  };

  const handleYearChange = (year) => {
    const newDate = new Date(displayDate);
    newDate.setFullYear(parseInt(year));
    setDisplayDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayDate(newDate);
  };

  // Диапазон годов: от 100 лет назад до +10 лет вперёд
  const years = [];
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const endYear = currentYear + 10;   // <-- теперь есть будущие года
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }

  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const getDaysInMonth = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selected && selected.toDateString() === date.toDateString();
      const isPastDate = maxDate && date > maxDate;  // если maxDate не задан, все даты доступны
      
      days.push(
        <button
          key={i}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(date);
            setIsOpen(false);
          }}
          disabled={isPastDate}
          className={`
            h-8 w-8 rounded-lg text-sm transition-all duration-200 flex items-center justify-center
            ${isSelected 
              ? 'bg-[#f6a623] text-white shadow-sm' 
              : isToday 
                ? 'bg-[#f6a623]/10 text-[#f6a623] font-semibold border border-[#f6a623]/30' 
                : 'text-gray-700 hover:bg-[#f6a623]/10 hover:text-[#f6a623]'
            }
            ${isPastDate ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {i}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div>
        <div 
          className="h-10 w-full rounded-lg shadow-sm bg-white border border-gray-200 flex items-center hover:border-[#f6a623] transition-all duration-200 focus-within:ring-2 focus-within:ring-[#f6a623]/20 focus-within:border-[#f6a623] group cursor-pointer"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <Calendar className="ml-3 w-4 h-4 text-gray-400 group-hover:text-[#f6a623] transition-colors" />
          <input
            type="text"
            value={selected ? selected.toLocaleDateString('ru-RU') : ''}
            placeholder={placeholder}
            readOnly
            className="w-full px-2 bg-transparent border-0 outline-none focus:ring-0 focus:outline-none text-gray-900 text-sm placeholder:text-gray-400 cursor-pointer"
          />
          {isClearable && selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setIsOpen(false);
              }}
              className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {isOpen && !disabled && (
          <div 
            className={`absolute mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden ${popperClassName}`}
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "280px" }}
          >
            {/* Заголовок с выбором месяца и года */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#f6a623]/10 to-white border-b border-[#f6a623]/20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousMonth();
                }}
                className="p-1.5 hover:bg-[#f6a623]/20 rounded-lg transition-all duration-200 text-[#f6a623]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-3">
                <select
                  value={displayDate.getMonth()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleMonthChange(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 text-sm font-medium border border-[#f6a623]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent cursor-pointer bg-white hover:border-[#f6a623] transition-colors"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>

                <select
                  value={displayDate.getFullYear()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleYearChange(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 text-sm font-medium border border-[#f6a623]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent cursor-pointer bg-white hover:border-[#f6a623] transition-colors appearance-none pr-8 bg-no-repeat"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23f6a623' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.2em 1.2em'
                  }}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextMonth();
                }}
                className="p-1.5 hover:bg-[#f6a623]/20 rounded-lg transition-all duration-200 text-[#f6a623]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 px-4 pt-3">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-[#f6a623] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Дни месяца */}
            <div className="p-4 pt-2">
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}