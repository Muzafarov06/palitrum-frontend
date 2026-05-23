import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import '../styles/programs.css';

function formatYears(n) {
  if (!n) return 'Продолжительность не указана';
  if (n === 1) return '1 год';
  if (n >= 2 && n <= 4) return `${n} года`;
  return `${n} лет`;
}

// Обрезка текста с многоточием
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

const DEFAULT_PROGRAM_IMG = "/default-program.png";
const DEFAULT_PROGRAM_ICON = "/default-program-icon.png";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function getImageUrl(entityType, entityId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${entityType}/${entityId}`);
    if (!response.ok) return null;
    const files = await response.json();
    if (Array.isArray(files) && files.length > 0) {
      const file = files[0];
      if (file.url) return file.url;
      if (file.fileUrl) return file.fileUrl;
      if (file.filePath) return `${API_BASE_URL}${file.filePath}`;
      if (file.id) return `${API_BASE_URL}/api/files/${file.id}/download`;
    }
    return null;
  } catch {
    return null;
  }
}

function ProgramCard({ program }) {
  const [imageUrl, setImageUrl] = useState(DEFAULT_PROGRAM_IMG);
  const [iconUrl, setIconUrl] = useState(DEFAULT_PROGRAM_ICON);
  const [imageLoading, setImageLoading] = useState(true);
  const [iconLoading, setIconLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadImages = async () => {
      const imgUrl = await getImageUrl('PROGRAM', program.id);
      if (mounted && imgUrl) setImageUrl(imgUrl);
      if (mounted) setImageLoading(false);

      const icnUrl = await getImageUrl('PROGRAM_ICON', program.id);
      if (mounted && icnUrl) setIconUrl(icnUrl);
      if (mounted) setIconLoading(false);
    };

    loadImages();
    return () => { mounted = false; };
  }, [program.id]);

  // Адаптивная обрезка текста
  const displayName = truncateText(program.name, 35);
  const displayDescription = program.description 
    ? truncateText(program.description, 80)
    : 'Описание программы будет добавлено позже.';

  return (
    <div className="program-card flex-shrink-0" role="listitem" title={program.name}>
      {imageLoading ? (
        <div className="program-image-loading" />
      ) : (
        <img
          src={imageUrl}
          alt={program.name || 'Программа'}
          className="program-image"
          onError={(e) => { e.target.src = DEFAULT_PROGRAM_IMG; }}
        />
      )}

      <div className="program-content">
        <div className="program-icon-wrapper">
          <div className="program-icon-bg">
            {iconLoading ? (
              <div className="program-icon-loading" />
            ) : (
              <img
                src={iconUrl}
                alt="icon"
                className="program-icon"
                onError={(e) => { e.target.src = DEFAULT_PROGRAM_ICON; }}
              />
            )}
          </div>
        </div>

        <div className="program-text">
          <h3 className="program-name" title={program.name}>
            {displayName}
          </h3>
          <p className="program-duration">{formatYears(program.durationYears)}</p>
          <p className="program-desc" title={program.description}>
            {displayDescription}
          </p>
        </div>

        <Link to={`/nav-department`}>
          <button className="program-btn" type="button">
            Подробнее
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function ProgramsGrid({ items = [], scrollInterval = 7000 }) {
  const scrollRef = useRef(null);
  const intervalRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    
    // Обновляем активный индекс для индикаторов
    const cardWidth = el.firstChild?.offsetWidth + 24 || 350;
    const newIndex = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(newIndex, items.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || items.length === 0 || isHovered) return;

    intervalRef.current = setInterval(() => {
      if (!el || isHovered) return;
      const cardWidth = el.firstChild?.offsetWidth + 24 || 350;
      const maxScroll = el.scrollWidth - el.clientWidth;
      
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
      
      setTimeout(updateScrollButtons, 500);
    }, scrollInterval);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [items, scrollInterval, isHovered]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    updateScrollButtons();
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [items]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
        setTimeout(updateScrollButtons, 300);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth + 24 || 350;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 400);
  };

  return (
    <div className="programs-wrapper mt-[60px] md:mt-[100px] relative px-4">
      <h2 className="programs-title text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">
        Широкий выбор программ <br className="hidden sm:block" /> по различным направлениям
      </h2>

      {items.length === 0 ? (
        <div className="programs-empty text-center py-10">Программы пока не добавлены.</div>
      ) : (
        <div 
          className="relative group/container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Кнопки прокрутки - скрыты на мобильных, видны на десктопе при наведении */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg items-center justify-center hover:bg-[#f6a623] hover:text-white transition-all duration-300 -ml-4 opacity-0 group-hover/container:opacity-100"
              aria-label="Прокрутить влево"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={() => scrollBy('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg items-center justify-center hover:bg-[#f6a623] hover:text-white transition-all duration-300 -mr-4 opacity-0 group-hover/container:opacity-100"
              aria-label="Прокрутить вправо"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          <div 
            ref={scrollRef} 
            className="programs-scroll scrollbar-hide scroll-smooth overflow-x-auto flex gap-6 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            role="list" 
            aria-label="Программы"
          >
            {items.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>

          {/* Компактные индикаторы прокрутки */}
          <div className="flex justify-center gap-1.5 mt-4">
            {items.slice(0, Math.min(items.length, 12)).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = scrollRef.current;
                  if (!el) return;
                  const cardWidth = el.firstChild?.offsetWidth + 24 || 350;
                  el.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
                }}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === i 
                    ? 'w-4 h-1.5 bg-[#f6a623]' 
                    : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Программа ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Кнопка "Все программы" */}
      {items.length > 0 && (
        <Link to="/nav-department">
          <div className="mt-6 md:mt-8 text-center">
            <span className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-[#f6a623] transition-colors cursor-pointer font-medium group">
              Все программы
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}