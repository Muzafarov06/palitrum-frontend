import React from "react";
import { MapPin, Layers, BookOpen, GraduationCap, Sparkles, Clock, ChevronRight, Building2 } from "lucide-react";
import DepartmentCard from "./DepartmentCard";
import ProgramCard from "./ProgramCard";

const DEFAULT_DEPARTMENT_IMG = "/default-department.png";
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

export default function RightPanel({
  selectedProgram,
  selectedDepartment,
  departments,
  programsMap,
  childDepartments,
  rootDepartments,
  filterText,
  onSelectDepartment,
  onSelectProgram,
  onReset,
}) {
  // Выбранная программа
  if (selectedProgram) {
    const prog = Object.values(programsMap).flat().find(p => p.id === selectedProgram);
    if (!prog) return null;
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="group bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="relative h-80 overflow-hidden">
            <img
              src={prog.imageUrl || DEFAULT_PROGRAM_IMG}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={prog.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4">
              <div className="bg-[#f6a623] backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                {prog.durationYears ? formatYears(prog.durationYears) : "Программа"}
              </div>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800">{prog.name}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {prog.description || "Нет описания"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Выбранное отделение
  if (selectedDepartment) {
    const dept = departments.find(d => d.id === selectedDepartment);
    const deptPrograms = programsMap[selectedDepartment] || [];
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <span className="cursor-pointer hover:text-[#f6a623]" onClick={onReset}>Главная</span>
          {dept?.parentId && departments.find(d => d.id === dept.parentId) && (
            <>
              <ChevronRight size={14} />
              <span className="cursor-pointer hover:text-[#f6a623]" onClick={() => onSelectDepartment(dept.parentId)}>
                {departments.find(d => d.id === dept.parentId)?.name}
              </span>
            </>
          )}
          {dept && (
            <>
              <ChevronRight size={14} />
              <span className="text-[#f6a623] font-medium">{dept.name}</span>
            </>
          )}
        </div>

        {dept && (
          <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="text-[#f6a623]" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">{dept.name}</h1>
            </div>
            {dept.description && <p className="text-gray-500 mt-1">{dept.description}</p>}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50/80 px-3 py-1 rounded-full">
                <MapPin size={14} />
                <span>{dept.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50/80 px-3 py-1 rounded-full">
                <Layers size={14} />
                <span>Дочерних отделений: {childDepartments.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50/80 px-3 py-1 rounded-full">
                <BookOpen size={14} />
                <span>Программ: {deptPrograms.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Дочерние отделения */}
        {childDepartments.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={22} className="text-[#f6a623]" />
              <h2 className="text-xl font-semibold text-gray-700">Дочерние отделения</h2>
              <span className="bg-orange-100 text-[#f6a623] text-xs px-2 py-0.5 rounded-full">{childDepartments.length}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {childDepartments
                .filter(d => d.name.toLowerCase().includes(filterText.toLowerCase()))
                .map(d => (
                  <DepartmentCard key={d.id} dept={d} onClick={() => onSelectDepartment(d.id)} />
                ))}
            </div>
          </div>
        )}

        {/* Программы отделения */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={22} className="text-[#f6a623]" />
            <h2 className="text-xl font-semibold text-gray-700">Образовательные программы</h2>
            <span className="bg-orange-100 text-[#f6a623] text-xs px-2 py-0.5 rounded-full">{deptPrograms.length}</span>
          </div>
          {deptPrograms.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-400 border border-dashed">
              <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
              <p>В этом отделении пока нет программ</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {deptPrograms
                .filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()))
                .map(prog => (
                  <ProgramCard key={prog.id} prog={prog} onClick={() => onSelectProgram(prog.id)} />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Главная страница
  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <Building2 size={48} className="mx-auto text-[#f6a623]/60 mb-3" />
        <h1 className="text-3xl font-bold text-gray-800">Все отделения</h1>
        <p className="text-gray-500 mt-2">Выберите отделение, чтобы увидеть его программы и подразделения.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {rootDepartments
          .filter(d => d.name.toLowerCase().includes(filterText.toLowerCase()))
          .map(dept => (
            <DepartmentCard key={dept.id} dept={dept} onClick={() => onSelectDepartment(dept.id)} />
          ))}
      </div>
    </div>
  );
}