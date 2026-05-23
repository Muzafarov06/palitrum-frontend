import React from "react";
import { Pencil, Trash, Clock, GraduationCap, BadgeCheck } from "lucide-react";

export default function PositionCard({ position, onEdit, onDelete }) {
  const isTeaching = position.isTeaching;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{position.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-gray-600">
            <Clock size={14} className="text-[#f6a623]" />
            <span className="text-sm">{position.hoursPerRate} ч/нед</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(position)}
            className="text-gray-400 hover:text-[#f6a623] p-1"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(position)}
            className="text-gray-400 hover:text-[#f6a623] p-1"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
            isTeaching
              ? "bg-[#f6a623]/10 text-[#e09515]"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {isTeaching ? (
            <GraduationCap size={12} />
          ) : (
            <BadgeCheck size={12} />
          )}
          {isTeaching ? "Учебная" : "Административная"}
        </span>
      </div>
    </div>
  );
}