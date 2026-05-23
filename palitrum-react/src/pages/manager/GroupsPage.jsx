// src/pages/manager/GroupsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import CustomSelect from "../../components/common/CustomSelect";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus, Users, Pencil, Trash, Save, X, User, UserPlus, UserMinus, Search, ChevronDown, ChevronUp } from "lucide-react";

// ====================== Модальное окно добавления студента ======================
const AddStudentModal = ({ isOpen, onClose, groupId, onStudentAdded }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      API.get("/api/users/filter", { params: { roleName: "STUDENT", size: 1000 } })
        .then(res => {
          const list = res.data?.content || res.data || [];
          setStudents(list);
        })
        .catch(() => toast.error("Не удалось загрузить список студентов"))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!selectedStudent) return toast.error("Выберите студента");
    setSaving(true);
    try {
      await API.post("/api/student-groups", {
        userId: Number(selectedStudent),
        groupId,
        enrolledDate: new Date().toISOString().split("T")[0],
        enrollmentStatus: "ENROLLED",
        active: true,
      });
      toast.success("Студент добавлен в группу");
      onStudentAdded();
      onClose();
    } catch (err) { toast.error("Ошибка добавления"); }
    finally { setSaving(false); }
  };

  if (!isOpen) return null;

  const options = students.map(s => ({
    value: s.id,
    label: `${s.firstName || ""} ${s.lastName || ""}`.trim() || `ID: ${s.id}`
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Добавить студента в группу</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-red-500 rounded"><X size={20} /></button>
        </div>
        {loading ? <p className="text-sm text-gray-400">Загрузка...</p> : (
          <CustomSelect value={selectedStudent} onChange={setSelectedStudent} options={options} placeholder="Выберите студента" />
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Отмена</button>
          <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515] disabled:opacity-50">
            {saving ? "Добавление..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================== Карточка группы для мобильных ======================
const GroupCard = ({ group, programs, subjects, onSave, onDelete, loading, students, onLoadStudents, onRemoveStudent, onAddStudent, isExpanded, onToggleExpand }) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(group?.name || "");
  const [programId, setProgramId] = useState(group?.programId || "");
  const [subjectId, setSubjectId] = useState(group?.subjectId || "");
  const [academicYear, setAcademicYear] = useState(group?.academicYear || "1");
  const [maxStudents, setMaxStudents] = useState(group?.maxStudents || "");

  const programName = programs.find(p => p.id === group.programId)?.name || group.programId;
  const subjectName = subjects.find(s => s.id === group.subjectId)?.name || group.subjectId;
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));
  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));
  const isOverfilled = group.maxStudents && students.length >= group.maxStudents;

  const handleSave = () => {
    if (!name.trim() || !programId || !subjectId) {
      toast.error("Заполните обязательные поля");
      return;
    }
    onSave({
      id: group?.id,
      name: name.trim(),
      programId: Number(programId),
      subjectId: Number(subjectId),
      academicYear: Number(academicYear),
      maxStudents: maxStudents ? Number(maxStudents) : null,
    });
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className="bg-[#f6a623]/5 rounded-xl p-4 mb-3 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50" placeholder="Название группы" />
        <CustomSelect value={programId} onChange={setProgramId} options={programOptions} placeholder="Программа" />
        <CustomSelect value={subjectId} onChange={setSubjectId} options={subjectOptions} placeholder="Предмет" />
        <div className="flex gap-2">
          <input type="number" min="1" max="11" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-24 border rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-[#f6a623]/50" placeholder="Год" />
          <input type="number" min="1" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-[#f6a623]/50" placeholder="Макс. мест" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515]"><Save size={16} className="inline mr-1" /> Сохранить</button>
          <button onClick={() => setEditMode(false)} className="flex-1 border rounded-lg py-2 hover:bg-gray-50"><X size={16} className="inline mr-1" /> Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={onToggleExpand}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-base">{group.name}</h3>
            <div className="text-sm text-gray-500 mt-1">{programName} • {subjectName}</div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-gray-500">Год: {group.academicYear}</span>
              <span className={isOverfilled ? "text-red-500 font-bold" : "text-gray-500"}>
                Мест: {students.length || 0}/{group.maxStudents || "∞"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onAddStudent(); }} className="p-2 text-gray-400 hover:text-green-500 rounded-lg" title="Добавить студента"><UserPlus size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); setEditMode(true); }} className="p-2 text-gray-400 hover:text-[#f6a623] rounded-lg" title="Редактировать"><Pencil size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(group); }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg" title="Удалить"><Trash size={16} /></button>
            {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Users size={14} className="text-[#f6a623]" /> Состав группы ({students.length})
              {isOverfilled && <span className="text-red-500 text-xs">• Превышен лимит</span>}
            </div>
            <button onClick={onAddStudent} className="text-xs bg-[#f6a623] text-white px-3 py-1.5 rounded-lg hover:bg-[#e09515] flex items-center gap-1">
              <UserPlus size={12} /> Добавить
            </button>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Нет зачисленных студентов</p>
          ) : (
            <div className="space-y-2">
              {students.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-2 border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f6a623]/10 flex items-center justify-center">
                      <User size={14} className="text-[#f6a623]" />
                    </div>
                    <span className="text-sm">{s.userFullName || `ID: ${s.userId}`}</span>
                  </div>
                  <button onClick={() => onRemoveStudent(s.userId)} className="text-gray-400 hover:text-red-500 transition p-1">
                    <UserMinus size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ====================== Строка таблицы для десктопа ======================
const GroupRow = ({ group, programs, subjects, onSave, onDelete, loading, students, onLoadStudents, onRemoveStudent, onAddStudent, isExpanded, onToggleExpand }) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(group?.name || "");
  const [programId, setProgramId] = useState(group?.programId || "");
  const [subjectId, setSubjectId] = useState(group?.subjectId || "");
  const [academicYear, setAcademicYear] = useState(group?.academicYear || "1");
  const [maxStudents, setMaxStudents] = useState(group?.maxStudents || "");

  const programName = programs.find(p => p.id === group.programId)?.name || group.programId;
  const subjectName = subjects.find(s => s.id === group.subjectId)?.name || group.subjectId;
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));
  const subjectOptions = subjects.map(s => ({ value: s.id, label: s.name }));
  const isOverfilled = group.maxStudents && students.length >= group.maxStudents;

  const handleSave = () => {
    if (!name.trim() || !programId || !subjectId) {
      toast.error("Заполните обязательные поля");
      return;
    }
    onSave({
      id: group?.id,
      name: name.trim(),
      programId: Number(programId),
      subjectId: Number(subjectId),
      academicYear: Number(academicYear),
      maxStudents: maxStudents ? Number(maxStudents) : null,
    });
    setEditMode(false);
  };

  if (editMode) {
    return (
      <tr className="bg-[#f6a623]/5">
        <td className="px-3 py-2"><input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50" placeholder="Название" /></td>
        <td className="px-3 py-2"><CustomSelect value={programId} onChange={setProgramId} options={programOptions} placeholder="Программа" /></td>
        <td className="px-3 py-2"><CustomSelect value={subjectId} onChange={setSubjectId} options={subjectOptions} placeholder="Предмет" /></td>
        <td className="px-3 py-2"><input type="number" min="1" max="11" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-16 border rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-[#f6a623]/50" /></td>
        <td className="px-3 py-2"><input type="number" min="1" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} className="w-20 border rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-[#f6a623]/50" /></td>
        <td className="px-3 py-2 flex gap-1">
          <button onClick={handleSave} disabled={loading} className="p-2 bg-[#f6a623] text-white rounded-lg hover:bg-[#e09515]"><Save size={16} /></button>
          <button onClick={() => setEditMode(false)} className="p-2 text-gray-500 hover:text-red-500 rounded-lg"><X size={16} /></button>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="hover:bg-gray-50 transition cursor-pointer" onClick={onToggleExpand}>
        <td className="px-3 py-2 font-medium text-gray-800">{group.name}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{programName}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{subjectName}</td>
        <td className="px-3 py-2 text-center text-sm">{group.academicYear}</td>
        <td className="px-3 py-2 text-center text-sm">
          <span className={isOverfilled ? "text-red-500 font-bold" : ""}>{students.length || 0}/{group.maxStudents || "—"}</span>
        </td>
        <td className="px-3 py-2 flex gap-1 opacity-0 group-hover:opacity-100 transition justify-end" onClick={e => e.stopPropagation()}>
          <button onClick={onAddStudent} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg" title="Добавить студента"><UserPlus size={16} /></button>
          <button onClick={() => setEditMode(true)} className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg" title="Редактировать"><Pencil size={16} /></button>
          <button onClick={() => onDelete(group)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Удалить"><Trash size={16} /></button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-[#f6a623]" /> Состав группы ({students.length})
                {isOverfilled && <span className="text-red-500 text-xs font-normal">• Превышен лимит</span>}
              </div>
              <button onClick={onAddStudent} className="text-xs bg-[#f6a623] text-white px-3 py-1 rounded-lg hover:bg-[#e09515] flex items-center gap-1">
                <UserPlus size={14} /> Добавить
              </button>
            </div>
            {students.length === 0 ? (
              <p className="text-sm text-gray-400">Нет зачисленных студентов</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {students.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 bg-white rounded-lg p-2 border group/student">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#f6a623]/10 flex items-center justify-center">
                        <User size={14} className="text-[#f6a623]" />
                      </div>
                      <span className="text-sm">{s.userFullName || `ID: ${s.userId}`}</span>
                    </div>
                    <button onClick={() => onRemoveStudent(s.userId)} className="opacity-0 group-hover/student:opacity-100 text-gray-400 hover:text-red-500 transition p-1">
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

// ====================== Основная страница ======================
export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [filterProgram, setFilterProgram] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [studentsMap, setStudentsMap] = useState({});
  const [groupToDelete, setGroupToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupRes, progRes, subjRes] = await Promise.all([
        API.get("/api/groups"),
        API.get("/api/programs"),
        API.get("/api/subjects"),
      ]);
      setGroups(groupRes.data);
      setPrograms(progRes.data);
      setSubjects(subjRes.data);
    } catch { toast.error("Не удалось загрузить данные"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadStudents = async (groupId) => {
    if (studentsMap[groupId]) return;
    try {
      const res = await API.get(`/api/groups/${groupId}/students`);
      setStudentsMap(prev => ({ ...prev, [groupId]: res.data }));
    } catch { toast.error("Не удалось загрузить студентов"); }
  };

  const toggleExpand = (groupId) => {
    if (!expandedGroups[groupId] && !studentsMap[groupId]) {
      loadStudents(groupId);
    }
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (data.id) {
        await API.put(`/api/groups/${data.id}`, data);
        toast.success("Группа обновлена");
      } else {
        await API.post("/api/groups", data);
        toast.success("Группа добавлена");
        setShowNewRow(false);
      }
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Ошибка сохранения"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;
    try {
      await API.delete(`/api/groups/${groupToDelete.id}`);
      toast.success("Группа удалена");
      fetchData();
    } catch { toast.error("Ошибка удаления"); }
    finally { setGroupToDelete(null); }
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    if (!window.confirm("Удалить студента из группы?")) return;
    try {
      await API.delete(`/api/student-groups/by-user-and-group?userId=${studentId}&groupId=${groupId}`);
      toast.success("Студент удалён из группы");
      setStudentsMap(prev => ({ ...prev, [groupId]: prev[groupId]?.filter(s => s.userId !== studentId) || [] }));
    } catch { toast.error("Ошибка удаления"); }
  };

  const handleAddStudent = (groupId) => {
    // Открывается модалка через состояние в GroupRow/GroupCard
    // Для этого нужно передать колбэк, но проще добавить состояние в основной компонент
  };

  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));
  const yearOptions = [1,2,3,4,5,6,7,8,9,10,11].map(y => ({ value: y, label: `${y} год` }));

  const filteredGroups = groups.filter(g => {
    if (filterProgram && g.programId !== Number(filterProgram)) return false;
    if (filterYear && g.academicYear !== Number(filterYear)) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0"><Users size={28} className="text-[#f6a623]" /></div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Учебные группы</h1>
              <p className="text-gray-500 text-sm mt-1">{filteredGroups.length} групп</p>
            </div>
          </div>
          <button onClick={() => setShowNewRow(true)} className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md text-sm sm:text-base">
            <Plus size={16} /> Добавить группу
          </button>
        </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 flex-shrink-0">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623]/50 text-sm" placeholder="Поиск по названию..." />
          </div>
          <div className="w-full sm:w-56">
            <CustomSelect value={filterProgram} onChange={setFilterProgram} options={[{ value: "", label: "Все программы" }, ...programOptions]} clearable placeholder="Программа" />
          </div>
          <div className="w-full sm:w-36">
            <CustomSelect value={filterYear} onChange={setFilterYear} options={[{ value: "", label: "Все года" }, ...yearOptions]} clearable placeholder="Год" />
          </div>
        </div>

        {/* Список групп */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]"></div></div>
          ) : filteredGroups.length === 0 && !showNewRow ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
              <Users size={48} className="mb-3 text-gray-300" />
              <p className="text-gray-500">Нет учебных групп</p>
              <p className="text-sm text-gray-400 mt-1">Создайте первую группу, чтобы начать</p>
            </div>
          ) : (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                      <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Программа</th>
                      <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Предмет</th>
                      <th className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Год</th>
                      <th className="px-3 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Мест</th>
                      <th className="px-3 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {showNewRow && (
                      <GroupRow 
                        group={{}} programs={programs} subjects={subjects} onSave={handleSave} loading={saving}
                        students={[]} onLoadStudents={() => {}} onRemoveStudent={() => {}} onAddStudent={() => {}}
                        isExpanded={false} onToggleExpand={() => {}}
                      />
                    )}
                    {filteredGroups.map(group => (
                      <GroupRow 
                        key={group.id} group={group} programs={programs} subjects={subjects} onSave={handleSave} onDelete={setGroupToDelete} loading={saving}
                        students={studentsMap[group.id] || []} onLoadStudents={() => loadStudents(group.id)}
                        onRemoveStudent={(studentId) => handleRemoveStudent(group.id, studentId)}
                        onAddStudent={() => {}}
                        isExpanded={expandedGroups[group.id] || false}
                        onToggleExpand={() => toggleExpand(group.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {showNewRow && (
                  <GroupCard 
                    group={{}} programs={programs} subjects={subjects} onSave={handleSave} loading={saving}
                    students={[]} onLoadStudents={() => {}} onRemoveStudent={() => {}} onAddStudent={() => {}}
                    isExpanded={false} onToggleExpand={() => {}}
                  />
                )}
                {filteredGroups.map(group => (
                  <GroupCard 
                    key={group.id} group={group} programs={programs} subjects={subjects} onSave={handleSave} onDelete={setGroupToDelete} loading={saving}
                    students={studentsMap[group.id] || []} onLoadStudents={() => loadStudents(group.id)}
                    onRemoveStudent={(studentId) => handleRemoveStudent(group.id, studentId)}
                    onAddStudent={() => {}}
                    isExpanded={expandedGroups[group.id] || false}
                    onToggleExpand={() => toggleExpand(group.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить группу"
        message={`Вы уверены, что хотите удалить группу "${groupToDelete?.name}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}