import StaticPage from "../../components/common/StaticPage";
import { electronicResourcesList as electronicServicesList } from "../../data/electronicServicesData";
import { ExternalLink } from "lucide-react";

export default function ElectronicServicesPage() {
  return (
    <StaticPage title="Электронные услуги">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {electronicServicesList.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="bg-[#FFF9F2] p-6 rounded-2xl shadow-md hover:shadow-xl transition flex items-center justify-between hover:bg-[#FFF1D6]">
            <p className="font-medium text-lg">{item.name}</p>
            <ExternalLink className="text-[var(--accent)]" />
          </a>
        ))}
      </div>
    </StaticPage>
  );
}