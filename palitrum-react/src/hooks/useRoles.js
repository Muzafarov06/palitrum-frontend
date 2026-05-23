import { useState, useEffect } from 'react';
import { fetchRoles } from '../api/api';
import { toast } from 'react-toastify';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRoles();
        setRoles(data || []);
      } catch (err) {
        // Не показываем тост при 403, так как это ожидаемое поведение для менеджеров
        if (err.response?.status !== 403) {
          console.error(err);
          toast.error('Ошибка загрузки ролей');
        } else {
          console.warn('Нет прав на загрузку ролей');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { roles, loading };
}