// src/components/common/IconLinkCard.jsx
import React from "react";
import { ExternalLink } from "lucide-react";

export default function IconLinkCard({ icon: Icon, title, href, external = true }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex justify-between items-center gap-4 p-6 rounded-2xl border bg-white shadow-md hover:shadow-xl hover:bg-[#FFF4E5] transition transform hover:-translate-y-1"
    >
      <div className="flex items-start gap-3 flex-1">
        <Icon size={26} className="text-[var(--accent)] mt-1 shrink-0" />
        <span className="text-gray-800 font-medium">{title}</span>
      </div>
      <ExternalLink size={22} className="text-gray-400 group-hover:text-[var(--accent)]" />
    </a>
  );
}