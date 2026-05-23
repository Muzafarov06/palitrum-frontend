// src/pages/manager/TeacherLoadPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api/api";
import CustomSelect from "../../components/common/CustomSelect";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Plus, Timer, Pencil, Trash, Save, X, Users, BadgeCheck, Clock, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

// Компактная мобильная карточка
const LoadCard = ({ load, teachers, periods, onSave, onDelete, onRecalculate, loading, isNew, onCancel }) => {
  const [editMode, setEditMode] = useState(isNew || false);
  const [teacherId, setTeacherId] = useState(load?.teacherId || "");
  const [periodId, setPeriodId] = useState(load?.academicPeriodId || "");
  const [weeklyPlanned, setWeeklyPlanned] = useState(load?.weeklyHoursPlanned || "");
  const [maxWeekly, setMaxWeekly] = useState(load?.maxWeeklyHours || "");
  const [expanded, setExpanded] = useState(false);

  const handleTeacherChange = (newTeacherId) => {
    setTeacherId(newTeacherId);
    const selectedTeacher = teachers.find(t => t.id === Number(newTeacherId));
    if (selectedTeacher?.staffRate && !maxWeekly) {
      setMaxWeekly((selectedTeacher.staffRate * 24).toFixed(1));
    }
  };

  const handleSave = () => {
    if (!teacherId || !periodId) {
      toast.error("Выберите преподавателя и период");
      return;
    }
    if (weeklyPlanned === "" || Number(weeklyPlanned) < 0) {
      toast.error("Введите плановые часы");
      return;
    }
    const selectedTeacher = teachers.find(t => t.id === Number(teacherId));
    onSave({
      id: load?.id,
      teacherId: Number(teacherId),
      academicPeriodId: Number(periodId),
      staffId: selectedTeacher?.staffId || load?.staffId || null,
      weeklyHoursPlanned: Number(weeklyPlanned),
      maxWeeklyHours: maxWeekly ? Number(maxWeekly) : null,
    });
    if (!isNew) setEditMode(false);
    else { setTeacherId(""); setPeriodId(""); setWeeklyPlanned(""); setMaxWeekly(""); }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (isNew && onCancel) onCancel();
  };

  const planned = load?.weeklyHoursPlanned || 0;
  const max = load?.maxWeeklyHours || 0;
  const percent = max > 0 ? Math.round((planned / max) * 100) : 0;
  const barColor = percent > 100 ? "bg-red-500" : percent >= 80 ? "bg-green-500" : percent >= 50 ? "bg-yellow-500" : "bg-orange-400";
  const textColor = percent > 100 ? "text-red-600" : percent >= 80 ? "text-green-600" : "text-gray-600";

  if (editMode) {
    const teacherOptions = teachers.map(t => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }));
    const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));
    return (
      <div className="bg-[#f6a623]/5 rounded-xl p-3 mb-2 space-y-2">
        <CustomSelect value={teacherId} onChange={handleTeacherChange} options={teacherOptions} placeholder="Преподаватель" />
        <CustomSelect value={periodId} onChange={setPeriodId} options={periodOptions} placeholder="Период" />
        <div className="flex gap-2">
          <input type="number" step="0.5" min="0" value={weeklyPlanned} onChange={e => setWeeklyPlanned(e.target.value)} className="flex-1 border rounded-lg px-2 py-1.5 text-center text-sm" placeholder="План" />
          <input type="number" step="0.5" min="0" value={maxWeekly} onChange={e => setMaxWeekly(e.target.value)} className="flex-1 border rounded-lg px-2 py-1.5 text-center text-sm" placeholder="Макс" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-[#f6a623] text-white py-1.5 rounded-lg text-sm"><Save size={14} className="inline mr-1" /> Сохранить</button>
          <button onClick={handleCancel} className="flex-1 border rounded-lg py-1.5 text-sm"><X size={14} className="inline mr-1" /> Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-2 overflow-hidden">
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#f6a623]/10 flex items-center justify-center shrink-0">
              <Users size={14} className="text-[#f6a623]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 text-sm truncate">{load.teacherName}</div>
              <div className="text-xs text-gray-400 truncate">{load.periodName}</div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onRecalculate(load); }} className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded" title="Пересчитать"><RefreshCw size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setEditMode(true); }} className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded" title="Редактировать"><Pencil size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(load); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Удалить"><Trash size={14} /></button>
            {expanded ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 min-w-0">
            <Clock size={12} className="text-[#f6a623] shrink-0" />
            <span className={`text-xs font-medium ${textColor} truncate`}>{planned} ч</span>
            {max > 0 && <span className="text-xs text-gray-400 shrink-0">/ {max} ч</span>}
          </div>
          {load.positionName && (
            <div className="flex items-center gap-1 min-w-0 ml-2">
              <BadgeCheck size={10} className="text-[#f6a623] shrink-0" />
              <span className="text-xs text-gray-500 truncate">{load.positionName}</span>
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Загрузка</span>
            {percent > 100 && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} /> Перегруз</span>}
          </div>
          {max > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
          )}
          {load.rateCount && (
            <div className="mt-2 text-xs text-gray-500">Ставка: {load.rateCount} ст.</div>
          )}
        </div>
      )}
    </div>
  );
};

