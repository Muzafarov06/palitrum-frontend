import StaticPage from "../../components/common/StaticPage";
import IconLinkCard from "../../components/common/IconLinkCard";
import { BookOpen, FileText } from "lucide-react";
import { methodicalResources, methodicalMemos } from "../../data/methodicalMaterialsData";

export default function MethodicalMaterialsPage() {
  return (
    <StaticPage title="Методические материалы">
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6"><BookOpen size={28} className="text-[var(--accent)]" /><h2 className="text-2xl font-semibold">Ссылки на интернет-ресурсы</h2></div>
        <div className="grid sm:grid-cols-2 gap-6">{methodicalResources.map((item, i) => <IconLinkCard key={i} icon={FileText} title={item.title} href={item.link} />)}</div>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-6"><FileText size={28} className="text-[var(--accent)]" /><h2 className="text-2xl font-semibold">Памятки</h2></div>
        <div className="grid sm:grid-cols-2 gap-6">{methodicalMemos.map((item, i) => <IconLinkCard key={i} icon={FileText} title={item.title} href={item.link} />)}</div>
      </div>
    </StaticPage>
  );
}