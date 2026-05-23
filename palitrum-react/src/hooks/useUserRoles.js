import { useState, useEffect } from 'react';
import { fetchUserRoles } from '../api/api';
import { toast } from 'react-toastify';

export function useUserRoles(roles, users) {
  const [userRolesMap, setUserRolesMap] = useState({});

  useEffect(() => {
    if (!roles.length || !users.length) return;

    const loadMap = async () => {
      try {
        const map = {};
        for (let role of roles) {
          const ur = await fetchUserRoles(null, role.id);
          map[role.id] = ur
            .map(u => users.find(user => user.id === u.userId))
            .filter(Boolean);
        }
        setUserRolesMap(map);
      } catch (err) {
        console.error(err);
        toast.error('Ошибка загрузки связей пользователей и ролей');
      }
    };
    loadMap();
  }, [roles, users]);

  return { userRolesMap };
}