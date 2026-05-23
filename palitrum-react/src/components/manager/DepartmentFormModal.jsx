import React, { useState, useEffect } from 'react';
import FormModal from '../../components/common/FormModal';
import CustomInput from '../../components/common/CustomInput';
import CustomTextarea from '../../components/common/CustomTextarea';
import { toast } from 'react-toastify';
import { uploadFiles, getFilesByEntity, deleteFile } from '../../api/api';
import { X, Upload } from 'lucide-react';

export default function DepartmentFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingFileId, setExistingFileId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Загрузка существующего изображения при редактировании
  useEffect(() => {
    if (!isOpen) return;
    if (initialData?.id) {
      loadExistingImage(initialData.id);
    } else {
      setExistingImageUrl(null);
      setExistingFileId(null);
      setImagePreview(null);
    }
  }, [isOpen, initialData]);

  const loadExistingImage = async (deptId) => {
    try {
      const files = await getFilesByEntity('DEPARTMENT', deptId);
      if (files && files.length > 0) {
        const file = files[0];
        setExistingImageUrl(file.fileUrl);
        setExistingFileId(file.id);
        setImagePreview(file.fileUrl);
      } else {
        setExistingImageUrl(null);
        setExistingFileId(null);
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.warning('Пожалуйста, выберите изображение');
      setImageFile(null);
      setImagePreview(existingImageUrl);
    }
  };

  const handleDeleteImage = async () => {
    if (!existingFileId) return;
    if (!window.confirm('Удалить текущее изображение?')) return;
    try {
      await deleteFile(existingFileId);
      setExistingImageUrl(null);
      setExistingFileId(null);
      setImagePreview(null);
      toast.success('Изображение удалено');
    } catch (err) {
      console.error(err);
      toast.error('Ошибка удаления');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Название отделения обязательно');
      return;
    }

    const departmentData = {
      name: name.trim(),
      description: description.trim() || null,
      parentId: initialData?.parentId || null,
    };

    setUploading(true);
    try {
      let savedDepartment;
      if (initialData?.id) {
        // Редактирование – обновляем данные отделения
        savedDepartment = await onSubmit(departmentData);
      } else {
        // Создание – получаем созданное отделение с id
        savedDepartment = await onSubmit(departmentData);
      }

      // Если выбран новый файл – заменяем изображение
      if (imageFile) {
        // Удаляем старое, если было
        if (existingFileId) {
          await deleteFile(existingFileId);
        }
        // Загружаем новое
        const formData = new FormData();
        formData.append('files', imageFile);
        await uploadFiles(savedDepartment.id, 'DEPARTMENT', formData);
        toast.success('Изображение загружено');
      }

      toast.success(initialData ? 'Отделение обновлено' : 'Отделение создано');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Ошибка сохранения отделения');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <FormModal title={initialData ? 'Редактировать отделение' : 'Добавить отделение'} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomInput
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Название отделения"
        />
        <CustomTextarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание (необязательно)"
          rows={3}
        />

        {/* Блок изображения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <div className="flex items-start gap-3">
            {imagePreview && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={imagePreview} alt="Превью" className="w-full h-full object-cover" />
                {existingFileId && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
            <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition">
              <Upload size={18} className="text-[#f6a623]" />
              <span className="text-sm text-gray-600">
                {imageFile ? imageFile.name : (existingImageUrl ? 'Заменить изображение' : 'Выбрать изображение')}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
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
          {uploading ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Добавить')}
        </button>
      </div>
    </FormModal>
  );
}