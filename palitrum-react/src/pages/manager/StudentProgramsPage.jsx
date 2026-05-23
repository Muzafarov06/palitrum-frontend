// src/pages/manager/StudentProgramsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import CustomSelect from "../../components/common/CustomSelect";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus, GraduationCap, Pencil, Trash, Save, X, User, BookOpen, ChevronDown, ChevronUp, Clock } from "lucide-react";

// Мобильная карточка записи
const StudentProgramCard = ({ sp, students, programs, onSave, onDelete, loading }) => {
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [studentId, setStudentId] = useState(sp?.studentId || "");
  const [programId, setProgramId] = useState(sp?.programId || "");
  const [enrollmentDate, setEnrollmentDate] = useState(sp?.enrollmentDate ? new Date(sp.enrollmentDate) : new Date());
  const [status, setStatus] = useState(sp?.status || "ENROLLED");

  const studentName = sp?.studentName || students.find(s => s.id === sp?.studentId)?.fullName || `ID: ${sp?.studentId}`;
  const programName = sp?.programName || programs.find(p => p.id === sp?.programId)?.name || `ID: ${sp?.programId}`;

  const handleSave = () => {
    if (!studentId || !programId) {
      toast.error("Выберите студента и программу");
      return;
    }
    onSave({
      id: sp?.id,
      studentId: Number(studentId),
      programId: Number(programId),
      enrollmentDate: enrollmentDate.toISOString().split("T")[0],
      status,
    });
    setEditMode(false);
  };

  const studentOptions = students.map(s => ({ value: s.id, label: s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim() }));
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));
  const statusOptions = [
    { value: "ENROLLED", label: "Зачислен" },
    { value: "GRADUATED", label: "Выпущен" },
    { value: "DROPPED", label: "Отчислен" },
  ];

  const statusColors = {
    ENROLLED: "bg-green-100 text-green-700",
    GRADUATED: "bg-blue-100 text-blue-700",
    DROPPED: "bg-red-100 text-red-700",
  };

  if (editMode) {
    return (
      <div className="bg-[#f6a623]/5 rounded-xl p-4 mb-3 space-y-3">
        <CustomSelect value={studentId} onChange={setStudentId} options={studentOptions} placeholder="Студент" />
        <CustomSelect value={programId} onChange={setProgramId} options={programOptions} placeholder="Программа" />
        <CustomDatePicker selected={enrollmentDate} onChange={setEnrollmentDate} />
        <CustomSelect value={status} onChange={setStatus} options={statusOptions} />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#f6a623] text-white py-2 rounded-lg flex items-center justify-center gap-1"><Save size={16} /> Сохранить</button>
          <button onClick={() => setEditMode(false)} className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-1"><X size={16} /> Отмена</button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU");
  };

  const getStatusLabel = (status) => {
    return statusOptions.find(o => o.value === status)?.label || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#f6a623]/10 flex items-center justify-center shrink-0">
                <User size={14} className="text-[#f6a623]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 text-sm truncate">{studentName}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <BookOpen size={10} className="text-gray-400" />
                  <span className="text-xs text-gray-500 truncate">{programName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sp.status] || "bg-gray-100 text-gray-600"}`}>
                  {getStatusLabel(sp.status)}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock size={10} />
                  <span>{formatDate(sp.enrollmentDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditMode(true); }}
                  className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded-lg transition"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(sp); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                >
                  <Trash size={14} />
                </button>
                {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Студент:</span>
              <span className="text-gray-700 font-medium">{studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Программа:</span>
              <span className="text-gray-700">{programName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Дата зачисления:</span>
              <span className="text-gray-700">{formatDate(sp.enrollmentDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Статус:</span>
              <span className={`font-medium ${statusColors[sp.status]?.replace("bg-", "text-").replace("100", "700") || "text-gray-700"}`}>
                {getStatusLabel(sp.status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Десктопная строка таблицы
const StudentProgramRow = ({ sp, students, programs, onSave, onDelete, loading }) => {
  const [editMode, setEditMode] = useState(false);
  const [studentId, setStudentId] = useState(sp?.studentId || "");
  const [programId, setProgramId] = useState(sp?.programId || "");
  const [enrollmentDate, setEnrollmentDate] = useState(sp?.enrollmentDate ? new Date(sp.enrollmentDate) : new Date());
  const [status, setStatus] = useState(sp?.status || "ENROLLED");

  const studentName = sp?.studentName || students.find(s => s.id === sp?.studentId)?.fullName || `ID: ${sp?.studentId}`;
  const programName = sp?.programName || programs.find(p => p.id === sp?.programId)?.name || `ID: ${sp?.programId}`;

  const handleSave = () => {
    if (!studentId || !programId) {
      toast.error("Выберите студента и программу");
      return;
    }
    onSave({
      id: sp?.id,
      studentId: Number(studentId),
      programId: Number(programId),
      enrollmentDate: enrollmentDate.toISOString().split("T")[0],
      status,
    });
    setEditMode(false);
  };

  const studentOptions = students.map(s => ({ value: s.id, label: s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim() }));
  const programOptions = programs.map(p => ({ value: p.id, label: p.name }));
  const statusOptions = [
    { value: "ENROLLED", label: "Зачислен" },
    { value: "GRADUATED", label: "Выпущен" },
    { value: "DROPPED", label: "Отчислен" },
  ];

  if (editMode) {
    return (
      <tr className="bg-[#f6a623]/5">
        <td className="px-3 py-2 min-w-[200px]"><CustomSelect value={studentId} onChange={setStudentId} options={studentOptions} placeholder="Студент" /></td>
        <td className="px-3 py-2 min-w-[200px]"><CustomSelect value={programId} onChange={setProgramId} options={programOptions} placeholder="Программа" /></td>
        <td className="px-3 py-2"><CustomDatePicker selected={enrollmentDate} onChange={setEnrollmentDate} /></td>
        <td className="px-3 py-2"><CustomSelect value={status} onChange={setStatus} options={statusOptions} /></td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button onClick={handleSave} disabled={loading} className="p-2 bg-[#f6a623] text-white rounded-lg"><Save size={16} /></button>
            <button onClick={() => setEditMode(false)} className="p-2 border rounded-lg"><X size={16} /></button>
          </div>
        </td>
      </tr>
    );
  }

  const statusColors = {
    ENROLLED: "bg-green-50 text-green-600",
    GRADUATED: "bg-blue-50 text-blue-600",
    DROPPED: "bg-red-50 text-red-500",
  };

  return (
    <tr className="hover:bg-gray-50 transition group">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#f6a623]/10 flex items-center justify-center shrink-0">
            <User size={14} className="text-[#f6a623]" />
          </div>
          <span className="font-medium text-gray-800 text-sm">{studentName}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-[#f6a623] shrink-0" />
          <span className="truncate max-w-[200px]">{programName}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
        {new Date(sp.enrollmentDate).toLocaleDateString("ru-RU")}
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sp.status] || "bg-gray-100 text-gray-600"}`}>
          {statusOptions.find(o => o.value === sp.status)?.label || sp.status}
        </span>
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition justify-end">
          <button onClick={() => setEditMode(true)} className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg" title="Редактировать"><Pencil size={16} /></button>
          <button onClick={() => onDelete(sp)} className="p-2 text-gray-400 hover:text-[#f6a623] hover:bg-[#f6a623]/10 rounded-lg" title="Удалить"><Trash size={16} /></button>
        </div>
      </td>
    </tr>
  );
};

