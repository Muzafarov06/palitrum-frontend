import React, { useState, useEffect } from "react";
import FormModal from "../../common/FormModal";
import CustomInput from "../../common/CustomInput";
import CustomSelect from "../../common/CustomSelect";
import { toast } from "react-toastify";
import { Upload, X } from "lucide-react";
import { getFilesByEntity } from "../../../api/api";

export default function RoomFormModal({ isOpen, onClose, onSubmit, roomTypes, initialData = null }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [existingImageId, setExistingImageId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "");
      setCapacity(initialData.capacity || "");
      loadExistingImage(initialData.id);
      setIsImageDeleted(false);
    } else {
      setName("");
      setType("");
      setCapacity("");
      setExistingImageId(null);
      setImagePreview(null);
      setIsImageDeleted(false);
    }
    setImageFile(null);
  }, [initialData, isOpen]);

  const loadExistingImage = async (roomId) => {
    try {
      const files = await getFilesByEntity("ROOM", roomId);
      if (files && files.length > 0) {
        const imageData = files[0];
        setExistingImageId(imageData.id);
        setImagePreview(imageData.fileUrl);
      } else {
        setExistingImageId(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Ошибка загрузки изображения:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setExistingImageId(null);
      setIsImageDeleted(false);
    } else {
      toast.warning("Пожалуйста, выберите изображение");
      setImageFile(null);
    }
  };

  const handleDeleteExistingImage = () => {
    if (!initialData?.id) return;
    setIsImageDeleted(true);
    setImagePreview(null);
    setExistingImageId(null);
    setImageFile(null);
    toast.info("Изображение будет удалено после сохранения");
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Название помещения обязательно");
      return;
    }
    if (!type) {
      toast.error("Выберите тип помещения");
      return;
    }
    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast.error("Вместимость должна быть положительным числом");
      return;
    }

    const roomData = {
      name: name.trim(),
      type,
      capacity: capacityNum,
    };

    setUploading(true);
    try {
      await onSubmit(roomData, imageFile, isImageDeleted, initialData?.id);
      onClose();                 // сработает только при успехе
    } catch (err) {
      // ошибка уже показана, но onClose не вызывается – модалка остаётся
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const typeOptions = roomTypes.map(t => ({ value: t.value, label: t.label }));

  return (
    <FormModal title={initialData ? "Редактировать помещение" : "Добавить помещение"} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomInput
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Название помещения"
        />
        <CustomSelect
          label="Тип помещения"
          value={type}
          onChange={setType}
          options={typeOptions}
          placeholder="Выберите тип"
          required
          clearable={false}
        />
        <CustomInput
          label="Вместимость (человек)"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
          placeholder="Количество мест"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <div className="flex items-start gap-3">
            {imagePreview && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={imagePreview} alt="Превью" className="w-full h-full object-cover" />
                {existingImageId && !isImageDeleted && (
                  <button
                    type="button"
                    onClick={handleDeleteExistingImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    title="Удалить изображение"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition">
              <Upload size={18} className="text-[#f6a623]" />
              <span className="text-sm text-gray-600">
                {imageFile ? imageFile.name : (existingImageId && !isImageDeleted ? "Заменить изображение" : "Выбрать изображение")}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">Рекомендуемый размер: до 5 МБ, форматы JPG, PNG, WEBP</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#ad7822] transition disabled:opacity-50"
        >
          {uploading ? "Сохранение..." : (initialData ? "Сохранить изменения" : "Добавить")}
        </button>
      </div>
    </FormModal>
  );
}