import React from "react";
import { Clock, Pencil, MinusIcon, Settings } from "lucide-react";
import { formatHours } from "../../../utils/formatUtils";

const DEFAULT_SUBJECT_IMG = "/default-program.png";

export default function SubjectCard({ subject, onSelect, onEdit, onRemove, onEditConnection, isAdmin }) {
  // Определяем отображаемое количество часов
  const getDisplayHours = () => {
    if (subject.hoursPerWeekForProgram && subject.hoursPerWeekForProgram > 0) {
      return subject.hoursPerWeekForProgram;
    }
    if (subject.standardHoursPerWeek && subject.standardHoursPerWeek > 0) {
      return subject.standardHoursPerWeek;
    }
    return null;
  };

  const displayHours = getDisplayHours();

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
      onClick={() => onSelect(subject)}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={subject.imageUrl || DEFAULT_SUBJECT_IMG}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={subject.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        {subject.code && (
          <div className="absolute top-3 left-3 bg-[#f6a623]/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-md">
            {subject.code}
          </div>
        )}
        {displayHours !== null && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Clock size={12} /> {formatHours(displayHours)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{subject.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
          {subject.description || "Нет описания"}
        </p>
        {/* Отображение года и часов в программе */}
        <div className="mt-2 text-xs text-gray-400 space-y-0.5">
          <div>Год: {subject.programAcademicYear}</div>
          <div>Часов: {displayHours !== null ? formatHours(displayHours) : "не указаны"}</div>
        </div>
        {isAdmin && (
          <div className="mt-3 flex justify-end gap-2 border-t pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(subject);
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#f6a623] transition-colors"
              title="Редактировать предмет"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditConnection(subject);
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#f6a623] transition-colors"
              title="Настроить год и часы в программе"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(subject);
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#f6a623] transition-colors"
              title="Убрать из программы"
            >
              <MinusIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}