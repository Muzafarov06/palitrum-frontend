import React, { useEffect, useState } from "react";
import "../styles/events.css";
import "../styles/programs.css";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const DEFAULT_NEWS_IMG = "/default-news.png";

// Функция загрузки изображения новости
async function getNewsImage(newsId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/NEWS/${newsId}`);
    
    if (!response.ok) return null;
    
    const files = await response.json();
    
    if (Array.isArray(files) && files.length > 0) {
      const file = files[0];
      
      // Приоритет: прямой URL из S3
      if (file.fileUrl) return file.fileUrl;
      if (file.url) return file.url;
      
      // Запасные варианты
      if (file.filePath) return `${API_BASE_URL}${file.filePath}`;
      if (file.id) return `${API_BASE_URL}/api/files/${file.id}/download`;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Компонент карточки новости
function EventCard({ item }) {
  const [imageUrl, setImageUrl] = useState(DEFAULT_NEWS_IMG);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      const url = await getNewsImage(item.id);
      if (mounted && url) setImageUrl(url);
      if (mounted) setImageLoading(false);
    };

    loadImage();

    return () => { mounted = false; };
  }, [item.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Дата не указана";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const dateStr = formatDate(item.publishedAt || item.createdAt || item.date);
  const content = item.content || item.description || item.shortDescription || "";

  return (
    <article className="event-card">
      {imageLoading ? (
        <div className="event-image-loading" />
      ) : (
        <img 
          src={imageUrl} 
          alt={item.title || 'Новость'} 
          className="event-image"
          onError={(e) => { e.target.src = DEFAULT_NEWS_IMG; }}
        />
      )}
      <div className="event-content">
        <h3 className="event-title">{item.title || "Новость"}</h3>
        <p className="event-date">{dateStr}</p>
        <p className="event-desc">
          {content.length > 150 ? content.slice(0, 150) + "..." : content || "Нет описания"}
        </p>
        <Link to={`/nav-news`}>
          <button className="event-btn">Подробнее</button>
        </Link>
      </div>
    </article>
  );
}

export default function EventsGrid({ items = [] }) {
  const lastThree = [...items].slice(-3).reverse();

  return (
    <div className="events-wrapper" style={{ marginTop: "40px" }}>
      <h2 className="programs-title">Конкурсы и мероприятия</h2>

      {lastThree.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Мероприятий пока нет.
        </p>
      ) : (
        <>
          <div className="events-list">
            {lastThree.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>

          {/* Кнопка "Все мероприятия" */}
          {items.length > 0 && (
            <Link to="/nav-news">
              <div className="mt-8 text-center">
                <span className="inline-flex items-center gap-2 text-gray-600 hover:text-[#f6a623] transition-colors cursor-pointer font-medium group">
                  Все мероприятия
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
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