import React from "react";
import { BookOpen, Pencil, Trash, FolderPlus, Home, ChevronRight, Clock } from "lucide-react";
import { formatHours } from "../../../utils/formatUtils";

export default function ProgramSidebar({
  programs,
  selectedProgram,
  onSelectProgram,
  onEditProgram,
  onDeleteProgram,
  onAddToDepartment,
  onContextMenu,
  programSubjectsMap,
  openProgramNodes,
  toggleProgramNode,
  selectedSubject,
  onSelectSubject,
  isAdmin
}) {
  const DEFAULT_SUBJECT_IMG = "/default-subject.png";
  return (
    <aside className="w-80 bg-white/30 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto flex-shrink-0 p-4 shadow-inner">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen size={20} className="text-[#f6a623]" /> Программы
        </h2>
        <button
          onClick={() => onSelectProgram(null)}
          className="p-1.5 rounded-lg text-[#f6a623] hover:bg-orange-50 transition-colors"
          title="Сбросить выбор"
        >
          <Home size={18} />
        </button>
      </div>
      <div className="space-y-1.5">
        {programs.map(prog => {
          const subjects = programSubjectsMap[prog.id] || [];
          const hasSubjects = subjects.length > 0;
          const isOpen = openProgramNodes.includes(prog.id);
          const isActive = selectedProgram?.id === prog.id && !selectedSubject;
          return (
            <div key={prog.id} className="relative">
              <div
                className={`group flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-orange-50 to-orange-100 text-[#f6a623] shadow-sm ring-1 ring-[#f6a623]/30"
                    : "hover:bg-gray-50 hover:shadow-sm text-gray-700"
                }`}
                onClick={() => onSelectProgram(prog)}
                onContextMenu={(e) => onContextMenu && onContextMenu(e, prog)}
              >
                <div className="flex items-center flex-1 min-w-0 gap-2">
                  <BookOpen size={16} className="text-[#f6a623] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{prog.name}</div>
                    {prog.durationYears && <div className="text-xs text-gray-500">{prog.durationYears} лет</div>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditProgram(prog); }}
                      className="p-1 rounded-lg hover:bg-orange-100 text-gray-600 hover:text-[#f6a623]"
                      title="Редактировать"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteProgram(prog); }}
                      className="p-1 rounded-lg hover:bg-orange-100 text-gray-600 hover:text-[#f6a623]"
                      title="Удалить"
                    >
                      <Trash size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddToDepartment(prog); }}
                      className="p-1 rounded-lg hover:bg-orange-100 text-gray-600 hover:text-[#f6a623]"
                      title="В отделение"
                    >
                      <FolderPlus size={14} />
                    </button>
                  </div>
                )}
                {hasSubjects && (
                  <ChevronRight
                    size={14}
                    className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleProgramNode(prog.id); }}
                  />
                )}
              </div>
              {isOpen && (
                <div className="ml-6 pl-2 border-l border-gray-200 mt-1 space-y-1 animate-slideDown">
                  {subjects.map(subj => (
                    <div
                      key={subj.id}
                      className={`group flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedSubject?.id === subj.id
                          ? "bg-orange-50 text-[#f6a623] font-medium shadow-sm"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                      onClick={(e) => { e.stopPropagation(); onSelectSubject(subj); }}
                    >
                      <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                          src={subj.imageUrl || DEFAULT_SUBJECT_IMG}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{subj.name}</div>
                        {subj.standardHoursPerWeek > 0 && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {formatHours(subj.standardHoursPerWeek)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {programs.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">Нет программ</div>}
      </div>
      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </aside>
  );
}