export default function StudentProgramsPage() {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [spRes, studentRes, progRes] = await Promise.all([
        API.get("/api/student-programs"),
        API.get("/api/users/filter", { params: { roleName: "STUDENT", size: 1000 } }),
        API.get("/api/programs"),
      ]);
      const spData = spRes.data;
      const studentData = studentRes.data?.content || studentRes.data || [];
      
      const enriched = spData.map(rec => ({
        ...rec,
        studentName: rec.studentName || (() => {
          const s = studentData.find(u => u.id === rec.studentId);
          return s ? `${s.firstName || ""} ${s.lastName || ""}`.trim() : `ID: ${rec.studentId}`;
        })(),
      }));
      
      setRecords(enriched);
      setStudents(studentData);
      setPrograms(progRes.data);
    } catch { toast.error("Не удалось загрузить данные"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const payload = {
        studentId: data.studentId,
        programId: data.programId,
        enrollmentDate: data.enrollmentDate,
        status: data.status,
      };
      if (data.id) {
        await API.put(`/api/student-programs/${data.id}`, payload);
        toast.success("Запись обновлена");
      } else {
        await API.post("/api/student-programs", payload);
        toast.success("Студент зачислен на программу");
        setShowNewRow(false);
      }
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Ошибка сохранения"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await API.delete(`/api/student-programs/${recordToDelete.id}`);
      toast.success("Запись удалена");
      fetchData();
    } catch { toast.error("Ошибка удаления"); }
    finally { setRecordToDelete(null); }
  };

  const statusOptions = [
    { value: "", label: "Все статусы" },
    { value: "ENROLLED", label: "Зачислен" },
    { value: "GRADUATED", label: "Выпущен" },
    { value: "DROPPED", label: "Отчислен" },
  ];

  const filteredRecords = filterStatus
    ? records.filter(r => r.status === filterStatus)
    : records;

  const enrolledCount = records.filter(r => r.status === "ENROLLED").length;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3 pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <GraduationCap size={28} className="text-[#f6a623]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Зачисление на программы</h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{filteredRecords.length} записей • {enrolledCount} зачислено</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewRow(true)}
            className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md text-sm sm:text-base"
          >
            <Plus size={16} /> Зачислить
          </button>
        </div>

        {/* Фильтр */}
        <div className="flex items-center mb-4 flex-shrink-0">
          <div className="w-full sm:w-48">
            <CustomSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} placeholder="Статус" clearable />
          </div>
        </div>

        {/* Список записей */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f6a623]" /></div>
          ) : filteredRecords.length === 0 && !showNewRow ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm">
              <GraduationCap size={48} className="mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">Нет записей о зачислении</p>
              <p className="text-xs text-gray-400 mt-1">Зачислите студента на программу</p>
            </div>
          ) : (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-[700px] w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Студент</th>
                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Программа</th>
                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата зачисления</th>
                        <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Статус</th>
                        <th className="px-3 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {showNewRow && <StudentProgramRow sp={{}} students={students} programs={programs} onSave={handleSave} loading={saving} />}
                      {filteredRecords.map(sp => (
                        <StudentProgramRow key={sp.id} sp={sp} students={students} programs={programs} onSave={handleSave} onDelete={setRecordToDelete} loading={saving} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {showNewRow && <StudentProgramCard sp={{}} students={students} programs={programs} onSave={handleSave} loading={saving} />}
                {filteredRecords.map(sp => (
                  <StudentProgramCard key={sp.id} sp={sp} students={students} programs={programs} onSave={handleSave} onDelete={setRecordToDelete} loading={saving} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleDelete}
        title="Удалить запись"
        message={`Вы уверены, что хотите удалить запись о зачислении студента "${recordToDelete?.studentName}"?`}
      />
      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}