// src/pages/static/BasicInfoPage.jsx
import React, { useState, useEffect } from 'react';
import StaticPage from "../../components/common/StaticPage";
import { historyData, licensesFiles, documentsFiles } from "../../data/basicInfoData";
import DocumentCard from "../../components/common/DocumentCard";
import { getPublicSettings } from "../../api/api";

export default function BasicInfoPage() {
  const [contacts, setContacts] = useState({
    legalAddress: '173517, Новгородская обл., д. Ермолино, д.33б',
    directorPhone: '8(8162) 747731',
    email: 'dshi.ermolino@mail.ru'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const publicInfo = await getPublicSettings();
        if (publicInfo) {
          setContacts(prev => ({
            legalAddress: (publicInfo.address && publicInfo.address.trim()) ? publicInfo.address : prev.legalAddress,
            directorPhone: (publicInfo.phone && publicInfo.phone.trim()) ? publicInfo.phone : prev.directorPhone,
            email: (publicInfo.email && publicInfo.email.trim()) ? publicInfo.email : prev.email
          }));
        }
      } catch (err) {
        console.warn('Не удалось загрузить контакты из настроек, используются значения по умолчанию');
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, []);

  return (
    <StaticPage title="Основные сведения">
      <div className="space-y-12">
        {/* История */}
        <div className="bg-white p-10 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-semibold mb-8 text-[var(--accent)] text-center">История учреждения</h2>
          <div className="relative pl-10">
            <div className="absolute top-0 left-5 h-full w-1 rounded-full bg-gradient-to-b from-[var(--accent)] to-orange-200"></div>
            {historyData.map((item, idx) => (
              <div key={idx} className="mb-10 relative flex items-start">
                <div className="absolute -left-7 w-14 h-14 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center shadow-lg">
                  {item.year}
                </div>
                <p className="ml-8 text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Контакты */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#FFF9F2] p-8 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--accent)]">Контакты</h2>
            {loading ? (
              <p className="text-gray-500">Загрузка контактов...</p>
            ) : (
              <div className="space-y-3">
                <p><span className="font-semibold">Юридический адрес:</span> {contacts.legalAddress}</p>
                <p><span className="font-semibold">Телефон директора:</span> {contacts.directorPhone}</p>
                <p><span className="font-semibold">E-mail:</span> {contacts.email}</p>
              </div>
            )}
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-[var(--accent)]">Режим работы учреждения</h2>
            <ul className="space-y-3 text-lg">
              <li>Понедельник — Пятница: <b>9:00 – 20:00</b></li>
              <li>Суббота: <b>9:00 – 16:00</b></li>
              <li>Воскресенье: <b>выходной</b></li>
            </ul>
          </div>
        </div>

        {/* Лицензии */}
        <div className="bg-[#FFF9F2] p-8 rounded-3xl shadow-lg">
          <h2 className="text-3xl font-semibold mb-6 text-[var(--accent)]">Выписка из реестра лицензий</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {licensesFiles.map((file, idx) => (
              <DocumentCard key={idx} title={file.title} fileUrl={file.file} />
            ))}
          </div>
        </div>

        {/* Документы */}
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <h2 className="text-3xl font-semibold mb-6 text-[var(--accent)]">Документы и учебные материалы</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {documentsFiles.map((doc, idx) => (
              <DocumentCard key={idx} title={doc.name} fileUrl={doc.file} />
            ))}
          </div>
        </div>
      </div>
    </StaticPage>
  );
}