// src/pages/manager/DepartmentsPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Folder, Plus, Layers, BookOpen, Home, Building2, Sparkles, Clock,
  MapPin, ChevronRight, Pencil, Trash, MinusIcon, GraduationCap,
  Menu, ChevronDown, ChevronUp, Download, Upload
} from "lucide-react";

import API from "../../api/api";
import {
  fetchDepartmentsAdmin,
  fetchProgramsByDepartmentAdmin,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  deleteProgramFromDepartment,
  addProgramToDepartment,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddButton from "../../components/common/AddButton";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import DepartmentFormModal from "../../components/manager/DepartmentFormModal";
import ProgramFormModal from "../../components/manager/ProgramFormModal";
import AddExistingProgramModal from "../../components/manager/AddExistingProgramModal";
import RightPanel from "../../components/manager/departments/RightPanel";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [openNodes, setOpenNodes] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [filterText, setFilterText] = useState("");
  const [totalProgramsCount, setTotalProgramsCount] = useState(0);
  const [showMobileTree, setShowMobileTree] = useState(false);
  const [hoveredDeptId, setHoveredDeptId] = useState(null);
  const [hoveredProgId, setHoveredProgId] = useState(null);

  const [deptFormModal, setDeptFormModal] = useState({ open: false, editing: null });
  const [programFormModal, setProgramFormModal] = useState({ open: false, editing: null });
  const [addExistingModal, setAddExistingModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, title: "", message: "", onConfirm: null
  });
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, deptId: null });

  const fileInputRef = useRef(null);

  // Закрытие контекстного меню
  useEffect(() => {
    const closeMenu = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // Закрывать мобильное дерево при смене разрешения
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setShowMobileTree(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await fetchDepartmentsAdmin();
      setDepartments(data || []);
      setOpenNodes([]);
      setProgramsMap({});
      setTotalProgramsCount(0);
    } catch (error) {
      console.error("Ошибка загрузки отделений:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgramsForNode = async (deptId) => {
    if (programsMap[deptId]) return;
    try {
      const data = await fetchProgramsByDepartmentAdmin(deptId);
      setProgramsMap(prev => ({ ...prev, [deptId]: data || [] }));
      const allPrograms = Object.values({ ...programsMap, [deptId]: data || [] }).flat();
      setTotalProgramsCount(allPrograms.length);
    } catch (error) {
      console.error("Ошибка загрузки программ:", error);
    }
  };

  const toggleNode = async (id) => {
    if (!openNodes.includes(id)) await loadProgramsForNode(id);
    setOpenNodes(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const getPath = (deptId) => {
    let path = [];
    let current = departments.find(d => d.id === deptId);
    while (current) {
      path.unshift(current.name);
      current = departments.find(d => d.id === current.parentId);
    }
    return path.join(" → ");
  };

  const formatYears = (duration) => {
    if (!duration) return "";
    const lastDigit = duration % 10;
    const lastTwoDigits = duration % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${duration} лет`;
    if (lastDigit === 1) return `${duration} год`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${duration} года`;
    return `${duration} лет`;
  };

  const getLevel = (deptId) => {
    let level = 0;
    let current = departments.find(d => d.id === deptId);
    while (current && current.parentId !== null) {
      level++;
      current = departments.find(d => d.id === current.parentId);
    }
    return level;
  };

  // Обработчики
  const openAddDepartment = (parentId = null) => {
    if (!isAdmin) return;
    setSelectedDepartment(parentId);
    setDeptFormModal({ open: true, editing: null });
  };

  const openEditDepartment = (deptId) => {
    if (!isAdmin) return;
    const dept = departments.find(d => d.id === deptId);
    setDeptFormModal({ open: true, editing: dept });
  };

  const submitDepartment = async (data) => {
    if (!isAdmin) throw new Error("Недостаточно прав");
    const parentId = selectedDepartment || null;
    if (parentId && getLevel(parentId) >= 3) {
      toast.warning("Нельзя создавать отделение глубже 3 уровня");
      throw new Error("Глубина вложенности превышена");
    }
    try {
      let savedDepartment;
      if (deptFormModal.editing) {
        savedDepartment = await updateDepartment(deptFormModal.editing.id, { ...data, parentId: deptFormModal.editing.parentId });
        toast.success("Отделение обновлено");
      } else {
        savedDepartment = await createDepartment({ ...data, parentId });
        toast.success("Отделение добавлено");
      }
      await loadDepartments();
      return savedDepartment;   // ✅ ВАЖНО: возвращаем объект
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Ошибка сохранения отделения");
      throw error;
    }
  };

  const openAddProgram = (deptId) => {
    if (!isAdmin) return;
    setSelectedDepartment(deptId);
    setProgramFormModal({ open: true, editing: null });
  };

  const openEditProgram = (prog) => {
    if (!isAdmin) return;
    setProgramFormModal({ open: true, editing: prog });
  };

  const submitProgram = async (data) => {
    if (!isAdmin) throw new Error("Недостаточно прав");
    try {
      let result;
      if (programFormModal.editing) {
        result = await updateProgram(programFormModal.editing.id, data);
        toast.success("Программа обновлена");
      } else {
        result = await createProgram(data);
        if (selectedDepartment) {
          await addProgramToDepartment(result.id, selectedDepartment, true, "");
          setProgramsMap(prev => ({
            ...prev,
            [selectedDepartment]: [...(prev[selectedDepartment] || []), result]
          }));
        }
        toast.success("Программа добавлена");
      }
      if (selectedDepartment) {
        const updated = await fetchProgramsByDepartmentAdmin(selectedDepartment);
        setProgramsMap(prev => ({ ...prev, [selectedDepartment]: updated }));
        const allPrograms = Object.values({ ...programsMap, [selectedDepartment]: updated }).flat();
        setTotalProgramsCount(allPrograms.length);
      }
      return result;
    } catch (error) {
      console.error(error);
      toast.error("Ошибка сохранения программы");
      throw error;
    }
  };

  const openAddExistingProgram = () => {
    if (!isAdmin) return;
    setAddExistingModal(true);
  };

  const addExistingProgram = async (programId) => {
    if (!isAdmin || !selectedDepartment) return;
    try {
      const prog = (await fetchAllPrograms()).find(p => p.id === parseInt(programId));
      if (!prog) throw new Error("Программа не найдена");
      await addProgramToDepartment(prog.id, selectedDepartment, true, "");
      setProgramsMap(prev => ({
        ...prev,
        [selectedDepartment]: [...(prev[selectedDepartment] || []), prog]
      }));
      const allPrograms = Object.values({ ...programsMap, [selectedDepartment]: [...(programsMap[selectedDepartment] || []), prog] }).flat();
      setTotalProgramsCount(allPrograms.length);
      toast.success(`Программа "${prog.name}" добавлена`);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось добавить программу");
    }
  };

  const confirmRemoveProgram = (prog, deptId) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Удалить программу из отделения",
      message: `Вы уверены, что хотите удалить программу "${prog.name}" из этого отделения? Программа останется в базе.`,
      onConfirm: async () => {
        try {
          await deleteProgramFromDepartment(prog.id, deptId);
          setProgramsMap(prev => ({
            ...prev,
            [deptId]: prev[deptId].filter(p => p.id !== prog.id)
          }));
          const allPrograms = Object.values({ ...programsMap, [deptId]: programsMap[deptId].filter(p => p.id !== prog.id) }).flat();
          setTotalProgramsCount(allPrograms.length);
          toast.success(`Программа "${prog.name}" удалена из отделения`);
        } catch (error) {
          console.error(error);
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const confirmDeleteProgram = (prog, deptId) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Удалить программу полностью",
      message: `Вы уверены, что хотите удалить программу "${prog.name}" полностью из базы? Это действие нельзя отменить.`,
      onConfirm: async () => {
        try {
          await deleteProgram(prog.id);
          setProgramsMap(prev => ({
            ...prev,
            [deptId]: prev[deptId].filter(p => p.id !== prog.id)
          }));
          const allPrograms = Object.values({ ...programsMap, [deptId]: programsMap[deptId].filter(p => p.id !== prog.id) }).flat();
          setTotalProgramsCount(allPrograms.length);
          toast.success(`Программа "${prog.name}" удалена`);
        } catch (error) {
          console.error(error);
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const confirmDeleteDepartment = (deptId) => {
    if (!isAdmin) return;
    setConfirmDialog({
      isOpen: true,
      title: "Удалить отделение",
      message: `Вы уверены, что хотите удалить отделение? Вместе с ним будут удалены все вложенные отделения и связанные данные. Программы сохранятся.`,
      onConfirm: async () => {
        try {
          await deleteDepartment(deptId);
          toast.success("Отделение удалено");
          if (selectedDepartment === deptId) {
            setSelectedDepartment(null);
            setSelectedProgram(null);
          }
          await loadDepartments();
        } catch (error) {
          console.error(error);
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // ================= ЕДИНЫЙ ИМПОРТ (ОТДЕЛЕНИЯ + ПРОГРАММЫ + СВЯЗИ) =================
  const downloadFullTemplate = async () => {
    try {
      const response = await API.get('/api/import/departments-programs/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'departments_programs_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон (отделения, программы, связи) скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleFullImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/departments-programs/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт завершён (отделения, программы, связи)');
      await loadDepartments(); // перезагрузить все данные
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const rootDepartments = departments.filter(d => d.parentId === null);
  const childDepartments = selectedDepartment ? departments.filter(d => d.parentId === selectedDepartment) : [];

  // Рендер дерева (десктоп и мобильная панель используют одну функцию)
  const renderTree = (parentId = null, level = 0) => {
    const nodes = departments.filter((d) => d.parentId === parentId);
    if (!nodes.length) return null;
    return nodes.map((dept) => {
      const isOpen = openNodes.includes(dept.id);
      const hasChildren = departments.filter((d) => d.parentId === dept.id).length > 0;
      const deptPrograms = programsMap[dept.id] || [];
      return (
        <div key={dept.id} className="relative">
          <div
            className={`group flex items-center cursor-pointer py-2 px-3 rounded-xl transition-all duration-200 ${
              selectedDepartment === dept.id && !selectedProgram
                ? "bg-gradient-to-r from-orange-50 to-orange-100 text-[#f6a623] shadow-sm ring-1 ring-[#f6a623]/20"
                : "hover:bg-gray-50 hover:shadow-sm text-gray-700"
            }`}
            style={{ paddingLeft: level * 20 }}
            onClick={() => { setSelectedDepartment(dept.id); setSelectedProgram(null); }}
            onMouseEnter={() => setHoveredDeptId(dept.id)}
            onMouseLeave={() => setHoveredDeptId(null)}
            onContextMenu={(e) => {
              if (!isAdmin) return;
              e.preventDefault();
              setContextMenu({ visible: true, x: e.pageX, y: e.pageY, deptId: dept.id });
            }}
            title={dept.description || ""}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleNode(dept.id);
              }}
              className="mr-2 flex-shrink-0 text-current transition-transform duration-200 group-hover:scale-110"
            >
              {hasChildren ? (
                isOpen ? <FolderOpen size={18} /> : <Folder size={18} />
              ) : (
                <Folder size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate flex items-center gap-1">
                {dept.name}
                {deptPrograms.length > 0 && (
                  <span className="text-xs text-gray-400 font-normal ml-1">({deptPrograms.length})</span>
                )}
              </div>
              {dept.description && (
                <div className="text-xs text-gray-500 truncate">{dept.description}</div>
              )}
            </div>
            {isAdmin && (
              <div className={`flex gap-1 transition-opacity duration-200 ${(selectedDepartment === dept.id || hoveredDeptId === dept.id) ? "opacity-100" : "opacity-0"}`}>
                <button
                  className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                  onClick={(e) => { e.stopPropagation(); openAddDepartment(dept.id); }}
                  title="Добавить дочернее отделение"
                >
                  <Plus size={14} />
                </button>
                <button
                  className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                  onClick={(e) => { e.stopPropagation(); openEditDepartment(dept.id); }}
                  title="Редактировать"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                  onClick={(e) => { e.stopPropagation(); confirmDeleteDepartment(dept.id); }}
                  title="Удалить"
                >
                  <Trash size={14} />
                </button>
              </div>
            )}
            {hasChildren && (
              <ChevronRight
                size={14}
                className={`ml-1 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            )}
          </div>

          {isOpen && (
            <div className="ml-4 pl-2 border-l border-gray-200 animate-slideDown">
              {renderTree(dept.id, level + 1)}
              {deptPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className={`flex items-center cursor-pointer py-2 px-3 rounded-xl transition-all duration-200 ${
                    selectedProgram === prog.id
                      ? "bg-gradient-to-r from-orange-50 to-orange-100 text-[#f6a623] shadow-sm ring-1 ring-[#f6a623]/20"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                  style={{ paddingLeft: (level + 1) * 20 }}
                  onClick={() => { setSelectedProgram(prog.id); setSelectedDepartment(dept.id); }}
                  onMouseEnter={() => setHoveredProgId(prog.id)}
                  onMouseLeave={() => setHoveredProgId(null)}
                  title={prog.description || ""}
                >
                  <BookOpen size={16} className="mr-2 flex-shrink-0 text-[#f6a623] transition-transform group-hover:scale-110" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{prog.name}</div>
                    {prog.description && (
                      <div className="text-xs text-gray-500 truncate">{prog.description}</div>
                    )}
                    {prog.durationYears && (
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {formatYears(prog.durationYears)} обучения
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className={`flex gap-1 transition-opacity duration-200 ${(selectedProgram === prog.id || hoveredProgId === prog.id) ? "opacity-100" : "opacity-0"}`}>
                      <button
                        className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                        onClick={(e) => { e.stopPropagation(); confirmRemoveProgram(prog, dept.id); }}
                        title="Удалить из отделения"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                        onClick={(e) => { e.stopPropagation(); openEditProgram(prog); }}
                        title="Редактировать"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1 rounded-lg hover:bg-orange-100 text-[#f6a623] transition-colors"
                        onClick={(e) => { e.stopPropagation(); confirmDeleteProgram(prog, dept.id); }}
                        title="Удалить полностью"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Шапка */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 shadow-sm max-w-full overflow-hidden">
        {/* Левая часть: иконка + заголовок + статистика */}
        <div className="flex items-center gap-3 w-full sm:w-auto pl-10 md:pl-0">
          <div className="p-2 bg-orange-500/10 rounded-xl shrink-0">
            <Layers className="text-[#f6a623]" size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Управление отделениями и программами
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1 shrink-0">
                <Folder size={12} /> {departments.length} отделений
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <BookOpen size={12} /> {totalProgramsCount} программ
              </span>
            </div>
          </div>
        </div>

        {/* Правая часть: кнопки + поиск */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Кнопка мобильного дерева */}
            <button
              onClick={() => setShowMobileTree(!showMobileTree)}
              className="sm:hidden flex items-center gap-1.5 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all shadow-sm"
            >
              <span>Структура</span>
              {showMobileTree ? (
                <ChevronUp size={16} className="text-gray-500" />
              ) : (
                <ChevronDown size={16} className="text-gray-500" />
              )}
            </button>

            {/* Единый импорт (шаблон + загрузка) */}
            {isAdmin && (
              <>
                <button
                  onClick={downloadFullTemplate}
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
                  onChange={handleFullImport}
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

            {/* Кнопка добавления отделения */}
            {isAdmin && <AddButton onClick={() => openAddDepartment(null)} label="Добавить отделение" shortLabel="Добавить" />}
          </div>

          {/* Поиск */}
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
        <aside className="hidden sm:block w-80 bg-white/30 backdrop-blur-sm border-r border-gray-200/50 overflow-y-auto flex-shrink-0 p-4 shadow-inner">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <Folder size={18} className="text-[#f6a623]" /> Структура
            </h2>
            <button
              onClick={() => { setSelectedDepartment(null); setSelectedProgram(null); setOpenNodes([]); }}
              className="p-1.5 rounded-lg text-[#f6a623] hover:bg-orange-50 transition-colors"
              title="Сбросить выбор"
            >
              <Home size={18} />
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="text-gray-400 text-center py-10">Нет отделений</div>
          ) : (
            <div className="space-y-0.5">{renderTree(null)}</div>
          )}
        </aside>

        {showMobileTree && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileTree(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">Структура</h2>
                <button onClick={() => setShowMobileTree(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div>
                </div>
              ) : (
                renderTree(null)
              )}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f6a623]"></div>
              </div>
            ) : (
              <RightPanel
                selectedProgram={selectedProgram}
                selectedDepartment={selectedDepartment}
                departments={departments}
                programsMap={programsMap}
                childDepartments={childDepartments}
                rootDepartments={rootDepartments}
                filterText={filterText}
                onSelectDepartment={(id) => { setSelectedDepartment(id); setSelectedProgram(null); setShowMobileTree(false); }}
                onSelectProgram={(id) => { setSelectedProgram(id); setShowMobileTree(false); }}
                onReset={() => { setSelectedDepartment(null); setSelectedProgram(null); }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Контекстное меню */}
      {isAdmin && contextMenu.visible && (
        <div className="fixed z-[9999] bg-white shadow-xl rounded-xl border w-70 py-2" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => { openAddDepartment(contextMenu.deptId); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Plus size={16} className="text-[#f6a623]" /> Добавить дочернее отделение
          </button>
          <button onClick={() => { openEditDepartment(contextMenu.deptId); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Pencil size={16} className="text-[#f6a623]" /> Редактировать
          </button>
          <button onClick={() => { confirmDeleteDepartment(contextMenu.deptId); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <Trash size={16} className="text-[#f6a623]" /> Удалить
          </button>
          <button onClick={() => { setSelectedDepartment(contextMenu.deptId); setProgramFormModal({ open: true, editing: null }); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <BookOpen size={16} className="text-[#f6a623]" /> Добавить новую программу
          </button>
          <button onClick={() => { setSelectedDepartment(contextMenu.deptId); setAddExistingModal(true); setContextMenu(prev => ({ ...prev, visible: false })); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2">
            <BookOpen size={16} className="text-[#f6a623]" /> Добавить существующую программу
          </button>
        </div>
      )}

      {/* Модалки */}
      <DepartmentFormModal
        isOpen={deptFormModal.open}
        onClose={() => setDeptFormModal({ open: false, editing: null })}
        onSubmit={submitDepartment}
        initialData={deptFormModal.editing}
      />
      <ProgramFormModal
        isOpen={programFormModal.open}
        onClose={() => setProgramFormModal({ open: false, editing: null })}
        onSubmit={submitProgram}
        initialData={programFormModal.editing}
      />
      <AddExistingProgramModal
        isOpen={addExistingModal}
        onClose={() => setAddExistingModal(false)}
        onAdd={addExistingProgram}
      />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #f6a623;
          border-radius: 10px;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}