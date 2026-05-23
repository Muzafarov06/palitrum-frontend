import React from "react";
import { Search, X } from "lucide-react";

export default function CustomSearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Поиск ...",
  setPage,
}) {
  const handleChange = (e) => {
    onChange(e.target.value);
    if (setPage) setPage(0);
  };

  const handleClear = () => {
    onChange("");
    if (setPage) setPage(0);
    if (onClear) onClear();
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      <div
        className={`
          h-10 w-full rounded-lg shadow-sm bg-white border flex items-center
          hover:border-[#f6a623] transition-all duration-200
          focus-within:ring-2 focus-within:ring-[#f6a623]/20 focus-within:border-[#f6a623]
          group
        `}
      >
        <Search className="ml-3 w-4 h-4 text-gray-400 group-hover:text-[#f6a623] transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className="w-full px-2 py-2 bg-transparent border-0 outline-none focus:ring-0 text-gray-900 text-sm placeholder:text-gray-400"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}