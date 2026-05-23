import React from "react";
import { Pencil, Trash, Clock, GraduationCap, BadgeCheck } from "lucide-react";

export default function PositionTableRow({ position, onEdit, onDelete }) {
  const isTeaching = position.isTeaching;
  return (
    <tr className="hover:bg-gray-50 transition group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f6a623]/10 flex items-center justify-center">
            {isTeaching ? (
              <GraduationCap size={16} className="text-[#f6a623]" />
            ) : (
              <BadgeCheck size={16} className="text-[#f6a623]" />
            )}
          </div>
          <span className="font-medium text-gray-800">{position.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-gray-600">
          <Clock size={14} className="text-[#f6a623]" />
          <span className="font-medium">{position.hoursPerRate} ч/нед</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            isTeaching
              ? "bg-[#f6a623]/10 text-[#e09515]"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {isTeaching ? "Учебная" : "Административная"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(position)}
            className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg transition"
            title="Редактировать"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(position)}
            className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg transition"
            title="Удалить"
          >
            <Trash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}