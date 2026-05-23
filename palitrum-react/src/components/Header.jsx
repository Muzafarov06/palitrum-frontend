// src/components/Header.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, User, Phone, Menu, X, ChevronDown, ChevronRight,
  Home, Building2, Newspaper, School, GraduationCap, 
  Info, Users, BookOpen, FileText, Calendar, Image,
  HelpCircle, Mail, PhoneCall, MapPin, Shield, Award,
  TrendingUp, Gift, Briefcase, Heart, LogOut, LayoutDashboard,
  Globe
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import defaultLogo from "../assets/logo.png";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/AuthContext";
import { getPublicSettings } from "../api/api";

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const mobileSearchInputRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState({
    address: "Новгородский район, д. Ермолино 33-б",
    phone: "+7 (816) 274-77-31",
    email: "dshi.ermolino@mail.ru",
  });
  const [logoUrl, setLogoUrl] = useState(null);
  const [orgName, setOrgName] = useState("Ермолинская ДШИ");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicSettings();
        if (data) {
          setContacts(prev => ({
            address: data.address || prev.address,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
          }));
          if (data.logoUrl?.trim()) setLogoUrl(data.logoUrl);
          if (data.orgName?.trim()) setOrgName(data.orgName);
        }
      } catch {
        // используются значения по умолчанию
      }
    };
    load();
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e?.preventDefault();
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
        setMobileMenuOpen(false);
      }
    },
    [searchTerm, navigate]
  );

  const handleMobileSearch = useCallback(() => {
    if (mobileSearchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(mobileSearchTerm.trim())}`);
      setMobileSearchTerm("");
      setIsMobileSearchOpen(false);
    }
  }, [mobileSearchTerm, navigate]);

  const handleMobileSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleMobileSearch();
    }
  };

  const getDashboardRoute = (user) => {
    if (!user?.roles?.length) return "/";
    const roles = user.roles.map((r) => r.toUpperCase());
    if (roles.some((r) => ["SUPER_ADMIN", "MANAGER", "MANAGERS_PROCESSING"].includes(r))) return "/admin";
    return "/";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileSubmenuOpen(null);
  };

  const toggleMobileSubmenu = (name) => {
    setMobileSubmenuOpen(mobileSubmenuOpen === name ? null : name);
  };

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 100);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setMobileSearchTerm("");
  };

  // Меню с полными названиями
  const subMenuItems = [
    { name: "Основные сведения", path: "/nav-basic-info", icon: Building2 },
    { name: "Структура и органы управления образовательной организацией", path: "/nav-structure", icon: Users },
    { name: "Документы", path: "/nav-documents", icon: FileText },
    { name: "Образование", path: "/nav-education", icon: GraduationCap },
    { name: "Руководство", path: "/nav-leadership", icon: Users },
    { name: "Педагогический состав", path: "/nav-teachers", icon: Users },
    { name: "Материально-техническое обеспечение и оснащенность образовательного процесса", path: "/nav-equipment", icon: Building2 },
    { name: "Платные образовательные услуги", path: "/nav-paid-services", icon: Award },
    { name: "Финансово-хозяйственная деятельность", path: "/nav-finance", icon: TrendingUp },
    { name: "Вакантные места для приема (перевода) обучающихся", path: "/nav-vacancies", icon: Briefcase },
    { name: "Стипендии и меры поддержки обучающихся", path: "/nav-scholarships", icon: Gift },
    { name: "Международное сотрудничество", path: "/nav-international", icon: Globe },
    { name: "Образовательные стандарты и требования", path: "/nav-standards", icon: BookOpen },
    { name: "Организация питания в образовательной организации", path: "/nav-catering", icon: Heart },
  ];

  const newsSubMenu = [
    { name: "Конкурсы", path: "/nav-contests", icon: Award },
    { name: "Новости", path: "/nav-news", icon: Newspaper },
    { name: "Галерея", path: "/nav-gallery", icon: Image },
    { name: "Электронные услуги", path: "/nav-services", icon: Calendar },
    { name: "Персонифицированное финансирование дополнительного образования", path: "/nav-personalized-finance", icon: TrendingUp },
  ];

  const infoSubMenu = [
    { name: "Гостевая книга", path: "/nav-guestbook", icon: Mail },
    { name: "Диспетчер обращений", path: "/nav-requests", icon: HelpCircle },
    { name: "Независимая оценка качества образования", path: "/nav-quality-assessment", icon: Award },
    { name: "Охрана труда", path: "/nav-labor-protection", icon: Shield },
    { name: "Противодействие коррупции", icon: Shield, isGroup: true },
    { name: "Правила дорожного движения", path: "/nav-traffic-rules", icon: Info },
    { name: "Часто задаваемые вопросы", path: "/nav-faq", icon: HelpCircle },
    { name: "Помним! Гордимся! Чтим!", path: "/nav-memory", icon: Heart },
  ];

  const antiCorruptionSubMenu = [
    { name: "Нормативные правовые и иные акты в сфере противодействия коррупции", path: "/nav-anti-legal" },
    { name: "Антикоррупционная экспертиза", path: "/nav-anti-expertise" },
    { name: "Методические материалы", path: "/nav-anti-methods" },
    { name: "Формы документов, связанных с противодействием коррупцией, для заполнения", path: "/nav-anti-documents" },
    { name: "Сведения о доходах, расходах, об имуществе и обязательствах имущественного характера", path: "/nav-anti-finance" },
    { name: "Комиссия по соблюдению требований к служебному поведению и урегулированию конфликта интересов", path: "/nav-anti-commission" },
    { name: "Обратная связь для сообщений о фактах коррупции", path: "/nav-anti-feedback" },
    { name: "Доклады, отчеты, обзоры, письма, статистическая информация по вопросам противодействия коррупции", path: "/nav-anti-reports" },
  ];

  // Десктопная навигация
  const DesktopNav = () => (
    <nav className="hidden lg:block border-t border-[var(--accent)] mt-1.5">
      <div className="container flex justify-between items-center py-4">
        <Link to="/">Главная</Link>
        <div className="relative group">
          <Link to="#" className="group-hover:text-[#f6a623] transition-colors duration-200">
            Сведения об образовательной организации
          </Link>
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border rounded shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
            {subMenuItems.map((item, idx) => (
              <Link key={idx} to={item.path} className="block px-4 py-2 mb-1 rounded hover:bg-[#f6a623] hover:text-white transition-all duration-200 shadow-sm">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="relative group">
          <Link to="#" className="group-hover:text-[#f6a623] transition-colors duration-200">
            Новости и конкурсы
          </Link>
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border rounded shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
            {newsSubMenu.map((item, idx) => (
              <Link key={idx} to={item.path} className="block px-4 py-2 mb-1 rounded hover:bg-[#f6a623] hover:text-white transition-all duration-200 shadow-sm">
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <Link to="/nav-department">Отделения ДШИ</Link>
        <Link to="/nav-admission">Информация о поступлении</Link>
        <div className="relative group">
          <Link to="#" className="group-hover:text-[#f6a623] transition-colors duration-200">
            Полезная информация
          </Link>
          <div className="absolute top-full left-0 mt-1 w-72 bg-white border rounded shadow-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 z-20 translate-y-2 group-hover:translate-y-0">
            {infoSubMenu.map((item, idx) => {
              const isAntiCorruption = item.name === "Противодействие коррупции";
              return (
                <div key={idx} className="relative group/anticorr">
                  {item.path ? (
                    <Link to={item.path} className="block px-4 py-2 mb-1 rounded hover:bg-[#f6a623] hover:text-white transition-all duration-200 shadow-sm">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="block px-4 py-2 mb-1 rounded hover:bg-[#f6a623] hover:text-white transition-all duration-200 shadow-sm cursor-default">
                      {item.name}
                    </span>
                  )}
                  {isAntiCorruption && (
                    <div className="absolute top-0 right-full mr-1 w-96 bg-white border rounded shadow-lg opacity-0 invisible group-hover/anticorr:visible group-hover/anticorr:opacity-100 transition-all duration-300 z-30">
                      {antiCorruptionSubMenu.map((sub, subIdx) => (
                        <Link key={subIdx} to={sub.path} className="block px-4 py-2 mb-1 rounded hover:bg-[#f6a623] hover:text-white transition-all duration-200 shadow-sm">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <Link to="/nav-parent-info">Родителям</Link>
      </div>
    </nav>
  );

  // Мобильные компоненты с иконками
  const MobileMenuLink = ({ to, label, icon: Icon, onClick }) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f6a623]/10 transition-all duration-200 text-gray-700"
      onClick={onClick}
    >
      {Icon && <Icon size={20} className="text-[#f6a623]" />}
      <span className="flex-1 text-sm">{label}</span>
    </Link>
  );

  const MobileSubmenuButton = ({ label, icon: Icon, isOpen, onClick, children }) => (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f6a623]/10 transition-all duration-200 text-gray-700 font-medium"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={20} className="text-[#f6a623]" />}
          <span className="text-sm">{label}</span>
        </div>
        {isOpen ? <ChevronDown size={18} className="text-[#f6a623]" /> : <ChevronRight size={18} className="text-[#f6a623]" />}
      </button>
      {isOpen && (
        <div className="ml-6 pl-3 border-l-2 border-[#f6a623]/30 space-y-1 mt-1">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-[0_6px_20px_rgba(0,0,0,0.12)] rounded-b-[24px]">
        <div className="container flex justify-between items-center py-5 px-10 max-w-[1340px] mx-auto">
          {/* Левая часть: логотип + название - на мобильных только логотип */}
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0">
              <img
                src={logoUrl || defaultLogo}
                alt="Логотип"
                className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover transition-transform duration-300 hover:scale-105"
                style={{ boxShadow: "var(--shadow)" }}
              />
            </Link>
            {/* Название скрыто на мобильных, показываем только на планшетах и десктопе */}
            <div className="hidden md:flex flex-col">
              <div className="text-[28px] font-medium leading-6 text-[#343434] max-w-[420px]">
                {orgName}
              </div>
              <div className="text-[13px] leading-4 text-[#656565] max-w-[420px] mt-2">
                Муниципальное автономное учреждение <br /> дополнительного образования
              </div>
            </div>
          </div>

          {/* Центр: контакты */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-center text-center">
              <span className="text-[13px] leading-4 text-[#656565]">{contacts.address}</span>
              <span className="text-[28px] font-medium leading-6 text-[#343434] mt-2">{contacts.phone}</span>
            </div>
            <div className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-[#f6a623] shadow-[var(--shadow)] ml-3">
              <Phone className="w-5 h-5" />
            </div>
          </div>

          {/* Правая часть: поиск + профиль */}
          <div className="flex items-center gap-6">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#f6a623] focus:border-transparent transition bg-white text-gray-700 placeholder-gray-400 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </form>

            {/* Мобильная иконка поиска */}
            <button
              onClick={openMobileSearch}
              className="md:hidden p-2 text-gray-600 hover:text-[#f6a623] transition-colors"
            >
              <Search size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => (user ? null : setIsLoginOpen(true))}
                className="flex items-center gap-2 group"
              >
                <User className="w-6 h-6 text-[#343434] group-hover:text-[#f6a623] transition-colors" />
                {user && (
                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-medium text-sm leading-none">{user.firstName ?? user.email}</span>
                    {user.roles?.length > 0 && (
                      <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded mt-1 text-gray-700">
                        {user.roles[0]}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {user && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow p-3 z-20 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-sm font-semibold">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                  {user.roles?.length > 0 && (
                    <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 inline-block">
                      Роль: {user.roles[0]}
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-2">
                    <Link to={getDashboardRoute(user)} className="text-sm text-blue-600 hover:underline">
                      Панель управления
                    </Link>
                    <button onClick={logout} className="text-left text-sm text-red-600 hover:underline">
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Мобильное меню (гамбургер) */}
            <button className="lg:hidden p-2" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Десктопная навигация */}
        <DesktopNav />

        {/* Мобильная навигация (выезжающая панель) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMobileMenu}>
            <div
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl overflow-y-auto rounded-l-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Шапка мобильного меню с названием организации */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{orgName}</h3>
                    <p className="text-xs text-gray-500 mt-1">Муниципальное автономное учреждение дополнительного образования</p>
                  </div>
                  <button onClick={toggleMobileMenu} className="p-1 hover:bg-gray-100 rounded-lg transition ml-2">
                    <X size={22} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Контакты в мобильном меню */}
              <div className="p-4 bg-[#fef5e8] border-b border-[#f6a623]/20 space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin size={18} className="text-[#f6a623]" />
                  <span className="flex-1 text-xs">{contacts.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <PhoneCall size={18} className="text-[#f6a623]" />
                  <a href={`tel:${contacts.phone.replace(/\D/g, '')}`} className="hover:text-[#f6a623] transition text-sm">{contacts.phone}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail size={18} className="text-[#f6a623]" />
                  <a href={`mailto:${contacts.email}`} className="hover:text-[#f6a623] transition text-xs break-all">{contacts.email}</a>
                </div>
              </div>

              {/* Основные пункты меню */}
              <div className="py-3">
                <MobileMenuLink to="/" label="Главная" icon={Home} onClick={() => setMobileMenuOpen(false)} />
                
                <MobileSubmenuButton
                  label="Сведения об ОО"
                  icon={Building2}
                  isOpen={mobileSubmenuOpen === 'education'}
                  onClick={() => toggleMobileSubmenu('education')}
                >
                  {subMenuItems.map((item, idx) => (
                    <MobileMenuLink key={idx} to={item.path} label={item.name} icon={item.icon} onClick={() => setMobileMenuOpen(false)} />
                  ))}
                </MobileSubmenuButton>

                <MobileSubmenuButton
                  label="Новости и конкурсы"
                  icon={Newspaper}
                  isOpen={mobileSubmenuOpen === 'news'}
                  onClick={() => toggleMobileSubmenu('news')}
                >
                  {newsSubMenu.map((item, idx) => (
                    <MobileMenuLink key={idx} to={item.path} label={item.name} icon={item.icon} onClick={() => setMobileMenuOpen(false)} />
                  ))}
                </MobileSubmenuButton>

                <MobileMenuLink to="/nav-department" label="Отделения ДШИ" icon={School} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink to="/nav-admission" label="Информация о поступлении" icon={GraduationCap} onClick={() => setMobileMenuOpen(false)} />

                <MobileSubmenuButton
                  label="Полезная информация"
                  icon={Info}
                  isOpen={mobileSubmenuOpen === 'info'}
                  onClick={() => toggleMobileSubmenu('info')}
                >
                  {infoSubMenu.map((item, idx) => {
                    if (item.isGroup) {
                      return (
                        <div key={idx} className="ml-2">
                          <MobileSubmenuButton
                            label="Противодействие коррупции"
                            icon={Shield}
                            isOpen={mobileSubmenuOpen === 'anticorr'}
                            onClick={() => toggleMobileSubmenu('anticorr')}
                          >
                            {antiCorruptionSubMenu.map((sub, subIdx) => (
                              <MobileMenuLink key={subIdx} to={sub.path} label={sub.name} onClick={() => setMobileMenuOpen(false)} />
                            ))}
                          </MobileSubmenuButton>
                        </div>
                      );
                    }
                    return (
                      <MobileMenuLink key={idx} to={item.path} label={item.name} icon={item.icon} onClick={() => setMobileMenuOpen(false)} />
                    );
                  })}
                </MobileSubmenuButton>

                <MobileMenuLink to="/nav-parent-info" label="Родителям" icon={Heart} onClick={() => setMobileMenuOpen(false)} />
              </div>

              {/* Если пользователь авторизован */}
              {user && (
                <div className="border-t border-gray-100 p-4 mt-2 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f6a623] to-[#e69500] flex items-center justify-center shadow-md">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 truncate text-sm">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    to={getDashboardRoute(user)}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#f6a623] to-[#e69500] text-white py-3 rounded-xl mb-2 text-sm font-medium shadow-md hover:shadow-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Панель управления
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full border-2 border-red-300 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-50 transition"
                  >
                    <LogOut size={18} />
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </header>

      {/* Мобильный поиск (оверлей) */}
      {isMobileSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={closeMobileSearch}
        >
          <div 
            className="bg-white pt-16 px-5 pb-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
                onKeyPress={handleMobileSearchKeyPress}
                placeholder="Поиск..."
                className="w-full pl-12 pr-24 py-3.5 border-2 border-[#f6a623] rounded-xl focus:outline-none text-base shadow-sm"
                autoFocus
              />
              {mobileSearchTerm && (
                <button
                  onClick={() => setMobileSearchTerm("")}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={handleMobileSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-[#f6a623] to-[#e69500] text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                Найти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}