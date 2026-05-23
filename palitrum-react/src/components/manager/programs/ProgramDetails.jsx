import React from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { formatYears } from "../../../utils/formatUtils";

const DEFAULT_PROGRAM_IMG = "/default-program.png";

export default function ProgramDetails({ program, onBack }) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-gray-500 hover:text-[#f6a623] transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Назад к программам
      </button>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="relative h-80 overflow-hidden">
          <img src={program.imageUrl || DEFAULT_PROGRAM_IMG} className="w-full h-full object-cover" alt={program.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 bg-[#f6a623] rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-lg flex items-center gap-1">
            <Clock size={14} /> {formatYears(program.durationYears) || "Программа"}
          </div>
        </div>
        <div className="p-7">
          <h1 className="text-3xl font-bold text-gray-800">{program.name}</h1>
          <div className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line">
            {program.description || "Описание отсутствует."}
          </div>
        </div>
      </div>
    </div>
  );
}