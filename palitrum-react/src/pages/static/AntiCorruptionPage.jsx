// src/pages/static/AntiCorruptionPage.jsx
import StaticPage from "../../components/common/StaticPage";
import { sections } from "../../data/antiCorruptionData";
import IconLinkCard from "../../components/common/IconLinkCard";
import { FileText } from "lucide-react";

export default function AntiCorruptionPage() {
  return (
    <StaticPage title="Нормативные акты по противодействию коррупции">
      {sections.map((section, idx) => (
        <div key={idx} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{section.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, i) => (
              <IconLinkCard key={i} icon={FileText} title={item.name} href={item.link} />
            ))}
          </div>
        </div>
      ))}
    </StaticPage>
  );
}