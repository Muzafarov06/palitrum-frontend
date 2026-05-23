import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/location-card.css";
import "../styles/programs.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const DEFAULT_LOCATION_IMG = "/default-location.png";
const DEFAULT_LOCATION_ICON = "/default-location-icon.png";

// Функция загрузки изображения
async function getImageUrl(entityType, entityId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${entityType}/${entityId}`);
    
    if (!response.ok) return null;
    
    const files = await response.json();
    
    if (Array.isArray(files) && files.length > 0) {
      const file = files[0];
      
      if (file.fileUrl) return file.fileUrl;
      if (file.url) return file.url;
      if (file.filePath) return `${API_BASE_URL}${file.filePath}`;
      if (file.id) return `${API_BASE_URL}/api/files/${file.id}/download`;
    }
    
    return null;
  } catch {
    return null;
  }
}

function LocationCard({ item }) {
  const [locationImage, setLocationImage] = useState(DEFAULT_LOCATION_IMG);
  const [iconUrl, setIconUrl] = useState(DEFAULT_LOCATION_ICON);
  const [imageLoading, setImageLoading] = useState(true);
  const [iconLoading, setIconLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      const imgUrl = await getImageUrl('ROOM', item.id);
      if (mounted && imgUrl) setLocationImage(imgUrl);
      if (mounted) setImageLoading(false);

      const icnUrl = await getImageUrl('ROOM_ICON', item.id);
      if (mounted && icnUrl) setIconUrl(icnUrl);
      if (mounted) setIconLoading(false);
    };

    loadImages();

    return () => { mounted = false; };
  }, [item.id]);

  return (
    <div className="location-card">
      <div className="location-card-inner">
        {imageLoading ? (
          <div className="location-image-loading" />
        ) : (
          <img
            src={locationImage}
            alt={item.name || 'Помещение'}
            className="location-image"
            onError={(e) => { e.target.src = DEFAULT_LOCATION_IMG; }}
          />
        )}

        <div className="location-content">
          <div className="location-icon-wrapper">
            <div className="location-icon-bg">
              {iconLoading ? (
                <div className="location-icon-loading" />
              ) : (
                <img
                  src={iconUrl}
                  alt="icon"
                  className="location-icon"
                  onError={(e) => { e.target.src = DEFAULT_LOCATION_ICON; }}
                />
              )}
            </div>
          </div>

          <h3 className="location-name">{item.name || 'Без названия'}</h3>

          <Link to={`/rooms`}>
            <button className="location-btn">Подробнее</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LocationsGrid({ items = [] }) {
  const lastSix = items.slice(-6);

  return (
    <div className="locations-wrapper mt-5 md:mt-10 px-4">
      <h2 className="locations-title text-2xl md:text-4xl font-bold text-center mb-4 md:mb-8">
        Где проходят занятия?
      </h2>

      {lastSix.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Локаций пока нет.</p>
      ) : (
        <>
          {/* Сетка с адаптивными карточками */}
          <div className="locations-grid">
            {lastSix.map((it) => (
              <LocationCard key={it.id} item={it} />
            ))}
          </div>

          {/* Кнопка "Все кабинеты" */}
          {items.length > 0 && (
            <Link to="/rooms">
              <div className="mt-5 md:mt-8 text-center">
                <span className="inline-flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-600 hover:text-[#f6a623] transition-colors cursor-pointer font-medium group">
                  Все кабинеты
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          )}
        </>
      )}
    </div>
  );
}