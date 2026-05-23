// src/components/common/CustomTextarea.jsx
import React from 'react';

export default function CustomTextarea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  rows = 3,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent transition resize-none"
      />
    </div>
  );
}