import React, { useEffect, useState } from "react";
import StaticPage from "../../components/common/StaticPage";
import { CalendarDays, ArrowRight, Pin, Clock, Eye } from "lucide-react";
import { fetchNews } from "../../api/api";

const DEFAULT_NEWS_IMG = "/default-news.png";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Загрузка изображения новости
async function getNewsImage(newsId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/NEWS/${newsId}`);
    if (!response.ok) return null;
    const files = await response.json();
    if (Array.isArray(files) && files.length > 0) {
      const file = files[0];
      if (file.fileUrl) return file.fileUrl;
      if (file.url) return file.url;
      if (file.id) return `${API_BASE_URL}/api/files/${file.id}/download`;
    }
    return null;
  } catch {
    return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await fetchNews({ isPublic: true, size: 100 });
      const newsList = data.content || data || [];
      
      // Сортируем: закрепленные первыми, потом по дате
      const sorted = [...newsList].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
      });
      
      setNews(sorted);

      // Загружаем изображения
      const imgMap = {};
      for (const item of sorted) {
        const url = await getNewsImage(item.id);
        if (url) imgMap[item.id] = url;
      }
      setImagesMap(imgMap);
    } catch (err) {
      console.error("Ошибка загрузки новостей:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StaticPage title="Новости">
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#f6a623] border-t-transparent rounded-full animate-spin" />
          <p className="ml-3 text-gray-500">Загрузка новостей...</p>
        </div>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="Новости">
      {news.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Новостей пока нет</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              {/* Изображение */}
              <div className="relative h-52 overflow-hidden">
                <img 
                  src={imagesMap[item.id] || DEFAULT_NEWS_IMG} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { e.target.src = DEFAULT_NEWS_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                {/* Бейдж "Закреплено" */}
                {item.pinned && (
                  <div className="absolute top-3 left-3 bg-[#f6a623] text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Pin size={12} /> Закреплено
                  </div>
                )}
                
                {/* Дата */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-sm bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <CalendarDays size={14} />
                  {formatDate(item.publishedAt || item.createdAt)}
                </div>
              </div>

              {/* Контент */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-[#f6a623] transition-colors">
                  {item.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                  {item.content || item.shortDescription || "Нет описания"}
                </p>
                
                {/* Мета-информация */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Eye size={14} />
                    <span>Публичная новость</span>
                  </div>
                  <button className="flex items-center gap-1.5 text-[#f6a623] font-semibold text-sm hover:gap-2.5 transition-all">
                    Читать <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StaticPage>
  );
}