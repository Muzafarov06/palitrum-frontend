// src/components/common/CustomInput.jsx
import React from 'react';

export default function CustomInput({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = '',
  type = 'text',
  icon: Icon = null,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9 pr-3' : 'px-3'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent transition`}
        />
      </div>
    </div>
  );
}