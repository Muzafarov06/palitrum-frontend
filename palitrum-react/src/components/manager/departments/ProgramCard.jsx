import React from "react";
import { Clock, BookOpen } from "lucide-react";

const DEFAULT_PROGRAM_IMG = "/default-program.png";

function formatYears(duration) {
  if (!duration) return "";
  const lastDigit = duration % 10;
  const lastTwoDigits = duration % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${duration} лет`;
  if (lastDigit === 1) return `${duration} год`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${duration} года`;
  return `${duration} лет`;
}

export default function ProgramCard({ prog, onClick }) {
  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 flex-1 min-w-[200px]"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={prog.imageUrl || DEFAULT_PROGRAM_IMG}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          alt={prog.name}
        />
        {prog.durationYears && (
          <div className="absolute bottom-2 left-2 bg-[#f6a623] backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} /> {formatYears(prog.durationYears)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg truncate">{prog.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
          {prog.description || "Нет описания"}
        </p>
      </div>
    </div>
  );
}