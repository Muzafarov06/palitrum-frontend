// src/utils/phoneMask.js

/**
 * Форматирует строку цифр в маску телефона: 8 (xxx) xxx-xx-xx
 * @param {string} digits - строка из цифр
 * @returns {string} отформатированный телефон
 */
export const formatPhoneWithMask = (digits) => {
  if (!digits) return '8';
  let clean = digits.replace(/\D/g, '');
  if (clean.length === 0) return '8';
  if (clean[0] !== '8') clean = '8' + clean;
  if (clean.length > 11) clean = clean.slice(0, 11);
  let formatted = '';
  if (clean.length >= 1) formatted = clean[0];
  if (clean.length >= 2) formatted += ' (' + clean.slice(1, 4);
  if (clean.length >= 5) formatted += ') ' + clean.slice(4, 7);
  if (clean.length >= 8) formatted += '-' + clean.slice(7, 9);
  if (clean.length >= 10) formatted += '-' + clean.slice(9, 11);
  return formatted;
};

/**
 * Преобразует сохранённый телефон (возможно, с разными символами) в маску
 * @param {string} phone - телефон (может быть пустым)
 * @returns {string} отформатированный телефон
 */
export const phoneToMask = (phone) => {
  if (!phone) return '8';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('7')) digits = '8' + digits.slice(1);
  if (digits.startsWith('8') && digits.length === 11) return formatPhoneWithMask(digits);
  if (digits.length > 0) return formatPhoneWithMask(digits);
  return '8';
};

/**
 * Обработчик события onChange для поля телефона.
 * @param {function} setFormData - setter состояния формы
 * @returns {function} обработчик
 */
export const createPhoneChangeHandler = (setFormData) => (e) => {
  let raw = e.target.value;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 0) digits = '8';
  const masked = formatPhoneWithMask(digits);
  setFormData(prev => ({ ...prev, phone: masked }));
};