import React, { useState, useEffect } from "react";
import FormModal from "../../common/FormModal";
import CustomInput from "../../common/CustomInput";
import CustomSelect from "../../common/CustomSelect";
import { toast } from "react-toastify";

const TYPE_OPTIONS = [
  { value: "teaching", label: "Учебная" },
  { value: "admin", label: "Административная" },
];

export default function PositionFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [name, setName] = useState("");
  const [hoursPerRate, setHoursPerRate] = useState("24");
  const [type, setType] = useState("teaching");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setHoursPerRate(String(initialData.hoursPerRate ?? "24"));
      setType(initialData.isTeaching ? "teaching" : "admin");
    } else {
      setName("");
      setHoursPerRate("24");
      setType("teaching");
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Введите название должности");
      return;
    }
    const hours = Number(hoursPerRate);
    if (isNaN(hours) || hours <= 0) {
      toast.error("Часы на ставку должны быть положительным числом");
      return;
    }
    const data = {
      name: name.trim(),
      hoursPerRate: hours,
      isTeaching: type === "teaching",
    };
    setSubmitting(true);
    try {
      await onSubmit(data, initialData?.id);
      onClose();
    } catch (err) {
      // ошибка уже показана в родителе
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <FormModal
      title={initialData ? "Редактировать должность" : "Добавить должность"}
      onClose={onClose}
    >
      <div className="p-6 pt-4 space-y-4">
        <CustomInput
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Например: Преподаватель фортепиано"
        />
        <CustomInput
          label="Часов на ставку (в неделю)"
          type="number"
          step="0.5"
          min="0.5"
          value={hoursPerRate}
          onChange={(e) => setHoursPerRate(e.target.value)}
          required
          placeholder="24"
        />
        <CustomSelect
          label="Тип должности"
          value={type}
          onChange={setType}
          options={TYPE_OPTIONS}
          required
          clearable={false}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515] transition disabled:opacity-50"
        >
          {submitting ? "Сохранение..." : initialData ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </FormModal>
  );
}