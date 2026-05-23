import { useState, useEffect } from 'react';
import { getFilesByEntity } from '../api/api';

export function useEntityImage(entityType, entityId, defaultImage = null) {
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entityId || !entityType) {
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      try {
        setLoading(true);
        const files = await getFilesByEntity(entityType, entityId);
        // Берём первый файл как основное изображение
        if (files && files.length > 0 && files[0].url) {
          setImageUrl(files[0].url);
        } else {
          setImageUrl(defaultImage);
        }
      } catch (err) {
        console.error(`Ошибка загрузки изображения для ${entityType}:`, err);
        setError(err);
        setImageUrl(defaultImage);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [entityType, entityId, defaultImage]);

  return { imageUrl, loading, error };
}