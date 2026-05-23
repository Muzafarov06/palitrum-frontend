// src/components/common/AccordionSection.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Folder } from "lucide-react";

export default function AccordionSection({ title, items, renderItem }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <div
        className="flex justify-between items-center p-6 cursor-pointer bg-[#FFF9F2] hover:bg-[#FFF4E6] transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Folder size={28} className="text-[var(--accent)]" />
          <p className="font-semibold text-xl">{title}</p>
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </div>
      {isOpen && (
        <div className="p-6 grid md:grid-cols-2 gap-4 bg-white border-t">
          {items.map((item, idx) => renderItem(item, idx))}
        </div>
      )}
    </div>
  );
}