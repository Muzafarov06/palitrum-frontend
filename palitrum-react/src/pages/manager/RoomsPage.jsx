import React, { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchFilteredRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadFiles,
  replaceFiles,
  deleteAllFilesForEntity,
} from "../../api/api";
import RoomFormModal from "../../components/manager/rooms/RoomFormModal";
import RoomCard from "../../components/manager/rooms/RoomCard";
import RoomListCard from "../../components/manager/rooms/RoomListCard";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import CustomSelect from "../../components/common/CustomSelect"; // ✅ добавлен импорт
import RoomFilters from "../../components/manager/rooms/RoomFilters";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Plus, DoorOpen, LayoutGrid, List, Download, Upload
} from "lucide-react";
import API from "../../api/api";
import { ROOM_TYPES } from "../../constants/roomConstants";
import { useAuth } from "../../context/AuthContext";
import AddButton from "../../components/common/AddButton";

export default function RoomsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(r));

  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const data = await fetchFilteredRooms(searchQuery, typeFilter, page, size);
      setRooms(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить помещения");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [searchQuery, typeFilter, page, size]);

  const handleSubmitRoom = async (roomData, imageFile, isImageDeleted, roomId) => {
    const isEdit = !!roomId;
    try {
      let savedRoom;
      if (isEdit) {
        savedRoom = await updateRoom(roomId, roomData);
        if (isImageDeleted) {
          await deleteAllFilesForEntity("ROOM", roomId);
        } else if (imageFile) {
          await replaceFiles("ROOM", roomId, [imageFile]);
        }
        toast.success("Помещение обновлено");
      } else {
        savedRoom = await createRoom(roomData);
        if (imageFile) {
          await uploadFiles(savedRoom.id, "ROOM", [imageFile]);
        }
        toast.success("Помещение добавлено");
      }
      await loadRooms();
      return savedRoom;
    } catch (err) {
      toast.error(isEdit ? "Ошибка обновления" : "Ошибка добавления");
      throw err;
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await deleteRoom(roomToDelete.id);
      toast.success("Помещение удалено");
      await loadRooms();
    } catch (err) {
      toast.error("Ошибка удаления");
    } finally {
      setRoomToDelete(null);
    }
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setShowEditModal(true);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPage(0);
  };
  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setPage(0);
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/api/import/rooms/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rooms_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Шаблон скачан");
    } catch (err) {
      toast.error("Не удалось скачать шаблон");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/api/import/rooms/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Импорт завершён');
      await loadRooms();
    } catch (err) {
      toast.error('Ошибка импорта: ' + (err.response?.data?.error || err.message));
    } finally {
      e.target.value = '';
    }
  };

  const totalPages = Math.ceil(total / size);
  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) setPage(newPage);
  };

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8 ${isAdmin ? 'h-screen overflow-hidden' : 'mt-40'}`}>
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Заголовок */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto pl-10 md:pl-0">
            <div className="p-2 bg-[#f6a623]/10 rounded-xl shrink-0">
              <DoorOpen size={32} className="text-[#f6a623]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Помещения</h1>
              <p className="text-gray-500 text-sm mt-1">
                {isAdmin ? 'Управление студиями, залами и классами' : 'Студии, залы и классы'}
              </p>
            </div>
          </div>
          
          {/* Админские кнопки - только для админов */}
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 border border-[#f6a623] text-[#f6a623] hover:bg-[#f6a623] hover:text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Шаблон</span>
                  <span className="sm:hidden">Шаблон</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-1.5 bg-[#f6a623] hover:bg-[#e09515] text-white rounded-lg px-3 py-1.5 text-sm font-medium transition"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Импорт</span>
                  <span className="sm:hidden">Импорт</span>
                </button>
                <AddButton onClick={() => setShowAddModal(true)} label="Добавить помещение" shortLabel="Помещение" />
              </div>
              {/* Поиск */}
              <div className="w-full sm:w-48 lg:w-72">
                <CustomSearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Поиск..."
                  setPage={() => setPage(0)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Фильтры и переключатель вида */}
        {isAdmin && (
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4 flex-shrink-0">
            <div className="flex-1 min-w-[200px]">
              <CustomSelect
                value={typeFilter}
                onChange={handleTypeChange}
                options={[{ value: "", label: "Все типы" }, ...ROOM_TYPES]}
                placeholder="Тип помещения"
                clearable
              />
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "grid" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "list" ? "bg-[#f6a623] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Счетчик */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2 flex-shrink-0">
          <div>Найдено помещений: {total}</div>
          <div className="flex items-center gap-2">
            <span>Показывать:</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="border rounded-md p-1 text-sm"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>

        {/* Список помещений */}
        <div className={`${isAdmin ? 'flex-1 overflow-y-auto min-h-0' : ''} scrollbar-hidden`}>
          {loading && <div className="text-center py-12">Загрузка...</div>}
          {!loading && rooms.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <DoorOpen size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Нет помещений, соответствующих критериям</p>
            </div>
          )}
          {!loading && rooms.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  imageUrl={room.imageUrl}
                  onDelete={() => setRoomToDelete(room)}
                  onEdit={() => openEditModal(room)}
                />
              ))}
            </div>
          )}
          {!loading && rooms.length > 0 && viewMode === "list" && (
            <div className="space-y-3 pb-6">
              {rooms.map(room => (
                <RoomListCard
                  key={room.id}
                  room={room}
                  imageUrl={room.imageUrl}
                  onDelete={() => setRoomToDelete(room)}
                  onEdit={() => openEditModal(room)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 py-2 flex-shrink-0">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Назад
            </button>
            <span className="px-3 py-1">
              Страница {page + 1} из {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>

      {/* Модалки - только для админов */}
      {isAdmin && (
        <>
          <RoomFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleSubmitRoom}
            roomTypes={ROOM_TYPES}
          />

          <RoomFormModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingRoom(null); }}
            onSubmit={handleSubmitRoom}
            initialData={editingRoom}
            roomTypes={ROOM_TYPES}
          />

          <ConfirmDialog
            isOpen={!!roomToDelete}
            onClose={() => setRoomToDelete(null)}
            onConfirm={handleDeleteRoom}
            title="Удалить помещение"
            message={`Вы уверены, что хотите удалить помещение "${roomToDelete?.name}"? Это действие нельзя отменить.`}
          />
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}