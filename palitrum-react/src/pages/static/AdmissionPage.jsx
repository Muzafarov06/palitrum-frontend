import StaticPage from "../../components/common/StaticPage";
import { Calendar, UserCheck, FileText, Info } from "lucide-react";

const steps = [
  { icon: Calendar, title: "Сроки подачи заявлений", text: "С 14.04.2025 начинается набор на обучение в 2025-2026 учебном году." },
  { icon: UserCheck, title: "Вакантные места", text: "Информация о количестве доступных мест по каждому направлению." },
  { icon: FileText, title: "Документы для поступления", text: "Заявление, копия свидетельства о рождении, фотография, согласие на обработку данных." },
  { icon: Info, title: "Особые условия", text: "Для программ с ОВЗ или предпрофессиональных программ — дополнительные требования." }
];

const docs = [
  "Новое заявление о предоставлении услуги",
  "Договор об образовании",
  "Приказ о комиссиях по приему документов",
  "Приказ о начале набора на 2025-2026 учебный год"
];

export default function AdmissionPage() {
  return (
    <StaticPage title="Информация о поступлении">
      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-md flex gap-4 items-start">
            <step.icon size={28} className="text-[var(--accent)]" />
            <div><h3 className="text-xl font-semibold">{step.title}</h3><p>{step.text}</p></div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {docs.map((doc, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border shadow-md text-center">
            <FileText size={32} className="text-[var(--accent)] mx-auto mb-2" />
            <p>{doc}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}