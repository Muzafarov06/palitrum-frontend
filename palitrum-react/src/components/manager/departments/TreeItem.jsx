import React from "react";
import { Folder, FolderOpen, ChevronRight } from "lucide-react";

export default function TreeItem({
  name,
  isOpen,
  isActive,
  onClick,
  onToggle,
  children,
  level = 0,
}) {
  return (
    <div className="relative">
      <div
        className={`group flex items-center cursor-pointer py-2 px-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-orange-50 to-orange-100 text-[#f6a623] shadow-sm ring-1 ring-[#f6a623]/20"
            : "hover:bg-gray-50 hover:shadow-sm text-gray-700"
        }`}
        style={{ paddingLeft: level * 20 }}
        onClick={onClick}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onToggle) onToggle();
          }}
          className="mr-2 flex-shrink-0 text-current transition-transform duration-200 group-hover:scale-110"
        >
          {children ? (
            isOpen ? <FolderOpen size={18} /> : <Folder size={18} />
          ) : (
            <Folder size={18} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{name}</div>
        </div>
        {children && (
          <ChevronRight
            size={14}
            className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          />
        )}
      </div>
      {isOpen && children && (
        <div className="ml-4 pl-2 border-l border-gray-200 animate-slideDown">
          {children}
        </div>
      )}
    </div>
  );
}