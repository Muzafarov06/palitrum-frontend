// src/components/common/IconButton.jsx
import React from "react";

export default function IconButton({
  onClick,
  title,
  icon: Icon,
  className = "",
  bgColor = "bg-white",               // по умолчанию белый фон (как у полей)
  textColor = "text-gray-600",        // по умолчанию серая иконка
  hoverShadow = false,                // тень при наведении – по желанию (для однообразия с селектом лучше без тени)
  rounded = "rounded-lg",             // закругление как у селекта
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        h-9 w-9 ${rounded} transition-all duration-200
        flex items-center justify-center
        border border-gray-200
        ${bgColor} ${textColor}
        hover:border-[#f6a623]
        focus:outline-none focus:ring-2 focus:ring-[#f6a623]/20 focus:border-[#f6a623]
        ${hoverShadow ? "hover:shadow-md" : ""}
        ${className}
      `}
    >
      {Icon && <Icon size={18} />}
    </button>
  );
}