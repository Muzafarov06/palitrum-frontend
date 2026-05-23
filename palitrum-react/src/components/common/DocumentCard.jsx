// src/components/common/DocumentCard.jsx
import React from "react";
import { FileText, Download } from "lucide-react";

export default function DocumentCard({ title, fileUrl }) {
  return (
    <a
      href={fileUrl}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow hover:shadow-lg transition hover:bg-[#FFF4E5]"
    >
      <div className="flex items-center gap-3">
        <FileText size={24} className="text-[var(--accent)]" />
        <span className="font-medium">{title}</span>
      </div>
      <Download size={20} className="text-gray-500" />
    </a>
  );
}