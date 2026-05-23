// src/constants/fileConstants.js
export const FILE_ENTITY_TYPE_LABELS = {
  APPLICATION: "Заявки",
  PROGRAM: "Программы",
  GALLERY: "Галерея",
  DEPARTMENT: "Отделения",
  SUBJECT: "Предметы",
  NEWS: "Новости",
  ROOM: "Помещения",
  USER: "Пользователм",
  ROLE: "Роли"
};

// Для удобства получаем массив опций для выпадающего списка
export const getFileTypeOptions = () => [
  { value: "", label: "Все типы" },
  ...Object.entries(FILE_ENTITY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
];