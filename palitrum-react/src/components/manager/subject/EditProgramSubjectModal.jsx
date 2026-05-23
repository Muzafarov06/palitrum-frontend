import React, { useState, useEffect } from "react";
import FormModal from "../../common/FormModal";
import CustomInput from "../../common/CustomInput";
import CustomSelect from "../../common/CustomSelect";
import { toast } from "react-toastify";

export default function EditProgramSubjectModal({ isOpen, onClose, onSubmit, connection, programDuration }) {
  const [academicYear, setAcademicYear] = useState(1);
  const [hoursPerWeek, setHoursPerWeek] = useState(0);

  useEffect(() => {
    if (connection) {
      setAcademicYear(connection.programAcademicYear || 1);
      setHoursPerWeek(connection.hoursPerWeekForProgram || 0);
    }
  }, [connection]);

  const handleSubmit = async () => {
    if (programDuration && academicYear > programDuration) {
        toast.error(`Год не может превышать ${programDuration}`);
        return;
    }
    try {
        // ВАЖНО: передаём connection.connectionId, а не connection.id
        await onSubmit(connection.connectionId, academicYear, hoursPerWeek);
        onClose();
    } catch (err) {
        toast.error("Ошибка сохранения");
    }
    };

  if (!isOpen) return null;

  // Создаём опции для CustomSelect
  const years = programDuration 
    ? Array.from({ length: programDuration }, (_, i) => ({ value: i + 1, label: `${i + 1} год` }))
    : [{ value: 1, label: "1 год" }, { value: 2, label: "2 год" }, { value: 3, label: "3 год" }, { value: 4, label: "4 год" }];

  return (
    <FormModal title="Настройка предмета в программе" onClose={onClose}>
      <div className="p-6 space-y-4">
        <CustomSelect
          label="Год обучения"
          value={academicYear}
          onChange={setAcademicYear}
          options={years}
          required
        />
        <CustomInput
          label="Часов в неделю"
          type="number"
          step="0.5"
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(Number(e.target.value))}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515]"
        >
          Сохранить
        </button>
      </div>
    </FormModal>
  );
}