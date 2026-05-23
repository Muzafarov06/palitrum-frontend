// components/common/AddButton.jsx
import React from "react";
import { Plus } from "lucide-react";

export default function AddButton({ onClick, label = "Добавить", shortLabel = "Добавить", iconSize = 16, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition shrink-0 ${className}`}
    >
      <Plus size={iconSize} />
      <span className="hidden sm:inline">{label}</span>
      <span className="inline sm:hidden">{shortLabel}</span>
    </button>
  );
}