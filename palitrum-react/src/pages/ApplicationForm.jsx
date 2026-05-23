import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../api/api";

export default function ApplicationForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    childFirstName: "",
    childLastName: "",
    childMiddleName: "",
    childBirthDate: "",
    childCitizenship: "",
    childAddress: "",
    parentLastName: "",
    parentFirstName: "",
    parentMiddleName: "",
    parentPhone: "",
    parentEmail: "",
    additionalInfo: "",
    preferredProgramId: "",
    parentRelation: "MOTHER",
    source: "SITE",
  });

  const [documents, setDocuments] = useState({
    consent: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e, field) => {
    setDocuments({ ...documents, [field]: Array.from(e.target.files) });
  };

  const validateForm = () => {
    if (!form.childLastName) return toast.error("Фамилия ребёнка обязательна");
    if (!form.childFirstName) return toast.error("Имя ребёнка обязательно");
    if (!form.childMiddleName) return toast.error("Отчество ребёнка обязательно");
    if (!form.childBirthDate) return toast.error("Дата рождения ребёнка обязательна");
    if (!form.parentLastName) return toast.error("Фамилия родителя обязательна");
    if (!form.parentFirstName) return toast.error("Имя родителя обязательно");
    if (!form.parentPhone) return toast.error("Телефон родителя обязателен");

    const phoneDigits = form.parentPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return toast.error("Телефон должен содержать от 10 до 15 цифр");
    }

    if (!form.parentEmail) return toast.error("Email родителя обязателен");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.parentEmail)) return toast.error("Некорректный email");

    return true;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    let phoneDigits = form.parentPhone.replace(/\D/g, '');
    if (phoneDigits.length === 11 && phoneDigits.startsWith('7')) {
      phoneDigits = '+' + phoneDigits;
    } else if (phoneDigits.length === 11 && phoneDigits.startsWith('8')) {
      phoneDigits = '+7' + phoneDigits.slice(1);
    } else if (phoneDigits.length === 10) {
      phoneDigits = '+7' + phoneDigits;
    } else {
      phoneDigits = '+' + phoneDigits;
    }

    const payload = {
      childLastName: form.childLastName,
      childFirstName: form.childFirstName,
      childMiddleName: form.childMiddleName,
      childBirthDate: form.childBirthDate,
      childCitizenship: form.childCitizenship || null,
      childAddress: form.childAddress || null,
      preferredProgramId: form.preferredProgramId ? parseInt(form.preferredProgramId) : null,
      parentLastName: form.parentLastName,
      parentFirstName: form.parentFirstName,
      parentMiddleName: form.parentMiddleName || null,
      parentRelation: form.parentRelation,
      parentPhone: phoneDigits,
      parentEmail: form.parentEmail,
      additionalInfo: form.additionalInfo || null,
      source: form.source,
    };

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      Object.entries(documents).forEach(([field, files]) => {
        files.forEach((file) => formData.append("files", file));
      });

      // ✅ ИСПОЛЬЗУЕМ FETCH, А НЕ AXIOS
      const response = await fetch("http://localhost:8080/api/applications/create-with-files", {
        method: "POST",
        body: formData,
        credentials: "include",
        // Не указываем Content-Type – браузер сделает всё сам
      });

      if (response.ok) {
        toast.success("Заявка успешно отправлена!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Ошибка при отправке заявки");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Ошибка при отправке заявки");
    }
  };

  const fileButtons = [
    {
      label: "Согласие на приём",
      field: "consent",
      downloadLink: "/files/consent-form.pdf",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <ToastContainer position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[700px] max-h-[80vh] p-6 relative overflow-hidden">
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">Заявка на обучение</h2>

        <form
          className="flex flex-col gap-6 overflow-y-auto max-h-[calc(80vh-50px)] pr-2 pb-10"
          onSubmit={submitForm}
        >
          {/* Данные ребёнка */}
          <section>
            <h3 className="font-semibold mb-2 text-lg md:text-xl">Данные ребёнка</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="childLastName"
                placeholder="Фамилия"
                value={form.childLastName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="childFirstName"
                placeholder="Имя"
                value={form.childFirstName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="childMiddleName"
                placeholder="Отчество"
                value={form.childMiddleName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <div className="flex flex-col">
                <label className="text-sm mb-1">Дата рождения</label>
                <input
                  type="date"
                  name="childBirthDate"
                  value={form.childBirthDate}
                  className="border p-2 rounded"
                  onChange={handleChange}
                />
              </div>
              <input
                type="text"
                name="childCitizenship"
                placeholder="Гражданство (необязательно)"
                value={form.childCitizenship}
                className="border p-2 rounded col-span-2"
                onChange={handleChange}
              />
              <input
                type="text"
                name="childAddress"
                placeholder="Адрес (необязательно)"
                value={form.childAddress}
                className="border p-2 rounded col-span-2"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Данные родителя */}
          <section>
            <h3 className="font-semibold mb-2 text-lg md:text-xl">Данные родителя</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                name="parentLastName"
                placeholder="Фамилия"
                value={form.parentLastName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="parentFirstName"
                placeholder="Имя"
                value={form.parentFirstName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="parentMiddleName"
                placeholder="Отчество"
                value={form.parentMiddleName}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="parentPhone"
                placeholder="+7 (999) 999-99-99"
                value={form.parentPhone}
                className="border p-2 rounded col-span-2"
                onChange={handleChange}
              />
              <input
                type="email"
                name="parentEmail"
                placeholder="Email"
                value={form.parentEmail}
                className="border p-2 rounded col-span-2"
                onChange={handleChange}
              />
              <select
                name="parentRelation"
                value={form.parentRelation}
                onChange={handleChange}
                className="border p-2 rounded col-span-2"
              >
                <option value="MOTHER">Мать</option>
                <option value="FATHER">Отец</option>
                <option value="GUARDIAN">Опекун</option>
              </select>
            </div>
          </section>

          {/* Программа */}
          <section>
            <h3 className="font-semibold mb-2 text-lg md:text-xl">Выбор программы</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="number"
                name="preferredProgramId"
                placeholder="ID программы (необязательно)"
                value={form.preferredProgramId}
                className="border p-2 rounded"
                onChange={handleChange}
              />
              <input
                type="text"
                name="additionalInfo"
                placeholder="Дополнительная информация"
                value={form.additionalInfo}
                className="border p-2 rounded"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Документы */}
          <section>
            <h3 className="font-semibold mb-2 text-lg md:text-xl">Документы для поступления</h3>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {fileButtons.map(({ label, field, downloadLink }) => (
                <div key={field} className="flex flex-col items-center">
                  <label className="cursor-pointer w-full">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileChange(e, field)}
                    />
                    <div className="bg-[#f6a623] text-white text-center py-2 rounded-full hover:opacity-90 transition flex justify-between items-center px-2">
                      <span>{label}</span>
                      {downloadLink && (
                        <a
                          href={downloadLink}
                          download
                          className="ml-2 text-xs text-white underline"
                        >
                          Скачать
                        </a>
                      )}
                    </div>
                  </label>
                  <span className="text-gray-800 text-sm mt-1">
                    {documents[field].length > 0
                      ? `${documents[field].length} файл(ов) прикреплено`
                      : "Файл не прикреплен"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            className="mt-4 bg-[#f6a623] text-white rounded-full py-3 hover:opacity-90"
          >
            Отправить заявку
          </button>
        </form>
      </div>
    </div>
  );
}