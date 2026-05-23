// src/components/manager/ApplicationEditModal.jsx
import React, { useState, useEffect } from "react";
import {
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  getApplicationFiles,
  deleteFile,
  fetchAllPrograms,
} from "../../api/api";
import {
  Upload,
  Trash2,
  FileText,
  Save,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Info,
  Check,
  Trash2 as TrashIcon,
  X,
  Shield,
  FileCheck,
  Calendar,
  Clock,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../../api/api";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import CustomSelect from "../../components/common/CustomSelect";
import FormModal from "../../components/common/FormModal";
import CustomInput from "../../components/common/CustomInput";
import CustomTextarea from "../../components/common/CustomTextarea";
import { formatDate } from "../../utils/dateUtils";
import { isValidEmail, isValidPhone, isValidPersonName } from "../../utils/validators";
import { formatPhoneWithMask, phoneToMask } from "../../utils/phoneMask";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const handleApiError = (error) => {
  console.error("API Error:", error);
  if (error.response) {
    const { status, data } = error.response;
    if (status === 400) {
      if (data && data.details && typeof data.details === "object") {
        Object.entries(data.details).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`);
        });
      } else if (data && data.message) {
        toast.error(data.message);
      } else {
        toast.error("Ошибка валидации данных");
      }
    } else if (status === 409) {
      toast.error(data?.message || "Конфликт данных. Возможно, запись уже существует.");
    } else if (status >= 500) {
      toast.error("Внутренняя ошибка сервера. Попробуйте позже.");
    } else {
      toast.error(data?.message || `Ошибка ${status}: Не удалось выполнить операцию.`);
    }
  } else if (error.message) {
    toast.error(error.message);
  } else {
    toast.error("Неизвестная ошибка");
  }
};

export default function ApplicationEditModal({ application, onClose, onSuccess, publicMode = false }) {
  const isCreate = !application || !application.id;

  const [formData, setFormData] = useState({
    childLastName: "",
    childFirstName: "",
    childMiddleName: "",
    childBirthDate: "",
    childBirthPlace: "",
    childCitizenship: "",
    childAddress: "",
    childSnils: "",
    childIndividualPlan: false,
    childLastSchool: "",
    childGradeLevel: "",
    parentLastName: "",
    parentFirstName: "",
    parentMiddleName: "",
    parentPhone: "",
    parentEmail: "",
    parentRelation: "MOTHER",
    preferredProgramId: "",
    finalProgramId: "",
    consentPersonalData: false,
    consentPhotoVideo: false,
    consentMedicalIntervention: false,
    additionalInfo: "",
    status: "NEW",
    rejectionReason: "",
    assignedOfficerId: "",
    source: "SITE",
    submittedAt: null,
    reviewedAt: null,
    decisionAt: null,
    enrollmentDate: null,
    waitlistExpiryDate: null,
    internalNotes: "",
    officerComment: "",
  });

  const [status, setStatus] = useState("NEW");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [consentFile, setConsentFile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirmDialog = (title, message, onConfirm) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  useEffect(() => {
    loadPrograms();
    if (!publicMode) loadStaffUsers();
  }, [publicMode]);

  const loadPrograms = async () => {
    try {
      let programsList;
      if (publicMode) {
        const response = await fetch("http://localhost:8080/api/programs/public");
        if (!response.ok) throw new Error("Ошибка загрузки программ");
        programsList = await response.json();
      } else {
        programsList = await fetchAllPrograms();
      }
      setPrograms(programsList);
    } catch (err) {
      console.error("Ошибка загрузки программ:", err);
      toast.error("Не удалось загрузить список программ");
    }
  };

  const loadStaffUsers = async () => {
    try {
      const response = await API.get("/api/users/staff");
      setStaffUsers(response.data);
    } catch (err) {
      console.error("Ошибка загрузки сотрудников:", err);
    }
  };

  useEffect(() => {
    if (!publicMode && application?.id) {
      loadExistingFiles();
    }
  }, [application, publicMode]);

  const loadExistingFiles = async () => {
    try {
      const filesList = await getApplicationFiles(application.id);
      setExistingFiles(filesList);
    } catch (err) {
      console.error("Ошибка загрузки файлов:", err);
      toast.error("Не удалось загрузить список файлов");
    }
  };

  useEffect(() => {
    if (!isCreate && application) {
      setFormData({
        childLastName: application.childLastName || "",
        childFirstName: application.childFirstName || "",
        childMiddleName: application.childMiddleName || "",
        childBirthDate: application.childBirthDate || "",
        childBirthPlace: application.childBirthPlace || "",
        childCitizenship: application.childCitizenship || "",
        childAddress: application.childAddress || "",
        childSnils: application.childSnils || "",
        childIndividualPlan: application.childIndividualPlan || false,
        childLastSchool: application.childLastSchool || "",
        childGradeLevel: application.childGradeLevel || "",
        parentLastName: application.parentLastName || "",
        parentFirstName: application.parentFirstName || "",
        parentMiddleName: application.parentMiddleName || "",
        parentPhone: application.parentPhone ? phoneToMask(application.parentPhone) : "8",
        parentEmail: application.parentEmail || "",
        parentRelation: application.parentRelation || "MOTHER",
        preferredProgramId: application.preferredProgramId ? String(application.preferredProgramId) : "",
        finalProgramId: application.finalProgramId ? String(application.finalProgramId) : "",
        consentPersonalData: application.consentPersonalData ?? false,
        consentPhotoVideo: application.consentPhotoVideo ?? false,
        consentMedicalIntervention: application.consentMedicalIntervention ?? false,
        additionalInfo: application.additionalInfo || "",
        status: application.status || "NEW",
        rejectionReason: application.rejectionReason || "",
        assignedOfficerId: application.assignedOfficerId ? String(application.assignedOfficerId) : "",
        source: application.source || "SITE",
        submittedAt: application.submittedAt || null,
        reviewedAt: application.reviewedAt || null,
        decisionAt: application.decisionAt || null,
        enrollmentDate: application.enrollmentDate || null,
        waitlistExpiryDate: application.waitlistExpiryDate || null,
        internalNotes: application.internalNotes || "",
        officerComment: application.officerComment || "",
      });
      setStatus(application.status || "NEW");
    } else if (isCreate) {
      setFormData({
        childLastName: "",
        childFirstName: "",
        childMiddleName: "",
        childBirthDate: "",
        childBirthPlace: "",
        childCitizenship: "",
        childAddress: "",
        childSnils: "",
        childIndividualPlan: false,
        childLastSchool: "",
        childGradeLevel: "",
        parentLastName: "",
        parentFirstName: "",
        parentMiddleName: "",
        parentPhone: "8",
        parentEmail: "",
        parentRelation: "MOTHER",
        preferredProgramId: "",
        finalProgramId: "",
        consentPersonalData: false,
        consentPhotoVideo: false,
        consentMedicalIntervention: false,
        additionalInfo: "",
        status: "NEW",
        rejectionReason: "",
        assignedOfficerId: "",
        source: "SITE",
        submittedAt: null,
        reviewedAt: null,
        decisionAt: null,
        enrollmentDate: null,
        waitlistExpiryDate: null,
        internalNotes: "",
        officerComment: "",
      });
      setStatus("NEW");
      setFiles([]);
      setConsentFile(null);
    }
  }, [application, isCreate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleParentPhoneChange = (e) => {
    let raw = e.target.value;
    let digits = raw.replace(/\D/g, "");
    if (digits.length === 0) digits = "8";
    const masked = formatPhoneWithMask(digits);
    setFormData((prev) => ({ ...prev, parentPhone: masked }));
  };

  const handleConsentFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setConsentFile(e.target.files[0]);
    }
  };

  const handleFilesChange = (e) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removePendingFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteFile = async (fileId, fileName) => {
    openConfirmDialog(
      "Удаление файла",
      `Вы уверены, что хотите удалить файл "${fileName}" из данной заявки? Это действие нельзя отменить.`,
      async () => {
        try {
          setLoading(true);
          await deleteFile(fileId);
          toast.success("Файл удалён");
          await loadExistingFiles();
        } catch (err) {
          handleApiError(err);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "text-green-600",
      REVIEWED: "text-yellow-600",
      WAITING_DOCS: "text-orange-600",
      ACCEPTED: "text-blue-600",
      REJECTED: "text-red-600",
      WAITLIST: "text-purple-600",
    };
    return colors[status] || "text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      NEW: "Новая",
      REVIEWED: "На проверке",
      WAITING_DOCS: "Ожидает документы",
      ACCEPTED: "Принята",
      REJECTED: "Отклонена",
      WAITLIST: "В ожидании",
    };
    return texts[status] || status;
  };

  const validateForm = () => {
    if (!isValidPersonName(formData.childLastName, true)) {
      toast.error("Фамилия ребёнка должна содержать только буквы, дефис или пробел и быть не короче 2 символов");
      return false;
    }
    if (!isValidPersonName(formData.childFirstName, true)) {
      toast.error("Имя ребёнка должно содержать только буквы, дефис или пробел и быть не короче 2 символов");
      return false;
    }
    if (!isValidPersonName(formData.parentLastName, true)) {
      toast.error("Фамилия родителя должна содержать только буквы, дефис или пробел и быть не короче 2 символов");
      return false;
    }
    if (!isValidPersonName(formData.parentFirstName, true)) {
      toast.error("Имя родителя должно содержать только буквы, дефис или пробел и быть не короче 2 символов");
      return false;
    }

    let cleanPhone = formData.parentPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("8")) cleanPhone = "+" + cleanPhone;
    if (!isValidPhone(cleanPhone)) {
      toast.error("Телефон должен содержать только цифры (10–15) и может начинаться с '+'");
      return false;
    }
    if (!isValidEmail(formData.parentEmail)) {
      toast.error("Введите корректный email адрес");
      return false;
    }

    if (publicMode && !formData.consentPersonalData) {
      toast.error("Необходимо дать согласие на обработку персональных данных");
      return false;
    }

    if (status === "REJECTED" && !formData.rejectionReason.trim()) {
      toast.error("Укажите причину отказа");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let cleanPhone = formData.parentPhone.replace(/\D/g, "");
      if (cleanPhone.startsWith("8")) cleanPhone = "+7" + cleanPhone.slice(1);
      else if (cleanPhone.startsWith("7")) cleanPhone = "+" + cleanPhone;
      else if (cleanPhone.length > 0) cleanPhone = "+7" + cleanPhone;

      const payload = {
        childLastName: formData.childLastName,
        childFirstName: formData.childFirstName,
        childMiddleName: formData.childMiddleName,
        childBirthDate: formData.childBirthDate,
        childBirthPlace: formData.childBirthPlace || null,
        childCitizenship: formData.childCitizenship || null,
        childAddress: formData.childAddress || null,
        childSnils: formData.childSnils || null,
        childIndividualPlan: formData.childIndividualPlan,
        childLastSchool: formData.childLastSchool || null,
        childGradeLevel: formData.childGradeLevel || null,
        parentLastName: formData.parentLastName,
        parentFirstName: formData.parentFirstName,
        parentMiddleName: formData.parentMiddleName || null,
        parentRelation: formData.parentRelation,
        parentPhone: cleanPhone,
        parentEmail: formData.parentEmail,
        preferredProgramId: formData.preferredProgramId ? parseInt(formData.preferredProgramId, 10) : null,
        finalProgramId: formData.finalProgramId ? parseInt(formData.finalProgramId, 10) : null,
        consentPersonalData: formData.consentPersonalData,
        consentPhotoVideo: formData.consentPhotoVideo,
        consentMedicalIntervention: formData.consentMedicalIntervention,
        additionalInfo: formData.additionalInfo || null,
        status: status,
        rejectionReason: status === "REJECTED" ? formData.rejectionReason : null,
        assignedOfficerId: formData.assignedOfficerId ? parseInt(formData.assignedOfficerId, 10) : null,
        source: formData.source,
        enrollmentDate: formData.enrollmentDate || null,
        waitlistExpiryDate: formData.waitlistExpiryDate || null,
        internalNotes: formData.internalNotes || null,
        officerComment: formData.officerComment || null,
      };

      if (isCreate) {
        if (publicMode) {
          const formDataWithFile = new FormData();
          formDataWithFile.append("data", JSON.stringify(payload));
          if (consentFile) formDataWithFile.append("files", consentFile);
          const response = await fetch("http://localhost:8080/api/applications/create-with-files", {
            method: "POST",
            body: formDataWithFile,
            credentials: "omit",
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка создания заявки: ${errorText}`);
          }
          toast.success("Заявка успешно отправлена!");
        } else {
          const response = await API.post("/api/applications", payload);
          const createdApplication = response.data;
          if (files.length > 0) {
            const filesFormData = new FormData();
            files.forEach((file) => filesFormData.append("files", file));
            await API.post(
              `/api/files/upload?entityType=APPLICATION&entityId=${createdApplication.id}`,
              filesFormData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            toast.success("Файлы успешно загружены");
          }
          toast.success("Заявка успешно создана");
        }
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const updated = await updateApplication(application.id, payload);
        if (files.length > 0) {
          const filesFormData = new FormData();
          files.forEach((file) => filesFormData.append("files", file));
          await API.post(
            `/api/files/upload?entityType=APPLICATION&entityId=${application.id}`,
            filesFormData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          toast.success("Файлы успешно загружены");
        }
        toast.success("Изменения сохранены");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    openConfirmDialog(
      "Удаление заявки",
      `Вы уверены, что хотите удалить заявку №${application.id}? Это действие нельзя отменить.`,
      async () => {
        setLoading(true);
        try {
          await deleteApplication(application.id);
          toast.success("Заявка удалена");
          if (onSuccess) onSuccess();
          onClose();
        } catch (err) {
          handleApiError(err);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleStatusChange = async (newStatus) => {
    if (isCreate) return;
    if (newStatus === "REJECTED") {
      const reason = window.prompt("Укажите причину отказа:");
      if (!reason || !reason.trim()) {
        toast.error("Причина отказа обязательна");
        return;
      }
      openConfirmDialog(
        "Изменение статуса",
        `Вы уверены, что хотите отклонить заявку №${application.id} с причиной: "${reason}"?`,
        async () => {
          setLoading(true);
          try {
            await updateApplicationStatus(application.id, newStatus, reason);
            toast.success(`Статус изменён на "Отклонена"`);
            if (onSuccess) onSuccess();
            onClose();
          } catch (err) {
            handleApiError(err);
          } finally {
            setLoading(false);
          }
        }
      );
    } else {
      const statusText = getStatusText(newStatus);
      openConfirmDialog(
        "Изменение статуса",
        `Вы уверены, что хотите изменить статус заявки №${application.id} на "${statusText}"?`,
        async () => {
          setLoading(true);
          try {
            await updateApplicationStatus(application.id, newStatus);
            toast.success(`Статус изменён на "${statusText}"`);
            if (onSuccess) onSuccess();
            onClose();
          } catch (err) {
            handleApiError(err);
          } finally {
            setLoading(false);
          }
        }
      );
    }
  };

  const modalTitle = publicMode
    ? "Новая заявка на обучение"
    : isCreate
    ? "Новая заявка"
    : `Заявка №${application.id} от ${formatDate(application.createdAt)}`;

  const programOptions = programs.map((p) => ({ value: String(p.id), label: p.name }));
  const staffOptions = staffUsers.map((u) => ({ value: String(u.id), label: `${u.lastName} ${u.firstName}` }));
  const relationOptions = [
    { value: "MOTHER", label: "Мать" },
    { value: "FATHER", label: "Отец" },
    { value: "GUARDIAN", label: "Опекун" },
  ];
  const gradeOptions = [
    { value: "", label: "Не выбран" },
    { value: "1", label: "1 класс" }, { value: "2", label: "2 класс" }, { value: "3", label: "3 класс" },
    { value: "4", label: "4 класс" }, { value: "5", label: "5 класс" }, { value: "6", label: "6 класс" },
    { value: "7", label: "7 класс" }, { value: "8", label: "8 класс" }, { value: "9", label: "9 класс" },
    { value: "10", label: "10 класс" }, { value: "11", label: "11 класс" },
  ];
  const statusOptions = [
    { value: "NEW", label: "Новая" }, { value: "REVIEWED", label: "На проверке" },
    { value: "WAITING_DOCS", label: "Ожидает документы" }, { value: "ACCEPTED", label: "Принята" },
    { value: "REJECTED", label: "Отклонена" }, { value: "WAITLIST", label: "В ожидании" },
  ];
  const sourceOptions = [
    { value: "SITE", label: "Сайт" }, { value: "PHONE", label: "Телефон" },
    { value: "MANUAL", label: "Ручной ввод" }, { value: "EMAIL", label: "Email" },
  ];

  const isRejected = status === "REJECTED";
  const isAccepted = status === "ACCEPTED";
  const disableAccept = isAccepted;
  const disableReject = isAccepted || isRejected;

  return (
    <>
      <FormModal title={modalTitle} onClose={onClose}>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 pt-4 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto">
          {/* ДАННЫЕ РЕБЁНКА */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <Users size={18} className="text-[#f6a623]" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Данные ребёнка</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomInput label="Фамилия" name="childLastName" value={formData.childLastName} onChange={handleChange} required placeholder="Фамилия" />
              <CustomInput label="Имя" name="childFirstName" value={formData.childFirstName} onChange={handleChange} required placeholder="Имя" />
              <CustomInput label="Отчество" name="childMiddleName" value={formData.childMiddleName} onChange={handleChange} placeholder="Отчество" />
              <CustomDatePicker
                selected={formData.childBirthDate ? new Date(formData.childBirthDate) : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    setFormData((prev) => ({ ...prev, childBirthDate: `${year}-${month}-${day}` }));
                  } else {
                    setFormData((prev) => ({ ...prev, childBirthDate: "" }));
                  }
                }}
                placeholder="Выберите дату рождения"
                label="Дата рождения"
                required
                maxDate={new Date()}
                isClearable
              />
              <CustomInput label="Место рождения" name="childBirthPlace" value={formData.childBirthPlace} onChange={handleChange} placeholder="Место рождения" />
              <CustomInput label="Гражданство" name="childCitizenship" value={formData.childCitizenship} onChange={handleChange} placeholder="Гражданство" />
              <div className="sm:col-span-2">
                <CustomInput label="Адрес" name="childAddress" value={formData.childAddress} onChange={handleChange} icon={MapPin} placeholder="Адрес" />
              </div>
              <CustomInput label="СНИЛС" name="childSnils" value={formData.childSnils} onChange={handleChange} placeholder="XXX-XXX-XXX XX" />
              <CustomSelect
                value={formData.childGradeLevel}
                onChange={(val) => setFormData((prev) => ({ ...prev, childGradeLevel: val }))}
                options={gradeOptions}
                label="Класс / уровень"
                placeholder="Выберите класс"
                clearable={true}
              />
              <div className="sm:col-span-2">
                <CustomInput label="Предыдущая школа" name="childLastSchool" value={formData.childLastSchool} onChange={handleChange} placeholder="Предыдущее учебное заведение" />
              </div>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  name="childIndividualPlan"
                  type="checkbox"
                  checked={formData.childIndividualPlan}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#f6a623] focus:ring-[#f6a623]"
                />
                <span className="text-sm text-gray-700">Нуждается в индивидуальном плане обучения</span>
              </label>
            </div>
          </div>

          {/* ДАННЫЕ РОДИТЕЛЯ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <User size={18} className="text-[#f6a623]" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Данные родителя</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomInput label="Фамилия" name="parentLastName" value={formData.parentLastName} onChange={handleChange} required placeholder="Фамилия" />
              <CustomInput label="Имя" name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} required placeholder="Имя" />
              <CustomInput label="Отчество" name="parentMiddleName" value={formData.parentMiddleName} onChange={handleChange} placeholder="Отчество" />
              <CustomInput label="Телефон" name="parentPhone" value={formData.parentPhone} onChange={handleParentPhoneChange} required icon={Phone} placeholder="+7 (___) ___-__-__" />
              <div className="sm:col-span-2">
                <CustomInput label="Email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} required icon={Mail} placeholder="example@domain.com" />
              </div>
              <div className="sm:col-span-2">
                <CustomSelect
                  value={formData.parentRelation}
                  onChange={(val) => setFormData((prev) => ({ ...prev, parentRelation: val }))}
                  options={relationOptions}
                  label="Кем приходится родитель"
                  required
                  clearable={false}
                />
              </div>
            </div>
          </div>

          {/* ПРОГРАММЫ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <BookOpen size={18} className="text-[#f6a623]" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Программы</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publicMode ? (
                <div className="sm:col-span-2">
                  <CustomSelect
                    value={formData.preferredProgramId}
                    onChange={(val) => setFormData((prev) => ({ ...prev, preferredProgramId: val }))}
                    options={programOptions}
                    label="Выберите программу"
                    placeholder="Выберите программу"
                    required
                    clearable={false}
                  />
                </div>
              ) : (
                <>
                  <CustomSelect
                    value={formData.preferredProgramId}
                    onChange={(val) => setFormData((prev) => ({ ...prev, preferredProgramId: val }))}
                    options={programOptions}
                    label="Предпочитаемая программа"
                    placeholder="Выберите программу"
                    clearable={false}
                  />
                  <CustomSelect
                    value={formData.finalProgramId}
                    onChange={(val) => setFormData((prev) => ({ ...prev, finalProgramId: val }))}
                    options={programOptions}
                    label="Итоговый выбор"
                    placeholder="Выберите программу"
                    required
                    clearable={false}
                  />
                </>
              )}
            </div>
          </div>

          {/* СОГЛАСИЯ (только для публичной формы) */}
          {publicMode && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <FileCheck size={18} className="text-[#f6a623]" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Согласия</h3>
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    name="consentPersonalData"
                    type="checkbox"
                    checked={formData.consentPersonalData}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#f6a623] focus:ring-[#f6a623]"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    Я даю согласие на обработку моих персональных данных *
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    name="consentPhotoVideo"
                    type="checkbox"
                    checked={formData.consentPhotoVideo}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#f6a623] focus:ring-[#f6a623]"
                  />
                  <span className="text-sm text-gray-700">
                    Я согласен(на) на фото- и видеосъёмку
                  </span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    name="consentMedicalIntervention"
                    type="checkbox"
                    checked={formData.consentMedicalIntervention}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#f6a623] focus:ring-[#f6a623]"
                  />
                  <span className="text-sm text-gray-700">
                    Я даю согласие на оказание первой медицинской помощи
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* ОБРАБОТКА ЗАЯВКИ (только для менеджеров) */}
          {!publicMode && !isCreate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Shield size={18} className="text-[#f6a623]" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Обработка заявки</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CustomSelect
                  value={formData.assignedOfficerId}
                  onChange={(val) => setFormData((prev) => ({ ...prev, assignedOfficerId: val }))}
                  options={staffOptions}
                  label="Ответственный сотрудник"
                  placeholder="Назначить сотрудника"
                  clearable={true}
                />
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val)}
                  options={statusOptions}
                  label="Статус заявки"
                  required
                />
                {isRejected && (
                  <CustomTextarea
                    name="rejectionReason"
                    value={formData.rejectionReason}
                    onChange={handleChange}
                    placeholder="Причина отказа"
                    label="Причина отказа"
                    rows={2}
                  />
                )}
              </div>
            </div>
          )}

          {/* ДОПОЛНИТЕЛЬНЫЕ ДАТЫ */}
          {!publicMode && !isCreate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <Calendar size={18} className="text-[#f6a623]" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Дополнительные даты</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomDatePicker
                  selected={formData.enrollmentDate ? new Date(formData.enrollmentDate) : null}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      enrollmentDate: date ? date.toISOString().split("T")[0] : null,
                    }))
                  }
                  placeholder="Дата зачисления"
                  label="Дата зачисления"
                  maxDate={new Date()}
                  isClearable
                />
                <CustomDatePicker
                  selected={formData.waitlistExpiryDate ? new Date(formData.waitlistExpiryDate) : null}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      waitlistExpiryDate: date ? date.toISOString().split("T")[0] : null,
                    }))
                  }
                  placeholder="Дата окончания листа ожидания"
                  label="Дата окончания листа ожидания"
                  isClearable
                />
              </div>
            </div>
          )}

          {/* КОММЕНТАРИИ */}
          {!publicMode && !isCreate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <AlertCircle size={18} className="text-[#f6a623]" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Комментарии и заметки</h3>
              </div>
              <div className="space-y-3">
                <CustomTextarea
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleChange}
                  placeholder="Внутренние заметки"
                  label="Внутренние заметки"
                  rows={2}
                />
                <CustomTextarea
                  name="officerComment"
                  value={formData.officerComment}
                  onChange={handleChange}
                  placeholder="Комментарий для родителя"
                  label="Комментарий для родителя"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <Info size={18} className="text-[#f6a623]" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Дополнительная информация</h3>
            </div>
            <CustomTextarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Дополнительные комментарии или пожелания..."
              rows={3}
            />
          </div>

          {/* ФАЙЛЫ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              <FileText size={18} className="text-[#f6a623]" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {publicMode ? "Согласие (файл)" : "Файлы заявки"}
              </h3>
            </div>
            {publicMode ? (
              <div>
                <label className="flex items-center gap-2 cursor-pointer bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg px-4 py-3 hover:bg-orange-100 transition">
                  <Upload size={18} className="text-orange-500" />
                  <span className="text-orange-600 text-sm">{consentFile ? consentFile.name : "Прикрепить файл"}</span>
                  <input type="file" onChange={handleConsentFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" />
                </label>
                {consentFile && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                    <Check size={14} />
                    <span className="text-sm">{consentFile.name}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {!isCreate && existingFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Загруженные файлы:</p>
                    {existingFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText size={14} className="text-[#f6a623] shrink-0" />
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#f6a623] text-sm truncate hover:underline">
                            {file.fileName}
                          </a>
                          <span className="text-xs text-gray-500">({Math.round(file.fileSize / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file.id, file.fileName)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer bg-orange-50 border-2 border-dashed border-[#f6a623] rounded-lg px-4 py-3 hover:bg-orange-100 transition">
                    <Upload size={18} className="text-[#f6a623]" />
                    <span className="text-[#f6a623] text-sm">Добавить файлы</span>
                    <input type="file" multiple onChange={handleFilesChange} className="hidden" />
                  </label>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                          <span className="text-sm text-gray-700 truncate">{file.name}</span>
                          <button type="button" onClick={() => removePendingFile(idx)} className="text-red-500 p-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* КНОПКИ ДЕЙСТВИЙ */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#f6a623] text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 text-sm sm:text-base"
            >
              <Save size={18} />
              {loading ? "Сохранение..." : (publicMode ? "Отправить" : (isCreate ? "Создать" : "Сохранить"))}
            </button>
            {!publicMode && !isCreate && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("ACCEPTED")}
                  disabled={loading || disableAccept}
                  className="bg-[#f6a623] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 text-sm"
                >
                  <Check size={16} /> Принять
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={loading || disableReject}
                  className="bg-[#f6a623] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 text-sm"
                >
                  <XCircle size={16} /> Отклонить
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-[#f6a623] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 text-sm"
                >
                  <TrashIcon size={16} /> Удалить
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Отмена
            </button>
          </div>
        </form>
      </FormModal>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
      />
    </>
  );
}