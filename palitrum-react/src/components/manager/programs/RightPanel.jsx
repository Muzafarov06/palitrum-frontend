import React from "react";
import { ChevronRight, Clock, BookOpen, GraduationCap, Sparkles, Plus, FolderOpen } from "lucide-react";
import SubjectCard from "../subject/SubjectCard";
import ProgramCard from "./ProgramCard";
import { formatYears, formatHours } from "../../../utils/formatUtils";

const DEFAULT_PROGRAM_IMG = "/default-program.png";
const DEFAULT_SUBJECT_IMG = "/default-program.png";

export default function RightPanel({
  selectedSubject,
  selectedProgram,
  programs,
  subjectsMap,
  isAdmin,
  onSelectSubject,
  onSelectProgram,
  onBackToPrograms,
  onAddSubject,
  onAddExistingSubject,
  onEditSubject,
  onEditConnection,
  onRemoveSubject,
  filterText,
}) {
  if (selectedSubject) {
    const subject = selectedSubject;
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="relative h-80 overflow-hidden">
            <img
              src={subject.imageUrl || DEFAULT_SUBJECT_IMG}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={subject.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="bg-[#f6a623] backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                {subject.code || "Предмет"}
              </div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">{subject.name}</h2>
            {subject.standardHoursPerWeek > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <Clock size={14} className="text-[#f6a623]" /> {formatHours(subject.standardHoursPerWeek)} в неделю
              </div>
            )}
            <p className="mt-3 text-gray-600 leading-relaxed">
              {subject.description || "Нет описания"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedProgram) {
    const subjects = subjectsMap[selectedProgram.id] || [];
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span className="cursor-pointer hover:text-[#f6a623]" onClick={onBackToPrograms}>
            Главная
          </span>
          <ChevronRight size={14} />
          <span className="text-[#f6a623] font-medium">{selectedProgram.name}</span>
        </div>
        <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap size={32} className="text-[#f6a623]" />
            <h1 className="text-3xl font-bold text-gray-800">{selectedProgram.name}</h1>
          </div>
          {selectedProgram.description && (
            <p className="text-gray-500 mt-1">{selectedProgram.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50/80 px-3 py-1 rounded-full">
              <Clock size={14} />
              <span>{formatYears(selectedProgram.durationYears)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50/80 px-3 py-1 rounded-full">
              <BookOpen size={14} />
              <span>Предметов: {subjects.length}</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3 sm:mb-0">Предметы программы</h2>
            {isAdmin && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
                <button
                    onClick={onAddSubject}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-2 text-sm font-medium transition"
                >
                    <Plus size={18} className="shrink-0" />
                    <span className="whitespace-nowrap">Новый предмет</span>
                </button>
                <button
                    onClick={onAddExistingSubject}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-2 text-sm font-medium transition"
                >
                    <FolderOpen size={18} className="shrink-0" />
                    <span className="whitespace-nowrap">Существующий</span>
                </button>
                </div>
            )}
        </div>
        {subjects.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-400 border border-dashed">
            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
            <p>В этой программе пока нет предметов</p>
            {isAdmin && (
              <button onClick={onAddSubject} className="mt-2 text-[#f6a623] hover:underline">
                Создать первый предмет
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects
              .filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()))
              .map(subj => (
                <SubjectCard
                  key={subj.id}
                  subject={subj}
                  onSelect={onSelectSubject}
                  onEdit={onEditSubject}
                  onEditConnection={onEditConnection}
                  onRemove={() => onRemoveSubject(subj, selectedProgram.id)}
                  isAdmin={isAdmin}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  // Общий список программ (главная страница)
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <GraduationCap size={48} className="mx-auto text-[#f6a623]/60 mb-3" />
        <h1 className="text-3xl font-bold text-gray-800">Все программы</h1>
        <p className="text-gray-500 mt-2">
          Выберите программу из списка слева, чтобы увидеть её предметы и детали.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs
          .filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()))
          .map(prog => (
            <ProgramCard key={prog.id} program={prog} onClick={onSelectProgram} />
          ))}
      </div>
    </div>
  );
}