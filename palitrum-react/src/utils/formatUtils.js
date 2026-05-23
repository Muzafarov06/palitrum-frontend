// utils/formatUtils.js

/**
 * Форматирование количества лет (для программ)
 * @param {number} duration - количество лет
 * @returns {string} отформатированная строка
 */
export const formatYears = (duration) => {
  if (!duration) return "";
  const lastDigit = duration % 10;
  const lastTwoDigits = duration % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${duration} лет`;
  if (lastDigit === 1) return `${duration} год`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${duration} года`;
  return `${duration} лет`;
};

/**
 * Форматирование количества часов в неделю (для предметов)
 * @param {number} hours - количество часов
 * @returns {string} отформатированная строка
 */
export const formatHours = (hours) => {
  if (!hours || hours === 0) return "";
  const lastDigit = hours % 10;
  const lastTwo = hours % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return `${hours} часов`;
  if (lastDigit === 1) return `${hours} час`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${hours} часа`;
  return `${hours} часов`;
};