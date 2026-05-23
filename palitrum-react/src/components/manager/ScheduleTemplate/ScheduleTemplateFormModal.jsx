import React, { useState, useEffect } from "react";
import FormModal from "../../common/FormModal";
import CustomSelect from "../../common/CustomSelect";
import CustomInput from "../../common/CustomInput";
import { toast } from "react-toastify";
import {
  fetchGroupsByPeriod,
  fetchIndividualStudents,
  fetchAllTeachers,
  fetchRoomsByMinCapacity,
  fetchSubjects,                // все предметы (запасной вариант)
  fetchSubjectsForProgram,      // предметы по программе
  fetchSubjectsByStudent,       // предметы по студенту – нужно добавить в api.js
} from "../../../api/api";

const DAYS = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

export default function ScheduleTemplateFormModal({ isOpen, onClose, onSubmit, initialData, periodId }) {
  const [type, setType] = useState("group");
  const [groupId, setGroupId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [loading, setLoading] = useState(false);

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Загрузка базовых списков
  useEffect(() => {
    if (!isOpen) return;
    loadGroups();
    loadStudents();
    loadTeachers();
    if (initialData) {
      setType(initialData.groupId ? "group" : "individual");
      setGroupId(initialData.groupId || "");
      setStudentId(initialData.studentId || "");
      setSubjectId(initialData.subjectId || "");
      setTeacherId(initialData.teacherId || "");
      setRoomId(initialData.roomId || "");
      setDayOfWeek(initialData.dayOfWeek || "");
      setStartTime(initialData.startTime ? initialData.startTime.substring(0,5) : "");
      setDurationMinutes(initialData.durationMinutes || 45);
    } else {
      resetForm();
    }
  }, [isOpen, initialData, periodId]);

  // Загрузка предметов при изменении выбора
  useEffect(() => {
    if (type === "group" && groupId) {
      const group = groups.find(g => g.value == groupId);
      if (group && group.programId) {
        loadSubjectsByProgram(group.programId);
      } else {
        setSubjects([]);
        setSubjectId("");
      }
    } else if (type === "individual" && studentId) {
      loadSubjectsByStudent(studentId);
    } else {
      setSubjects([]);
      setSubjectId("");
    }
  }, [type, groupId, studentId, groups]);

  // Загрузка комнат с минимальной вместимостью (только для групповых)
  useEffect(() => {
    let minCapacity = 1;
    if (type === "group" && groupId) {
      const group = groups.find(g => g.value == groupId);
      if (group && group.maxStudents) minCapacity = group.maxStudents;
    }
    loadRooms(minCapacity);
  }, [type, groupId, groups]);

  const resetForm = () => {
    setType("group");
    setGroupId("");
    setStudentId("");
    setSubjectId("");
    setTeacherId("");
    setRoomId("");
    setDayOfWeek("");
    setStartTime("");
    setDurationMinutes(45);
  };

  const loadGroups = async () => {
    if (!periodId) return;
    try {
      const data = await fetchGroupsByPeriod(periodId);
      setGroups(data.map(g => ({
        value: g.id,
        label: g.name,
        programId: g.programId,
        maxStudents: g.maxStudents,
      })));
    } catch (err) {
      toast.error("Не удалось загрузить группы");
    }
  };

  const loadStudents = async () => {
    try {
      const data = await fetchIndividualStudents();
      setStudents(data.map(s => ({ value: s.id, label: `${s.lastName} ${s.firstName}` })));
    } catch (err) {
      toast.error("Не удалось загрузить студентов");
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await fetchAllTeachers();
      setTeachers(data.map(t => ({ value: t.id, label: `${t.lastName} ${t.firstName}` })));
    } catch (err) {
      toast.error("Не удалось загрузить преподавателей");
    }
  };

  const loadRooms = async (minCapacity) => {
    try {
      const data = await fetchRoomsByMinCapacity(minCapacity);
      setRooms(data.map(r => ({ value: r.id, label: r.name })));
    } catch (err) {
      toast.error("Не удалось загрузить помещения");
    }
  };

  const loadSubjectsByProgram = async (programId) => {
    try {
      let data;
      if (typeof fetchSubjectsForProgram === "function") {
        data = await fetchSubjectsForProgram(programId);
      } else {
        data = await fetchSubjects();
      }
      setSubjects(data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error("Ошибка загрузки предметов по программе:", err);
      loadAllSubjects();
    }
  };

  const loadSubjectsByStudent = async (studentId) => {
    try {
      const data = await fetchSubjectsByStudent(studentId);
      setSubjects(data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error("Ошибка загрузки предметов студента:", err);
      loadAllSubjects();
    }
  };

  const loadAllSubjects = async () => {
    try {
      const data = await fetchSubjects();
      setSubjects(data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      toast.error("Не удалось загрузить предметы");
      setSubjects([]);
    }
  };

  const handleSubmit = async () => {
    if (!periodId) {
      toast.error("Не выбран учебный период");
      return;
    }
    if (type === "group" && !groupId) {
      toast.error("Выберите группу");
      return;
    }
    if (type === "individual" && !studentId) {
      toast.error("Выберите студента");
      return;
    }
    if (!subjectId) {
      toast.error("Выберите предмет");
      return;
    }
    if (!teacherId) {
      toast.error("Выберите преподавателя");
      return;
    }
    if (!roomId) {
      toast.error("Выберите комнату");
      return;
    }
    if (!dayOfWeek) {
      toast.error("Выберите день недели");
      return;
    }
    if (!startTime) {
      toast.error("Укажите время начала");
      return;
    }
    if (!durationMinutes || durationMinutes <= 0) {
      toast.error("Укажите длительность занятия");
      return;
    }

    const data = {
      academicPeriodId: Number(periodId),
      subjectId: Number(subjectId),
      teacherId: Number(teacherId),
      roomId: Number(roomId),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      durationMinutes: Number(durationMinutes),
    };
    if (type === "group") {
      data.groupId = Number(groupId);
      data.studentId = null;
    } else {
      data.studentId = Number(studentId);
      data.groupId = null;
    }
    if (initialData?.id) data.id = initialData.id;

    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      // ошибка уже показана
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeOptions = [
    { value: "group", label: "Групповое" },
    { value: "individual", label: "Индивидуальное" },
  ];

  return (
    <FormModal title={initialData ? "Редактировать шаблон" : "Новый шаблон"} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomSelect
          label="Тип занятия"
          value={type}
          onChange={setType}
          options={typeOptions}
          required
        />

        {type === "group" ? (
          <CustomSelect
            label="Группа"
            value={groupId}
            onChange={setGroupId}
            options={groups}
            required
          />
        ) : (
          <CustomSelect
            label="Студент"
            value={studentId}
            onChange={setStudentId}
            options={students}
            required
          />
        )}

        <CustomSelect
          label="Предмет"
          value={subjectId}
          onChange={setSubjectId}
          options={subjects}
          required
          disabled={subjects.length === 0}
        />

        <CustomSelect
          label="Преподаватель"
          value={teacherId}
          onChange={setTeacherId}
          options={teachers}
          required
        />

        <CustomSelect
          label="Помещение"
          value={roomId}
          onChange={setRoomId}
          options={rooms}
          required
        />

        <CustomSelect
          label="День недели"
          value={dayOfWeek}
          onChange={setDayOfWeek}
          options={DAYS}
          required
        />

        <CustomInput
          label="Время начала"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />

        <CustomInput
          label="Длительность (минуты)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          required
          placeholder="45"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515] transition disabled:opacity-50"
        >
          {loading ? "Сохранение..." : (initialData ? "Сохранить" : "Добавить")}
        </button>
      </div>
    </FormModal>
  );
}