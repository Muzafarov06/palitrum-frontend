import React, { useState, useEffect } from "react";
import FormModal from "../../common/FormModal";
import CustomInput from "../../common/CustomInput";
import CustomSelect from "../../common/CustomSelect";
import CustomDatePicker from "../../common/CustomDatePicker"; // импорт кастомного DatePicker
import { toast } from "react-toastify";

const PERIOD_TYPES = [
  { value: "SEMESTER", label: "Семестр" },
  { value: "QUARTER", label: "Четверть" },
  { value: "YEAR", label: "Год" },
];

export default function AcademicPeriodFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [periodType, setPeriodType] = useState("SEMESTER");
  const [isCurrent, setIsCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setStartDate(initialData.startDate ? new Date(initialData.startDate) : null);
      setEndDate(initialData.endDate ? new Date(initialData.endDate) : null);
      setPeriodType(initialData.periodType || "SEMESTER");
      setIsCurrent(initialData.isCurrent || false);
    } else {
      setName("");
      setStartDate(null);
      setEndDate(null);
      setPeriodType("SEMESTER");
      setIsCurrent(false);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Название обязательно");
      return;
    }
    if (!startDate) {
      toast.error("Дата начала обязательна");
      return;
    }
    if (!endDate) {
      toast.error("Дата окончания обязательна");
      return;
    }
    if (startDate >= endDate) {
      toast.error("Дата окончания должна быть позже даты начала");
      return;
    }
    const data = {
      name: name.trim(),
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      periodType,
      isCurrent,
    };
    setSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      // ошибка уже показана
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal title={initialData ? "Редактировать учебный период" : "Добавить учебный период"} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomInput
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Осенний семестр 2025"
        />
        <CustomDatePicker
          label="Дата начала"
          selected={startDate}
          onChange={setStartDate}
          required
        />
        <CustomDatePicker
          label="Дата окончания"
          selected={endDate}
          onChange={setEndDate}
          required
        />
        <CustomSelect
          label="Тип периода"
          value={periodType}
          onChange={setPeriodType}
          options={PERIOD_TYPES}
          required
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCurrent"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="w-4 h-4 text-[#f6a623] rounded focus:ring-[#f6a623]"
          />
          <label htmlFor="isCurrent" className="text-sm text-gray-700">
            Текущий учебный период
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515] transition disabled:opacity-50"
        >
          {submitting ? "Сохранение..." : (initialData ? "Сохранить" : "Добавить")}
        </button>
      </div>
    </FormModal>
  );
}