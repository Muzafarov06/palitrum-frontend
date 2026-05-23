// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicSettings } from "../api/api";

export default function Footer() {
  const [contacts, setContacts] = useState({
    address: "173517, Новгородская область, Новгородский район, д. Ермолино, 33-Б",
    email: "dsh.ermolino@mail.ru",
    phone: "+7 (816) 274-77-31",
  });
  const [orgName, setOrgName] = useState("Ермолинская ДШИ");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicSettings();
        if (data) {
          setContacts(prev => ({
            address: data.address || prev.address,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }));
          if (data.orgName?.trim()) setOrgName(data.orgName);
        }
      } catch {
        // значения по умолчанию
      }
    };
    load();
  }, []);

  return (
    <footer className="relative mt-10 md:mt-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 text-gray-700 overflow-hidden rounded-t-[24px] shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      {/* Декоративные элементы - скрыты на мобильных */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl hidden md:block"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl hidden md:block"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#f6a623]/20 to-transparent hidden md:block"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16 z-10">
        {/* Основная сетка */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
          {/* Левая колонка: бренд и контакты */}
          <div className="md:col-span-5 space-y-4 md:space-y-6">
            <div className="relative inline-block">
              <h2 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-[#f6a623] to-orange-300 bg-clip-text text-transparent">
                {orgName}
              </h2>
              <div className="absolute -bottom-2 left-0 w-12 md:w-16 h-0.5 bg-gradient-to-r from-[#f6a623] to-amber-500 rounded-full"></div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 max-w-xs border-l-2 border-[#f6a623] pl-3 md:pl-4">
              Муниципальное автономное учреждение дополнительного образования
            </p>

            {/* Социальные иконки */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              {[
                { href: "#", src: "/tg.svg", alt: "telegram", label: "Telegram" },
                { href: `tel:${contacts.phone}`, src: "/phone.svg", alt: "phone", label: "Позвонить" },
                { href: "#", src: "/vk.svg", alt: "vk", label: "VK" },
                { href: `mailto:${contacts.email}`, src: "/mail.svg", alt: "mail", label: "Email" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  aria-label={item.alt}
                  className="group relative w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white backdrop-blur-sm border border-amber-200 hover:border-[#f6a623]/50 hover:bg-[#f6a623]/10 transition-all duration-300 flex items-center justify-center shadow-sm"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-4 h-4 md:w-5 md:h-5 group-hover:opacity-100 group-hover:brightness-110 transition-all duration-300"
                  />
                  <span className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] font-mono text-[#f6a623] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>

            {/* Контактная информация */}
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-start gap-2 md:gap-3 group">
                <div className="mt-0.5 p-1 rounded-lg bg-[#f6a623]/10 group-hover:bg-[#f6a623]/20 transition-colors flex-shrink-0">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-[#f6a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span className="text-gray-600 leading-relaxed text-xs md:text-sm">
                  {contacts.address.split(',').map((part, i) => (
                    <React.Fragment key={i}>
                      {part.trim()}{i < contacts.address.split(',').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <a
                href={`mailto:${contacts.email}`}
                className="inline-flex items-center gap-2 md:gap-3 group"
              >
                <div className="p-1 rounded-lg bg-[#f6a623]/10 group-hover:bg-[#f6a623]/20 transition-colors">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-[#f6a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span className="text-gray-600 group-hover:text-[#f6a623] transition-colors font-mono text-xs md:text-sm break-all">
                  {contacts.email}
                </span>
              </a>
              <a
                href={`tel:${contacts.phone}`}
                className="inline-flex items-center gap-2 md:gap-3 group"
              >
                <div className="p-1 rounded-lg bg-[#f6a623]/10 group-hover:bg-[#f6a623]/20 transition-colors">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-[#f6a623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <span className="text-gray-600 group-hover:text-[#f6a623] transition-colors font-mono text-xs md:text-sm">
                  {contacts.phone}
                </span>
              </a>
            </div>
          </div>

          {/* Правая часть — колонки */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {/* Колонка "О школе" */}
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-5 relative inline-block">
                <span className="bg-gradient-to-r from-[#f6a623] to-orange-300 bg-clip-text text-transparent">
                  О школе
                </span>
                <div className="absolute -bottom-1 left-0 w-6 md:w-8 h-0.5 bg-[#f6a623] rounded-full"></div>
              </h3>
              <ul className="flex flex-col gap-2 md:gap-2.5">
                {[
                  ["/nav-basic-info", "О нас"],
                  ["/nav-leadership", "Команда"],
                  ["/vacancies", "Вакансии"],
                  ["/experience", "Школа делится опытом"],
                  ["/nav-structure", "Сведения об организации"],
                  ["/policy", "Политика обработки данных"],
                  ["/consent", "Согласие на обработку"],
                  ["/payment", "Способы оплаты"],
                ].map(([path, label]) => (
                  <li key={path}>
                    <Link 
                      to={path} 
                      className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Обучение */}
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-5 relative inline-block">
                <span className="bg-gradient-to-r from-[#f6a623] to-orange-300 bg-clip-text text-transparent">
                  Обучение
                </span>
                <div className="absolute -bottom-1 left-0 w-6 md:w-8 h-0.5 bg-[#f6a623] rounded-full"></div>
              </h3>
              <ul className="flex flex-col gap-2 md:gap-2.5">
                <li>
                  <Link to="/programs/basic" className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1">
                    Профильное обучение
                  </Link>
                </li>
                <li>
                  <Link to="/programs/additional" className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1">
                    Дополнительное образование
                  </Link>
                </li>
              </ul>
            </div>

            {/* Как поступить */}
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-5 relative inline-block">
                <span className="bg-gradient-to-r from-[#f6a623] to-orange-300 bg-clip-text text-transparent">
                  Поступление
                </span>
                <div className="absolute -bottom-1 left-0 w-6 md:w-8 h-0.5 bg-[#f6a623] rounded-full"></div>
              </h3>
              <ul className="flex flex-col gap-2 md:gap-2.5">
                <li>
                  <Link to="/nav-admission" className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1">
                    Как поступить
                  </Link>
                </li>
                <li>
                  <Link to="/prices" className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1">
                    Стоимость обучения
                  </Link>
                </li>
                <li>
                  <Link to="/contacts" className="text-gray-600 hover:text-[#f6a623] transition-all duration-200 block py-0.5 text-xs md:text-sm hover:translate-x-1">
                    Контакты
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-8 md:mt-12 pt-4 md:pt-6 border-t border-amber-200 text-center text-[10px] md:text-xs text-gray-500 relative">
          <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-[#f6a623]/50 to-transparent"></div>
          <span className="font-mono tracking-wide">
            © {new Date().getFullYear()} {orgName}. Все права защищены.
          </span>
        </div>
      </div>
    </footer>
  );
}