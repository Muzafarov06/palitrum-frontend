import React from "react";
import { Trash, Users, DoorOpen, Pencil } from "lucide-react";
import { ROOM_TYPE_LABELS, DEFAULT_IMAGE } from "../../../constants/roomConstants";

export default function RoomListCard({ room, imageUrl, onDelete, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 p-4">
      <img src={imageUrl || DEFAULT_IMAGE} alt={room.name} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{room.name}</h3>
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1"><DoorOpen size={14} className="text-[#f6a623]" /> {ROOM_TYPE_LABELS[room.type] || room.type}</span>
          <span className="flex items-center gap-1"><Users size={14} className="text-[#f6a623]" /> {room.capacity} чел.</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(room)} className="text-gray-400 hover:text-[#e09515] transition p-2" title="Редактировать">
          <Pencil size={18} />
        </button>
        <button onClick={() => onDelete(room)} className="text-gray-400 hover:text-[#e09515] transition p-2" title="Удалить">
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
}