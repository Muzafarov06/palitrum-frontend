import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ApplicationEditModal from "../components/manager/ApplicationEditModal";
import LoginModal from "./LoginModal"; // Добавьте эту строку!
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Hero() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Добавьте если нужно

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSuccess = () => {};

  return (
    <>
      <ToastContainer position="top-right" />
      
      {/* Десктопная версия (lg и выше) */}
      <section className="hidden lg:block hero-section pb-[150px]">
        <div className="grid grid-cols-[auto_1fr_auto] w-full relative">
          <div className="flex flex-col items-center lg:items-start z-10 mt-[320px] hover:scale-105 transition-transform duration-300">
            <div className="relative bg-white shadow-lg rounded-2xl px-6 py-5 inline-block text-center">
              <img src="/splash.svg" alt="Клякса" className="absolute -top-8 -right-8 w-16 h-16" />
              <div className="text-[18px]">РАБОТАЕМ С</div>
              <div className="text-[114px] leading-none text-[var(--text-dark)]">19</div>
              <div className="text-[114px] leading-none text-[var(--accent)]">91</div>
              <div className="text-[38px]">ГОДА</div>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 top-[160px] z-10 flex flex-col items-center text-center">
            <div className="hero-orange-curve"></div>
            <h1 className="text-[120px] leading-[0.9]">ШАГНИ В МИР</h1>
            <h2 className="text-[120px] leading-[0.9] text-[var(--accent)]">ТВОРЧЕСТВА</h2>
            <button
              onClick={handleOpenModal}
              className="group relative inline-flex items-center justify-center gap-3 bg-[#f6a623] text-white rounded-full hover:bg-[#f6a623]/90 transition-all duration-300 shadow-md hover:shadow-lg px-5 py-2.5 text-base font-medium mb-10"
            >
              <span>Заявка на обучение</span>
              <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4 text-[#f6a623]" />
              </span>
            </button>
            <div className="hero-photo w-[300px] max-h-[400px]">
              <img src="/hero-photo.png" alt="Ученики" className="object-contain w-full h-full" />
            </div>
          </div>

          <div className="hero-right flex flex-col items-start text-left z-10 mt-[320px] gap-4 max-w-[340px]">
            <p className="text-[22px] leading-[1.4] text-[var(--text-dark)]">
              Образование через <br />
              <span className="text-[var(--accent)]">творчество</span> — путь к <br />
              гармоничному развитию <br />личности.
            </p>
            <div className="flex flex-row items-start gap-6 pt-2">
              <div className="text-left">
                <div className="text-[50px] font-regular text-[var(--text-dark)]">15+</div>
                <div className="text-[15px] text-[var(--text-light)] leading-tight">
                  Различных<br />программ<br />обучения
                </div>
              </div>
              <div className="text-left">
                <div className="text-[50px] font-regular text-[var(--text-dark)]">20+</div>
                <div className="text-[15px] text-[var(--text-light)] leading-tight">
                  Квалифицированных<br />воспитателей<br />в штате
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Мобильная версия - компактная, без огромных отступов */}
      <section className="lg:hidden pt-16 pb-2">
        <div className="px-4">
          
          {/* Заголовки */}
          <div className="text-center">
            <h1 className="text-5xl font-bold leading-[1.1] text-gray-800">
              ШАГНИ В МИР
            </h1>
            <h2 className="text-5xl font-bold leading-[1.1] -mt-1 text-[#f6a623]">
              ТВОРЧЕСТВА
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#f6a623] to-orange-400 rounded-full mx-auto mt-1"></div>
          </div>
          
          {/* Описание */}
          <p className="text-sm text-gray-600 text-center leading-relaxed mt-3 px-4">
            Образование через{' '}
            <span className="text-[#f6a623] font-semibold">творчество</span>
            {' '}— путь к гармоничному развитию личности.
          </p>

          {/* Кнопка */}
          <div className="flex justify-center mt-3">
            <button
              onClick={handleOpenModal}
              className="group relative inline-flex items-center justify-center gap-2 bg-[#f6a623] text-white rounded-full hover:bg-[#f6a623]/90 transition-all duration-300 shadow-md px-5 py-2 text-sm font-medium"
            >
              <span>Заявка на обучение</span>
              <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="w-3 h-3 text-[#f6a623]" />
              </span>
            </button>
          </div>

          {/* Фото */}
          <div className="flex justify-center mt-3">
            <div className="hero-photo w-36">
              <img 
                src="/hero-photo.png" 
                alt="Ученики" 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Статистика - компактная, без лишних отступов */}
          <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mt-2">
            <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#f6a623]">15+</div>
              <div className="text-[10px] text-gray-600 leading-tight">
                Различных программ обучения
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-[#f6a623]">20+</div>
              <div className="text-[10px] text-gray-600 leading-tight">
                Квалифицированных воспитателей
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Модальные окна */}
      {showModal && (
        <ApplicationEditModal
          application={null}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          publicMode={true}
        />
      )}
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}