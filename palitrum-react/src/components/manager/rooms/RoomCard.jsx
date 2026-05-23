import React from "react";
import { Trash, Users, DoorOpen, Pencil } from "lucide-react";
import { ROOM_TYPE_LABELS, DEFAULT_IMAGE } from "../../../constants/roomConstants";

export default function RoomCard({ room, imageUrl, onDelete, onEdit }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || DEFAULT_IMAGE}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(room); }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-[#e09515] hover:text-white transition-all"
            title="Редактировать"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(room); }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:bg-[#e09515] hover:text-white transition-all"
            title="Удалить"
          >
            <Trash size={16} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-[#f6a623]/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition">
          {ROOM_TYPE_LABELS[room.type] || room.type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{room.name}</h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <DoorOpen size={14} className="text-[#f6a623]" /> {ROOM_TYPE_LABELS[room.type] || room.type}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} className="text-[#f6a623]" /> {room.capacity} чел.
          </span>
        </div>
      </div>
    </div>
  );
}