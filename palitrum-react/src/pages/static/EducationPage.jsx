// src/pages/static/EducationPage.jsx
import StaticPage from "../../components/common/StaticPage";
import { educationLevels, electronicResources, methodologicalMaterials } from "../../data/educationData";
import IconLinkCard from "../../components/common/IconLinkCard";
import { Globe, Book, FileText } from "lucide-react";

export default function EducationPage() {
  return (
    <StaticPage title="Образование">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#FFF9F2] p-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">Уровень образования</h2>
          <ul className="list-disc ml-6 space-y-2">
            {educationLevels.map((level, i) => <li key={i}>{level}</li>)}
          </ul>
        </div>
        <div className="bg-[#FFF9F2] p-6 rounded-3xl shadow-lg">
          <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">Форма обучения и язык</h2>
          <p><b>Форма обучения:</b> очная</p>
          <p><b>Язык образования:</b> русский</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">Электронные ресурсы</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {electronicResources.map((res, i) => (
            <IconLinkCard key={i} icon={Globe} title={res.name} href={res.link} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">Методические материалы</h2>
        <div className="space-y-2">
          {methodologicalMaterials.map((mat, i) => (
            <div key={i} className="bg-[#FFF9F2] p-3 rounded-xl flex items-center gap-3">
              <FileText size={20} className="text-[var(--accent)]" />
              <span>{mat}</span>
            </div>
          ))}
        </div>
      </div>
    </StaticPage>
  );
}