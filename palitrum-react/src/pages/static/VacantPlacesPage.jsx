// src/pages/static/VacantPlacesPage.jsx
import StaticPage from "../../components/common/StaticPage";
import { programs, commissions } from "../../data/vacantPlacesData";
import InfoCard from "../../components/common/InfoCard";
import { Users, FileText } from "lucide-react";

export default function VacantPlacesPage() {
  return (
    <StaticPage title="Вакантные места для приема (перевода) обучающихся">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((p) => (
          <div key={p.number} className="bg-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-lg font-bold mb-2">{p.name}</h3>
            <ul className="text-sm space-y-1">
              <li>Федеральный бюджет: {p.federal}</li>
              <li>Бюджет субъектов РФ: {p.regional}</li>
              <li>Местный бюджет: {p.local}</li>
              <li>Платные услуги: {p.paid}</li>
            </ul>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {commissions.map((com, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">{com.title}</h3>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {com.members.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}