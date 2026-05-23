import React from "react";
import { Building2 } from "lucide-react";

const DEFAULT_DEPARTMENT_IMG = "/default-department.png";

export default function DepartmentCard({ dept, onClick }) {
  return (
    <div
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 flex-1 min-w-[200px]"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={dept.imageUrl || DEFAULT_DEPARTMENT_IMG}
          alt={dept.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg truncate">{dept.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
          {dept.description || "Нет описания"}
        </p>
      </div>
    </div>
  );
}