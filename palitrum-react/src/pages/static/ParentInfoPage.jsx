import StaticPage from "../../components/common/StaticPage";
import { parentSections } from "../../data/parentInfoData";
import * as Icons from "lucide-react";

export default function ParentInfoPage() {
  return (
    <StaticPage title="Информация для родителей" subtitle="В этом разделе вы найдёте все важные сведения — от программ обучения и расписания до документов и контактов.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {parentSections.map((sec) => {
          const Icon = Icons[sec.icon];
          return (
            <a key={sec.id} href={sec.href} className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl hover:bg-[#FFF4E5] transition">
              <div className="p-4 bg-[var(--accent)] text-white rounded-full group-hover:bg-[#e29216] transition"><Icon size={24} /></div>
              <span className="text-lg font-semibold text-center">{sec.title}</span>
            </a>
          );
        })}
      </div>
    </StaticPage>
  );
}