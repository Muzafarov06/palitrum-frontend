// src/pages/manager/ProgramsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Folder, Plus, Layers, BookOpen, Home, GraduationCap,
  Download, Upload, Menu, ChevronDown, ChevronUp, Pencil, Trash, FolderOpen as FolderOpenIcon
} from "lucide-react";

import API from "../../api/api";
import {
  fetchAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  fetchDepartments,
  addProgramToDepartment,
  createSubject,
  updateSubject,
  deleteSubject,
  fetchSubjectsByProgram,
  addSubjectToProgram,
  deleteSubjectFromProgram,
  fetchSubjectById,
  getFilesByEntity,
  updateProgramSubject,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { formatHours, formatYears } from "../../utils/formatUtils";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EditProgramSubjectModal from "../../components/manager/subject/EditProgramSubjectModal";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import ProgramFormModal from "../../components/manager/ProgramFormModal";
import SubjectModal from "../../components/manager/subject/SubjectModal";
import AddExistingSubjectModal from "../../components/manager/AddExistingSubjectModal";
import AddButton from "../../components/common/AddButton";
import RightPanel from "../../components/manager/programs/RightPanel";
import ProgramSidebar from "../../components/manager/programs/ProgramSidebar";
import DepartmentSelectorModal from "../../components/manager/programs/DepartmentSelectorModal";

const DEFAULT_PROGRAM_IMG = "/default-program.png";
const DEFAULT_SUBJECT_IMG = "/default-program.png";

export default function ProgramsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN"].includes(r));

  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [openProgramNodes, setOpenProgramNodes] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [filterText, setFilterText] = useState("");
  const [totalSubjectsCount, setTotalSubjectsCount] = useState(0);
  const [showMobileTree, setShowMobileTree] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editConnectionModal, setEditConnectionModal] = useState({ open: false, connection: null });
  const [programModal, setProgramModal] = useState({ open: false, editing: null });
  const [subjectModal, setSubjectModal] = useState({ open: false, editing: null });
  const [addExistingModal, setAddExistingModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, programId: null });
  const [hoveredProgramId, setHoveredProgramId] = useState(null);
  const [hoveredSubjectId, setHoveredSubjectId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowMobileTree(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { loadPrograms(); }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPrograms();
      setPrograms(data || []);
      setOpenProgramNodes([]);
      setSubjectsMap({});
      setTotalSubjectsCount(0);
    } catch (error) {
      toast.error("Не удалось загрузить программы");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsForProgram = async (programId) => {
    if (subjectsMap[programId]) return;
    try {
      const programSubjects = await fetchSubjectsByProgram(programId);
      const enriched = await Promise.all(
        programSubjects.map(async (ps) => {
          let fullSubject;
          try {
            fullSubject = await fetchSubjectById(ps.subjectId);
            const files = await getFilesByEntity("SUBJECT", fullSubject.id);
            fullSubject.imageUrl = files?.[0]?.fileUrl || DEFAULT_SUBJECT_IMG;
          } catch (err) {
            fullSubject = {
              id: ps.subjectId,
              name: ps.subjectName || "Неизвестный предмет",
              code: "",
              description: "",
              standardHoursPerWeek: 0,
              imageUrl: DEFAULT_SUBJECT_IMG
            };
          }
          return {
            ...fullSubject,
            connectionId: ps.id,
            programAcademicYear: ps.academicYear,
            hoursPerWeekForProgram: ps.hoursPerWeekForProgram
          };
        })
      );
      setSubjectsMap(prev => ({ ...prev, [programId]: enriched }));
      const allSubjects = Object.values({ ...subjectsMap, [programId]: enriched }).flat();
      setTotalSubjectsCount(allSubjects.length);
    } catch (error) {
      toast.error("Не удалось загрузить предметы программы");
    }
  };

  const toggleProgramNode = (id) => {
    if (!openProgramNodes.includes(id)) loadSubjectsForProgram(id);
    setOpenProgramNodes(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const openAddProgram = () => {
    if (!isAdmin) return;
    setProgramModal({ open: true, editing: null });
  };

  const openEditProgram = (program) => {
    if (!isAdmin) return;
    setProgramModal({ open: true, editing: program });
  };

  const submitProgram = async (data) => {
    if (!isAdmin) throw new Error("Недостаточно прав");
    try {
      let result;
      if (programModal.editing) {
        result = await updateProgram(programModal.editing.id, data);
        toast.success("Программа обновлена");
      } else {
        result = await createProgram(data);
        toast.success("Программа добавлена");
      }
      await loadPrograms();
      if (selectedProgram?.id === result?.id) setSelectedProgram(result);
      return result;
    } catch (error) {
      toast.error("Ошибка сохранения программы");
      throw error;
    }
  };

  const confirmDeleteProgram = (program) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Удалить программу полностью",
      message: `Вы уверены, что хотите удалить программу "${program.name}" полностью? Все связи с предметами и отделениями будут потеряны.`,
      onConfirm: async () => {
        try {
          await deleteProgram(program.id);
          toast.success("Программа удалена");
          if (selectedProgram?.id === program.id) {
            setSelectedProgram(null);
            setSelectedSubject(null);
          }
          await loadPrograms();
        } catch (error) {
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openAddSubject = () => {
    if (!isAdmin || !selectedProgram) {
      toast.warning("Сначала выберите программу");
      return;
    }
    setSubjectModal({ open: true, editing: null });
  };

  const openEditSubject = (subject) => {
    if (!isAdmin) return;
    setSubjectModal({ open: true, editing: subject });
  };

  const submitSubject = async (data) => {
    if (!isAdmin) throw new Error("Недостаточно прав");
    try {
      let result;
      if (subjectModal.editing) {
        result = await updateSubject(subjectModal.editing.id, data);
        toast.success("Предмет обновлён");
      } else {
        result = await createSubject(data);
        if (selectedProgram) {
          await addSubjectToProgram(selectedProgram.id, result.id, 1, 0);
          toast.success(`Предмет "${result.name}" добавлен в программу`);
        } else {
          toast.success("Предмет создан");
        }
      }
      if (selectedProgram) await loadSubjectsForProgram(selectedProgram.id);
      return result;
    } catch (error) {
      toast.error("Ошибка сохранения предмета");
      throw error;
    }
  };

  const confirmRemoveSubjectFromProgram = (subject, programId) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Убрать предмет из программы",
      message: `Вы уверены, что хотите удалить предмет "${subject.name}" из программы "${selectedProgram?.name}"?`,
      onConfirm: async () => {
        try {
          await deleteSubjectFromProgram(programId, subject.id, subject.programAcademicYear || 1);
          toast.success("Предмет удалён из программы");
          if (selectedSubject?.id === subject.id) setSelectedSubject(null);
          await loadSubjectsForProgram(programId);
        } catch (error) {
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const confirmDeleteSubject = (subject) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Удалить предмет полностью",
      message: `Вы уверены, что хотите удалить предмет "${subject.name}" полностью?`,
      onConfirm: async () => {
        try {
          await deleteSubject(subject.id);
          toast.success("Предмет удалён");
          if (selectedSubject?.id === subject.id) setSelectedSubject(null);
          if (selectedProgram) await loadSubjectsForProgram(selectedProgram.id);
        } catch (error) {
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openAddExistingSubject = () => {
    if (!isAdmin || !selectedProgram) {
      toast.warning("Сначала выберите программу");
      return;
    }
    setAddExistingModal(true);
  };

  const addExistingSubject = async (subjectId, academicYear, hoursPerWeek) => {
    if (!isAdmin || !selectedProgram) return;
    try {
      await addSubjectToProgram(selectedProgram.id, subjectId, academicYear, hoursPerWeek);
      await loadSubjectsForProgram(selectedProgram.id);
      toast.success("Предмет добавлен в программу");
    } catch (error) {
      toast.error("Не удалось добавить предмет");
    }
  };

  const openEditConnectionModal = (subject) => {
    setEditConnectionModal({ open: true, connection: subject });
  };

  const handleUpdateConnection = async (connectionId, academicYear, hoursPerWeek) => {
    try {
      await updateProgramSubject(connectionId, academicYear, hoursPerWeek);
      toast.success("Данные обновлены");
      if (selectedProgram) await loadSubjectsForProgram(selectedProgram.id);
    } catch (err) {
      toast.error("Ошибка обновления");
      throw err;
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт завершён');
      await loadPrograms();
      if (selectedProgram) await loadSubjectsForProgram(selectedProgram.id);
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const handleAddToDepartment = async (program) => {
    setSelectedProgram(program);
    try {
      const depts = await fetchDepartments();
      setDepartments(depts || []);
      setDepartmentModalOpen(true);
    } catch {
      toast.error("Не удалось загрузить отделения");
    }
  };

  const handleSelectDepartment = async (departmentId) => {
    try {
      await addProgramToDepartment(selectedProgram.id, departmentId, false, "");
      toast.success("Программа добавлена в отделение");
      setDepartmentModalOpen(false);
    } catch {
      toast.error("Ошибка при добавлении в отделение");
    }
  };

  // При выборе программы сразу загружаем её предметы
  const handleSelectProgram = (p) => {
    setSelectedProgram(p);
    setSelectedSubject(null);
    if (p && !subjectsMap[p.id]) {
      loadSubjectsForProgram(p.id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-sm max-w-full overflow-hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto pl-10 md:pl-0">
          <div className="p-2 bg-orange-500/10 rounded-xl shrink-0">
            <Layers className="text-[#f6a623]" size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Управление программами и предметами
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1 shrink-0"><Folder size={12} /> {programs.length} программ</span>
              <span className="flex items-center gap-1 shrink-0"><BookOpen size={12} /> {totalSubjectsCount} предметов</span>
            </div>
          </div>
        </div>

        {/* Правая часть: кнопки + поиск */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowMobileTree(!showMobileTree)}
              className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
            >
              <span>Программы</span>
              {showMobileTree ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 border border-[#f6a623] text-[#f6a623] hover:bg-[#f6a623] hover:text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Шаблон</span>
                  <span className="sm:hidden">Шаблон</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Импорт</span>
                  <span className="sm:hidden">Импорт</span>
                </button>
              </>
            )}
            <AddButton onClick={openAddProgram} label="Новая программа" shortLabel="Программа" />
          </div>

          <div className="flex-1 min-w-[150px] sm:w-40 lg:w-72 max-w-full w-full sm:w-auto">
            <CustomSearchInput
              value={filterText}
              onChange={setFilterText}
              placeholder="Поиск..."
              setPage={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Основная часть */}
      <div className="flex flex-1 overflow-hidden">
        {/* Десктопное дерево */}
        <div className="hidden sm:block">
          <ProgramSidebar
            programs={programs}
            selectedProgram={selectedProgram}
            onSelectProgram={handleSelectProgram}
            onEditProgram={openEditProgram}
            onDeleteProgram={confirmDeleteProgram}
            onAddToDepartment={handleAddToDepartment}
            onContextMenu={(e, p) => {
              if (!isAdmin) return;
              e.preventDefault();
              setContextMenu({ visible: true, x: e.pageX, y: e.pageY, programId: p.id });
            }}
            programSubjectsMap={subjectsMap}
            openProgramNodes={openProgramNodes}
            toggleProgramNode={toggleProgramNode}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            isAdmin={isAdmin}
          />
        </div>

        {/* Мобильное дерево (оверлей) */}
        {showMobileTree && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileTree(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">Программы</h2>
                <button onClick={() => setShowMobileTree(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]" />
                </div>
              ) : (
                <ProgramSidebar
                  programs={programs}
                  selectedProgram={selectedProgram}
                  onSelectProgram={(p) => { handleSelectProgram(p); setShowMobileTree(false); }}
                  onEditProgram={openEditProgram}
                  onDeleteProgram={confirmDeleteProgram}
                  onAddToDepartment={handleAddToDepartment}
                  onContextMenu={(e, p) => {
                    if (!isAdmin) return;
                    e.preventDefault();
                    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, programId: p.id });
                  }}
                  programSubjectsMap={subjectsMap}
                  openProgramNodes={openProgramNodes}
                  toggleProgramNode={toggleProgramNode}
                  selectedSubject={selectedSubject}
                  onSelectSubject={s => { setSelectedSubject(s); setShowMobileTree(false); }}
                  isAdmin={isAdmin}
                />
              )}
            </div>
          </div>
        )}

        {/* Правая панель */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6a623]" />
              </div>
            ) : (
              <RightPanel
                selectedSubject={selectedSubject}
                selectedProgram={selectedProgram}
                programs={programs}
                subjectsMap={subjectsMap}
                isAdmin={isAdmin}
                onSelectSubject={setSelectedSubject}
                onSelectProgram={handleSelectProgram}
                onBackToPrograms={() => { setSelectedProgram(null); setSelectedSubject(null); }}
                onAddSubject={openAddSubject}
                onAddExistingSubject={openAddExistingSubject}
                onEditSubject={openEditSubject}
                onEditConnection={openEditConnectionModal}
                onRemoveSubject={confirmRemoveSubjectFromProgram}
                filterText={filterText}
              />
            )}
          </div>
        </main>
      </div>

      {/* Контекстное меню */}
      {isAdmin && contextMenu.visible && (
        <div
          className="fixed z-[9999] bg-white shadow-xl rounded-xl border w-64 py-2"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => { openEditProgram(programs.find(p => p.id === contextMenu.programId)); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Pencil size={16} className="text-[#f6a623]" /> Редактировать программу
          </button>
          <button onClick={() => { confirmDeleteProgram(programs.find(p => p.id === contextMenu.programId)); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Trash size={16} className="text-[#f6a623]" /> Удалить программу
          </button>
          <div className="border-t my-1" />
          <button onClick={() => { setSelectedProgram(programs.find(p => p.id === contextMenu.programId)); openAddSubject(); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Plus size={16} className="text-[#f6a623]" /> Создать предмет
          </button>
          <button onClick={() => { setSelectedProgram(programs.find(p => p.id === contextMenu.programId)); openAddExistingSubject(); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <FolderOpenIcon size={16} className="text-[#f6a623]" /> Добавить существующий предмет
          </button>
        </div>
      )}

      {/* Модалки */}
      <ProgramFormModal isOpen={programModal.open} onClose={() => setProgramModal({ open: false, editing: null })} onSubmit={submitProgram} initialData={programModal.editing} />
      <EditProgramSubjectModal isOpen={editConnectionModal.open} onClose={() => setEditConnectionModal({ open: false, connection: null })} onSubmit={handleUpdateConnection} connection={editConnectionModal.connection} programDuration={selectedProgram?.durationYears} />
      <SubjectModal isOpen={subjectModal.open} onClose={() => setSubjectModal({ open: false, editing: null })} onSubmit={submitSubject} initialData={subjectModal.editing} />
      <AddExistingSubjectModal isOpen={addExistingModal} onClose={() => setAddExistingModal(false)} onAdd={addExistingSubject} currentProgramId={selectedProgram?.id} excludedSubjectIds={selectedProgram ? (subjectsMap[selectedProgram.id]?.map(s => s.id) || []) : []} programDurationYears={selectedProgram?.durationYears || 4} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} />
      <DepartmentSelectorModal isOpen={departmentModalOpen} onClose={() => setDepartmentModalOpen(false)} departments={departments} onSelectDepartment={handleSelectDepartment} />
      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #f6a623; border-radius: 10px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}