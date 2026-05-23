export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => /^\+?\d{10,15}$/.test(phone);

export const isValidBirthDate = (value) => {
  if (!value) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) return false;
  const date = new Date(value);
  const now = new Date();
  if (isNaN(date.getTime())) return false;
  if (date > now) return false;
  if (date.getFullYear() < 1900) return false;
  return true;
};

export const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split(".");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const isValidPersonName = (name, required = true) => {
  if (!name || name.trim().length === 0) return !required;
  if (name.trim().length < 2) return false;
  const regex = /^[a-zA-Zа-яА-ЯёЁ\s\-']+$/;
  return regex.test(name.trim());
};