// Десктопная строка таблицы
const LoadRow = ({ load, teachers, periods, onSave, onDelete, onRecalculate, loading, isNew, onCancel }) => {
  const [editMode, setEditMode] = useState(isNew || false);
  const [teacherId, setTeacherId] = useState(load?.teacherId || "");
  const [periodId, setPeriodId] = useState(load?.academicPeriodId || "");
  const [weeklyPlanned, setWeeklyPlanned] = useState(load?.weeklyHoursPlanned || "");
  const [maxWeekly, setMaxWeekly] = useState(load?.maxWeeklyHours || "");

  const handleTeacherChange = (newTeacherId) => {
    setTeacherId(newTeacherId);
    const selectedTeacher = teachers.find(t => t.id === Number(newTeacherId));
    if (selectedTeacher?.staffRate && !maxWeekly) setMaxWeekly((selectedTeacher.staffRate * 24).toFixed(1));
  };

  const handleSave = () => {
    if (!teacherId || !periodId) { toast.error("Выберите преподавателя и период"); return; }
    if (weeklyPlanned === "" || Number(weeklyPlanned) < 0) { toast.error("Введите плановые часы"); return; }
    const selectedTeacher = teachers.find(t => t.id === Number(teacherId));
    onSave({
      id: load?.id,
      teacherId: Number(teacherId),
      academicPeriodId: Number(periodId),
      staffId: selectedTeacher?.staffId || load?.staffId || null,
      weeklyHoursPlanned: Number(weeklyPlanned),
      maxWeeklyHours: maxWeekly ? Number(maxWeekly) : null,
    });
    if (!isNew) setEditMode(false);
    else { setTeacherId(""); setPeriodId(""); setWeeklyPlanned(""); setMaxWeekly(""); }
  };

  const teacherOptions = teachers.map(t => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }));
  const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));

  if (editMode) {
    return (
      <tr className="bg-[#f6a623]/5">
        <td className="px-3 py-2"><CustomSelect value={teacherId} onChange={handleTeacherChange} options={teacherOptions} placeholder="Преподаватель" /></td>
        <td className="px-3 py-2"><CustomSelect value={periodId} onChange={setPeriodId} options={periodOptions} placeholder="Период" /></td>
        <td className="px-3 py-2"></td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <input type="number" step="0.5" min="0" value={weeklyPlanned} onChange={e => setWeeklyPlanned(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-center text-sm" placeholder="план" />
            <span>/</span>
            <input type="number" step="0.5" min="0" value={maxWeekly} onChange={e => setMaxWeekly(e.target.value)} className="w-16 border rounded-lg px-2 py-1 text-center text-sm" placeholder="макс" />
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="flex justify-end gap-1">
            <button onClick={handleSave} disabled={loading} className="p-1.5 bg-[#f6a623] text-white rounded"><Save size={14} /></button>
            <button onClick={() => setEditMode(false)} className="p-1.5 border rounded"><X size={14} /></button>
          </div>
        </td>
      </tr>
    );
  }

  const planned = load.weeklyHoursPlanned || 0;
  const max = load.maxWeeklyHours || 0;
  const percent = max > 0 ? Math.round((planned / max) * 100) : 0;
  const barColor = percent > 100 ? "bg-red-500" : percent >= 80 ? "bg-green-500" : "bg-orange-400";

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f6a623]/10 flex items-center justify-center shrink-0"><Users size={14} className="text-[#f6a623]" /></div>
          <span className="font-medium text-sm truncate">{load.teacherName}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 truncate max-w-[150px]">{load.periodName}</td>
      <td className="px-3 py-2">
        {load.positionName ? <div className="flex items-center gap-1"><BadgeCheck size={12} className="text-[#f6a623] shrink-0" /><span className="text-xs truncate max-w-[120px]">{load.positionName}</span></div> : <span className="text-xs text-gray-400">—</span>}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-[#f6a623] shrink-0" />
          <span className={`font-medium text-sm ${percent > 100 ? 'text-red-600' : 'text-gray-700'}`}>{planned}</span>
          {max > 0 && <span className="text-xs text-gray-400">/{max}</span>}
        </div>
        {max > 0 && <div className="w-24 bg-gray-200 rounded-full h-1 mt-1"><div className={`${barColor} h-1 rounded-full`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>}
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
          <button onClick={() => onRecalculate(load)} className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded" title="Пересчитать"><RefreshCw size={14} /></button>
          <button onClick={() => setEditMode(true)} className="p-1.5 text-gray-400 hover:text-[#f6a623] rounded" title="Редактировать"><Pencil size={14} /></button>
          <button onClick={() => onDelete(load)} className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Удалить"><Trash size={14} /></button>
        </div>
      </td>
    </tr>
  );
};

export default function TeacherLoadPage() {
  const [loads, setLoads] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNewRow, setShowNewRow] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recalculatingSingle, setRecalculatingSingle] = useState(null);
  const [loadToDelete, setLoadToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadRes, teacherRes, periodRes] = await Promise.all([
        API.get("/api/teacher-loads", { params: { periodId: filterPeriod || undefined } }),
        API.get("/api/dropdown/teachers"),
        API.get("/api/academic-periods", { params: { size: 100 } }),
      ]);
      setLoads(loadRes.data);
      setTeachers(teacherRes.data);
      setPeriods(periodRes.data?.content || []);
    } catch (err) { toast.error("Не удалось загрузить данные"); }
    finally { setLoading(false); }
  }, [filterPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredLoads = loads.filter(load => load.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (data.id) await API.put(`/api/teacher-loads/${data.id}`, data);
      else await API.post("/api/teacher-loads", data);
      toast.success(data.id ? "Нагрузка обновлена" : "Нагрузка добавлена");
      if (!data.id) setShowNewRow(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Ошибка сохранения"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!loadToDelete) return;
    try {
      await API.delete(`/api/teacher-loads/${loadToDelete.id}`);
      toast.success("Нагрузка удалена");
      fetchData();
    } catch (err) { toast.error("Ошибка удаления"); }
    finally { setLoadToDelete(null); }
  };

  const handleRecalculateAll = async () => {
    if (!filterPeriod) { toast.error("Выберите период"); return; }
    setRecalculating(true);
    try {
      const res = await API.post(`/api/teacher-loads/recalculate-all?periodId=${filterPeriod}`);
      toast.success(`Обновлено ${res.data.updated} записей`);
      fetchData();
    } catch (err) { toast.error("Ошибка пересчёта"); }
    finally { setRecalculating(false); }
  };

  const handleRecalculateSingle = async (load) => {
    setRecalculatingSingle(load.id);
    try {
      await API.post(`/api/teacher-loads/recalculate/${load.id}`);
      toast.success(`Нагрузка для ${load.teacherName} пересчитана`);
      fetchData();
    } catch (err) { toast.error("Ошибка пересчёта"); }
    finally { setRecalculatingSingle(null); }
  };

  const handleGenerateMissing = async () => {
    if (!filterPeriod) { toast.error("Выберите период"); return; }
    setGenerating(true);
    try {
      const res = await API.post(`/api/teacher-loads/generate-missing?periodId=${filterPeriod}`);
      toast.success(res.data.created > 0 ? `Создано ${res.data.created} записей` : "Все нагрузки уже существуют");
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || "Ошибка формирования"); }
    finally { setGenerating(false); }
  };

  const periodOptions = periods.map(p => ({ value: p.id, label: p.name }));
  const overloaded = loads.filter(l => l.weeklyHoursPlanned > (l.maxWeeklyHours || Infinity)).length;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center gap-2 pl-10 md:pl-0 mb-3 flex-shrink-0">
          <div className="p-1.5 bg-[#f6a623]/10 rounded-lg shrink-0"><Timer size={20} className="text-[#f6a623]" /></div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-3xl font-bold text-gray-800 truncate">Нагрузка преподавателей</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="shrink-0">{loads.length} преп.</span>
              {overloaded > 0 && <span className="text-red-500 shrink-0">⚡{overloaded}</span>}
            </div>
          </div>
        </div>

        {/* Фильтры - первая строка */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2 flex-shrink-0">
          <div className="sm:flex-1 min-w-0">
            <CustomSelect value={filterPeriod} onChange={setFilterPeriod} options={[{ value: "", label: "Все периоды" }, ...periodOptions]} clearable placeholder="Период" />
          </div>
          <div className="sm:flex-1 min-w-0">
            <CustomSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Поиск..." setPage={() => {}} />
          </div>
        </div>

        {/* Кнопки действий - отдельная строка */}
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
          <button onClick={() => setShowNewRow(true)} className="bg-[#f6a623] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 shrink-0"><Plus size={14} /> Добавить</button>
          <button onClick={handleGenerateMissing} disabled={generating} className="bg-[#f6a623] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 shrink-0"><RefreshCw size={14} /> Сформировать</button>
          <button onClick={handleRecalculateAll} disabled={recalculating || !filterPeriod} className="border border-[#f6a623] text-[#f6a623] px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 disabled:opacity-50 shrink-0"><RefreshCw size={14} /> Пересчитать всё</button>
        </div>

        {/* Список нагрузок */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f6a623]" /></div>
          ) : filteredLoads.length === 0 && !showNewRow ? (
            <div className="flex flex-col items-center justify-center py-10 bg-white rounded-xl shadow-sm">
              <Timer size={32} className="mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">Нет нагрузок</p>
            </div>
          ) : (
            <>
              {/* Десктопная таблица */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <div className="min-w-[600px]">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Преподаватель</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Период</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Должность</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Нагрузка</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {showNewRow && <LoadRow isNew teachers={teachers} periods={periods} onSave={handleSave} onCancel={() => setShowNewRow(false)} loading={saving} />}
                      {filteredLoads.map(load => (
                        <LoadRow key={load.id} load={load} teachers={teachers} periods={periods} onSave={handleSave} onDelete={setLoadToDelete} onRecalculate={handleRecalculateSingle} loading={saving || recalculatingSingle === load.id} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {showNewRow && <LoadCard isNew teachers={teachers} periods={periods} onSave={handleSave} onCancel={() => setShowNewRow(false)} loading={saving} />}
                {filteredLoads.map(load => (
                  <LoadCard key={load.id} load={load} teachers={teachers} periods={periods} onSave={handleSave} onDelete={setLoadToDelete} onRecalculate={handleRecalculateSingle} loading={saving || recalculatingSingle === load.id} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog isOpen={!!loadToDelete} onClose={() => setLoadToDelete(null)} onConfirm={handleDelete} title="Удалить нагрузку" message={`Удалить нагрузку для "${loadToDelete?.teacherName}"?`} />
      <ToastContainer position="top-right" autoClose={3000} />
      <style>{`.scrollbar-hidden { scrollbar-width: none; -ms-overflow-style: none; } .scrollbar-hidden::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}