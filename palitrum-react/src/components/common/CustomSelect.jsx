import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Выберите значение",
  label = null,
  required = false,
  className = "",
  disabled = false,
  clearable = false,
  onClear = null,
  dropdownMaxHeight = "300px",
  ...rest
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) onClear();
    else onChange("");
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div>
        <div 
          className={`
            h-10 w-full rounded-lg shadow-sm bg-white border flex items-center justify-between 
            hover:border-[#f6a623] transition-all duration-200 focus-within:ring-2 
            focus-within:ring-[#f6a623]/20 focus-within:border-[#f6a623] group cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
            ${isOpen ? 'border-[#f6a623] ring-2 ring-[#f6a623]/20' : 'border-gray-200'}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`
            flex-1 px-3 text-sm truncate
            ${value ? 'text-gray-900' : 'text-gray-400'}
          `}>
            {displayValue}
          </span>
          <div className="flex items-center gap-1 mr-2">
            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              >
                ×
              </button>
            )}
            <ChevronDown className={`
              w-4 h-4 text-gray-400 transition-transform duration-200
              ${isOpen ? 'rotate-180' : ''}
            `} />
          </div>
        </div>

        {isOpen && !disabled && (
          <div 
            className="absolute mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-y-auto z-30 hide-scrollbar"
            style={{ minWidth: "200px", maxHeight: dropdownMaxHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-2 text-sm text-left transition-all duration-200
                    hover:bg-[#f6a623]/10 hover:text-[#f6a623]
                    ${value === option.value ? 'bg-[#f6a623]/10 text-[#f6a623] font-medium' : 'text-gray-700'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {option.icon && (
                      <span className="w-4 h-4 text-gray-400">
                        {option.icon}
                      </span>
                    )}
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Глобальные стили для скрытия скролла */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE и Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}