import React, { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Shield,
  Plus,
  Trash,
  Home,
  Key,
  Lock,
  Unlock,
  X,
  Search,
  ChevronLeft
} from "lucide-react";

import {
  fetchRoles,
  fetchAllPermissions,
  fetchAllRolePermissions,
  assignPermissionToRole,
  unassignPermissionFromRole
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";

// Перевод ролей на русский
const getRoleRussianName = (roleName) => {
  const roleMap = {
    SUPER_ADMIN: "Супер-администратор",
    ADMIN: "Администратор",
    MANAGER: "Менеджер",
    TEACHER: "Преподаватель",
    STUDENT: "Ученик",
    PARENT: "Родитель"
  };
  return roleMap[roleName] || roleName;
};

// Компонент списка ролей (только для десктопа)
function RoleListDesktop({ roles, selectedRole, onSelectRole, searchTerm, onSearchChange }) {
  return (
    <aside className="hidden md:block w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 p-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Shield size={20} className="text-[#f6a623]" /> Роли
        </h2>
        <button
          onClick={() => onSelectRole(null)}
          className="p-1.5 rounded-lg text-[#f6a623] hover:bg-orange-50 transition-colors"
          title="Сбросить выбор"
        >
          <Home size={18} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Поиск ролей..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none bg-white"
        />
      </div>

      <div className="space-y-1.5">
        {roles.map(role => (
          <div
            key={role.id}
            className={`group flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedRole?.id === role.id
                ? "bg-gradient-to-r from-orange-50 to-orange-100 text-[#f6a623] shadow-sm ring-1 ring-[#f6a623]/30"
                : "hover:bg-gray-50 hover:shadow-sm text-gray-700"
            }`}
            onClick={() => onSelectRole(role)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Shield size={16} className="text-[#f6a623] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{getRoleRussianName(role.name)}</div>
                {role.isSystem && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock size={10} /> системная
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="text-center text-gray-400 py-8 text-sm">Нет ролей</div>
        )}
      </div>
    </aside>
  );
}

// Компонент правой панели – права выбранной роли
// Компонент правой панели – права выбранной роли
function PermissionList({ role, permissions, onAddPermission, onRemovePermission, isAdmin, onSelectRole, roles, searchTerm, onSearchChange }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showAddModal) {
      loadAllPermissions();
    }
  }, [showAddModal]);

  const loadAllPermissions = async () => {
    setLoading(true);
    try {
      const perms = await fetchAllPermissions();
      setAllPermissions(perms);
      const assignedIds = permissions.map(p => p.id);
      const available = perms.filter(p => !assignedIds.includes(p.id));
      setAvailablePermissions(available);
    } catch (error) {
      toast.error("Не удалось загрузить список прав");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (permissionId) => {
    try {
      await onAddPermission(role.id, permissionId);
      setShowAddModal(false);
    } catch (error) {}
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Мобильная шапка с выбором роли */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-800">Выберите роль</h2>
            <button
              onClick={() => onSelectRole(null)}
              className="p-1 rounded-lg text-[#f6a623] hover:bg-orange-50"
            >
              <Home size={16} />
            </button>
          </div>
          
          {/* Выбор роли через select */}
          <select
            value={role?.id || ""}
            onChange={(e) => {
              const selected = roles.find(r => r.id === Number(e.target.value));
              onSelectRole(selected || null);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none bg-white mb-3"
          >
            <option value="">-- Выберите роль --</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {getRoleRussianName(r.name)} {r.isSystem ? "(системная)" : ""}
              </option>
            ))}
          </select>
          
          {/* Поиск ролей */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Поиск ролей..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none bg-white"
            />
          </div>
        </div>

        {!role ? (
          <div className="text-center text-gray-400 py-16">
            <Shield size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">Выберите роль, чтобы управлять её правами</p>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <Shield size={28} className="text-[#f6a623]" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{getRoleRussianName(role.name)}</h1>
                  {role.description && <p className="text-gray-500 text-sm mt-1">{role.description}</p>}
                  {role.isSystem && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Lock size={12} /> Системная роль – редактирование ограничено
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && !role.isSystem && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#f6a623] hover:bg-[#e09515] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition shadow-md text-sm sm:text-base"
                >
                  <Plus size={18} /> Добавить право
                </button>
              </div>
            )}

            {permissions.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 sm:p-10 text-center text-gray-400 border border-dashed">
                <Key size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">У этой роли нет назначенных прав</p>
                {isAdmin && !role.isSystem && (
                  <button onClick={() => setShowAddModal(true)} className="mt-2 text-[#f6a623] hover:underline text-sm">
                    Добавить право
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 animate-fadeIn">
                {permissions.map(perm => (
                  <div key={perm.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm sm:text-base break-words">{perm.code}</div>
                      {perm.description && <div className="text-xs text-gray-500 mt-0.5 break-words">{perm.description}</div>}
                    </div>
                    {isAdmin && !role.isSystem && (
                      <button
                        onClick={() => onRemovePermission(role.id, perm.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#f6a623] hover:bg-orange-50 transition flex-shrink-0 ml-2"
                        title="Удалить право"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <AddPermissionModal
          permissions={availablePermissions}
          loading={loading}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </main>
  );
}

// Модальное окно добавления права
function AddPermissionModal({ permissions, loading, onClose, onAdd }) {
  const [filter, setFilter] = useState("");
  const filtered = permissions.filter(p =>
    p.code.toLowerCase().includes(filter.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] relative shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Добавить право</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 sm:p-6 border-b">
          <input
            type="text"
            placeholder="Поиск по коду или описанию..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f6a623] focus:border-transparent outline-none text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <Key size={40} className="mx-auto mb-2 opacity-50" />
              <p>Нет доступных прав для добавления</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map(perm => (
                <div key={perm.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#f6a623] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base break-words">{perm.code}</div>
                    {perm.description && <div className="text-xs text-gray-500 mt-0.5 break-words">{perm.description}</div>}
                  </div>
                  <button onClick={() => onAdd(perm.id)} className="px-3 py-1 bg-[#f6a623] text-white text-sm rounded-lg hover:bg-[#e09515] transition flex-shrink-0 ml-2">
                    Добавить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 border-t bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// Главный компонент страницы
export default function RolesPermissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(r => r === "SUPER_ADMIN" || r === "ADMIN") ||
                  user?.permissions?.includes("permission.assign_to_role");

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissionsMap, setRolePermissionsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Для мобильного поиска
  const handleMobileSearch = (value) => {
    setRoleSearch(value);
  };

  // Передаём callback в window для мобильного поиска
  useEffect(() => {
    window.mobileSearchCallback = handleMobileSearch;
    return () => {
      delete window.mobileSearchCallback;
    };
  }, []);

  const loadData = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const [rolesData, rolePermsData, allPermsData] = await Promise.all([
        fetchRoles(search),
        fetchAllRolePermissions(),
        fetchAllPermissions()
      ]);
      setRoles(rolesData);

      const permsMap = {};
      for (const role of rolesData) {
        permsMap[role.id] = [];
      }
      for (const rp of rolePermsData) {
        const perm = allPermsData.find(p => p.id === rp.permissionId);
        if (perm && permsMap[rp.roleId]) {
          permsMap[rp.roleId].push(perm);
        }
      }
      setRolePermissionsMap(permsMap);
      if (selectedRole && !rolesData.find(r => r.id === selectedRole.id)) {
        setSelectedRole(null);
      }
    } catch (error) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(roleSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [roleSearch, loadData]);

  const refreshRolePermissions = useCallback(async (roleId) => {
    try {
      const [rolePermsData, allPermsData] = await Promise.all([
        fetchAllRolePermissions(),
        fetchAllPermissions()
      ]);
      const perms = rolePermsData
        .filter(rp => rp.roleId === roleId)
        .map(rp => allPermsData.find(p => p.id === rp.permissionId))
        .filter(Boolean);
      setRolePermissionsMap(prev => ({ ...prev, [roleId]: perms }));
    } catch (error) {
      toast.error("Не удалось обновить права");
    }
  }, []);

  const handleAddPermission = async (roleId, permissionId) => {
    try {
      await assignPermissionToRole(roleId, permissionId);
      toast.success("Право добавлено");
      await refreshRolePermissions(roleId);
    } catch (error) {
      toast.error("Ошибка добавления права");
      throw error;
    }
  };

  const handleRemovePermission = (roleId, permissionId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Удалить право",
      message: "Вы уверены, что хотите удалить это право у роли?",
      onConfirm: async () => {
        try {
          await unassignPermissionFromRole(roleId, permissionId);
          toast.success("Право удалено");
          await refreshRolePermissions(roleId);
        } catch (error) {
          toast.error("Ошибка удаления");
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 pl-10 md:pl-0">
          <div className="p-2 bg-orange-500/10 rounded-xl">
            <Shield className="text-[#f6a623]" size={24} />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-800">Роли и права доступа</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><Shield size={12} /> {roles.length} ролей</span>
              <span className="flex items-center gap-1"><Key size={12} /> Управление правами</span>
            </div>
          </div>
        </div>
        {!isAdmin && (
          <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
            <Unlock size={14} /> Только просмотр
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Десктопная боковая панель */}
        <RoleListDesktop
          roles={roles}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          searchTerm={roleSearch}
          onSearchChange={setRoleSearch}
        />
        
        {/* Основной контент (на мобильных здесь же выбор роли) */}
        <PermissionList
          role={selectedRole}
          permissions={selectedRole ? rolePermissionsMap[selectedRole.id] || [] : []}
          onAddPermission={handleAddPermission}
          onRemovePermission={handleRemovePermission}
          isAdmin={isAdmin}
          onSelectRole={setSelectedRole}
          roles={roles}
          searchTerm={roleSearch}
          onSearchChange={setRoleSearch}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}