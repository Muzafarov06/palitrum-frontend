import React from "react";
import { Clipboard, Sparkles, AlertTriangle, Inbox } from "lucide-react";

const statItems = [
  { key: "total", label: "Всего", Icon: Clipboard },
  { key: "newAll", label: "Новые", Icon: Sparkles },
  { key: "urgent", label: "Срочные", Icon: AlertTriangle },
  { key: "awaitingInfo", label: "Ждут данных", Icon: Inbox },
];

export default function StatsCards({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((s) => (
        <div key={s.key} className="bg-white rounded-xl shadow p-4 flex items-center gap-4 w-full">
          <div className="p-3 rounded-full bg-[#f6a623] bg-opacity-10">
            <s.Icon size={20} className="text-[#f6a623]" />
          </div>
          <div className="truncate flex-1">
            <div className="text-sm text-gray-500 truncate">{s.label}</div>
            <div className="text-2xl font-bold">{metrics[s.key] ?? 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}