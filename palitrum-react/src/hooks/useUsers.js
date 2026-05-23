import { useState, useCallback } from 'react';
import { fetchFilteredUsers, createUser, updateUser, deleteUser } from '../api/api';
import { toast } from 'react-toastify';

export function useFilteredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadUsers = useCallback(async (filters) => {
    setLoading(true);
    try {
      const data = await fetchFilteredUsers(filters);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  const addUser = async (userData) => {
    try {
      const res = await createUser(userData);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const editUser = async (id, userData) => {
    try {
      await updateUser(id, userData);
    } catch (err) {
      throw err;
    }
  };

  const removeUser = async (id) => {
    try {
      await deleteUser(id);
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    loading,
    totalPages,
    totalElements,
    loadUsers,
    addUser,
    editUser,
    removeUser,
  };
}