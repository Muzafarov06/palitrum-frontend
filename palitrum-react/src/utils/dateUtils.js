// src/utils/dateUtils.js

/**
 * Форматирует дату (ISO или Date объект) в строку "дд.мм.гггг"
 * @param {string|Date} dateString - исходная дата
 * @returns {string} отформатированная дата
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return "";
  }
};

/**
 * Форматирует дату+время в "дд.мм.гггг чч:мм"
 * @param {string|Date} dateTimeStr - исходная дата
 * @returns {string} отформатированная строка
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};