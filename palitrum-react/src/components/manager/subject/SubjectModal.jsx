import React, { useState, useEffect } from 'react';
import FormModal from '../../../components/common/FormModal';
import CustomInput from '../../../components/common/CustomInput';
import CustomTextarea from '../../../components/common/CustomTextarea';
import CustomSelect from '../../../components/common/CustomSelect';
import { toast } from 'react-toastify';
import { uploadFiles, getFilesByEntity, deleteFile, updateSubject } from '../../../api/api';
import { X, Upload } from 'lucide-react';

const LESSON_TYPE_OPTIONS = [
  { value: 'GROUP', label: 'Групповое' },
  { value: 'INDIVIDUAL', label: 'Индивидуальное' },
];

export default function SubjectModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [standardHoursPerWeek, setStandardHoursPerWeek] = useState('');
  const [lessonType, setLessonType] = useState('GROUP');
  const [minGroupSize, setMinGroupSize] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingFileId, setExistingFileId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData?.id) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setStandardHoursPerWeek(initialData.standardHoursPerWeek || '');
      setLessonType(initialData.lessonType || 'GROUP');
      setMinGroupSize(initialData.minGroupSize || '');
      setMaxGroupSize(initialData.maxGroupSize || '');
      loadExistingImage(initialData.id);
    } else {
      resetForm();
    }
  }, [isOpen, initialData]);

  // При изменении типа занятий автоматически устанавливаем размеры группы
  useEffect(() => {
    if (lessonType === 'INDIVIDUAL') {
      setMinGroupSize('1');
      setMaxGroupSize('1');
    } else if (lessonType === 'GROUP') {
      // Если поля пустые, оставляем пустыми (пользователь введёт сам)
      if (!minGroupSize) setMinGroupSize('');
      if (!maxGroupSize) setMaxGroupSize('');
    }
  }, [lessonType]);

  const resetForm = () => {
    setCode('');
    setName('');
    setDescription('');
    setStandardHoursPerWeek('');
    setLessonType('GROUP');
    setMinGroupSize('');
    setMaxGroupSize('');
    setExistingImageUrl(null);
    setExistingFileId(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const loadExistingImage = async (subjectId) => {
    try {
      const files = await getFilesByEntity('SUBJECT', subjectId);
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
    setUploading(true);
    try {
      await deleteFile(existingFileId);
      if (initialData?.id) {
        await updateSubject(initialData.id, { imageUrl: null });
      }
      setExistingImageUrl(null);
      setExistingFileId(null);
      setImagePreview(null);
      toast.success('Изображение удалено');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Ошибка удаления изображения');
    } finally {
      setUploading(false);
    }
  };

  // Фильтр для полей размера группы: только цифры
  const handleNumberInput = (setter) => (e) => {
    const rawValue = e.target.value;
    // Убираем всё, кроме цифр
    const numericValue = rawValue.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Название предмета обязательно');
      return;
    }
    const subjectData = {
      code: code.trim() || null,
      name: name.trim(),
      description: description.trim() || null,
      standardHoursPerWeek: standardHoursPerWeek ? Number(standardHoursPerWeek) : 0,
      lessonType: lessonType,
      minGroupSize: lessonType === 'INDIVIDUAL' ? 1 : (minGroupSize ? Number(minGroupSize) : null),
      maxGroupSize: lessonType === 'INDIVIDUAL' ? 1 : (maxGroupSize ? Number(maxGroupSize) : null),
    };
    setUploading(true);
    try {
      let savedSubject;
      if (initialData?.id) {
        savedSubject = await onSubmit(subjectData);
      } else {
        savedSubject = await onSubmit(subjectData);
      }

      if (imageFile) {
        if (existingFileId) {
          await deleteFile(existingFileId);
        }
        const formData = new FormData();
        formData.append('files', imageFile);
        const uploadResponse = await uploadFiles(savedSubject.id, 'SUBJECT', formData);
        const uploadedFile = uploadResponse?.[0];
        if (uploadedFile?.fileUrl) {
          await updateSubject(savedSubject.id, { imageUrl: uploadedFile.fileUrl });
          savedSubject.imageUrl = uploadedFile.fileUrl;
        }
        toast.success('Изображение загружено');
      }

      toast.success(initialData ? 'Предмет обновлён' : 'Предмет создан');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Ошибка сохранения предмета');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const isGroup = lessonType === 'GROUP';

  return (
    <FormModal title={initialData ? 'Редактировать предмет' : 'Новый предмет'} onClose={onClose}>
      <div className="p-6 pt-4 space-y-4">
        <CustomInput label="Код предмета" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Например, PIANO101" />
        <CustomInput label="Название" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Название предмета" />
        <CustomTextarea label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание (необязательно)" rows={3} />
        <CustomInput label="Часов в неделю (базово)" type="number" value={standardHoursPerWeek} onChange={(e) => setStandardHoursPerWeek(e.target.value)} placeholder="0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Тип занятий"
            value={lessonType}
            onChange={setLessonType}
            options={LESSON_TYPE_OPTIONS}
            required
          />
          {/* Поля размера группы – обычные input с типом number и фильтрацией */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мин. размер группы</label>
            <input
              type="text"  // используем text, но фильтруем ввод только цифр
              value={minGroupSize}
              onChange={handleNumberInput(setMinGroupSize)}
              placeholder={isGroup ? "4" : "1"}
              disabled={!isGroup}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Макс. размер группы</label>
            <input
              type="text"
              value={maxGroupSize}
              onChange={handleNumberInput(setMaxGroupSize)}
              placeholder={isGroup ? "10" : "1"}
              disabled={!isGroup}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <div className="flex items-start gap-3 flex-wrap">
            {imagePreview && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={imagePreview} alt="Превью" className="w-full h-full object-cover" />
                {existingFileId && (
                  <button type="button" onClick={handleDeleteImage} disabled={uploading} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 disabled:opacity-50">
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
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-1">Рекомендуемый размер: до 5 МБ, форматы JPG, PNG, WEBP</p>
        </div>

        <button onClick={handleSubmit} disabled={uploading} className="w-full bg-[#f6a623] text-white py-2 rounded-lg hover:bg-[#e09515] transition disabled:opacity-50">
          {uploading ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Создать')}
        </button>
      </div>
    </FormModal>
  );
}