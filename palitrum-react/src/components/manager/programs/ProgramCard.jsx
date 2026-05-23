import React from "react";
import { Clock } from "lucide-react";
import { formatYears } from "../../../utils/formatUtils";

const DEFAULT_PROGRAM_IMG = "/default-program.png";

export default function ProgramCard({ program, onClick }) {
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
      onClick={() => onClick(program)}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={program.imageUrl || DEFAULT_PROGRAM_IMG}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={program.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        {program.durationYears && (
          <div className="absolute bottom-3 left-3 bg-[#f6a623] backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Clock size={12} /> {formatYears(program.durationYears)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{program.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{program.description || "Описание отсутствует"}</p>
      </div>
    </div>
  );
}