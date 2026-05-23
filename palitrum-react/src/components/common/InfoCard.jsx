// src/components/common/InfoCard.jsx
import React from "react";

export default function InfoCard({ icon: Icon, title, text, color = "var(--accent)" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-[#FFF9F2] transition flex flex-col items-center text-center gap-3">
      <Icon size={32} className={`text-[${color}]`} />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}