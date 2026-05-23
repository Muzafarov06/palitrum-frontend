import StaticPage from "../../components/common/StaticPage";
import { useState } from "react";
import { User, Users, Briefcase, Layers, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { collegialBodies, pedagogicalCouncil, supervisoryCouncil } from "../../data/structureData";

export default function StructureAndManagementPage() {
  const [openPedagogical, setOpenPedagogical] = useState(false);
  const [openSupervisory, setOpenSupervisory] = useState(false);
  return (
    <StaticPage title="Структура и органы управления">
      <div className="flex justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-4xl">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center p-4 bg-[#FFF9F2] rounded-2xl shadow w-60 text-center"><User size={40} className="text-[var(--accent)] mb-2" /><p className="font-bold text-lg">Директор</p><p className="text-sm">Гращенко Светлана Павловна</p></div>
            <div className="w-1 bg-[var(--accent)] h-6"></div>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              {collegialBodies.map((body, idx) => {
                const Icon = body.icon === "Layers" ? Layers : body.icon === "Briefcase" ? Briefcase : Users;
                return <div key={idx} className="flex-1 bg-[#FFF9F2] rounded-3xl shadow-lg p-6 text-center"><Icon size={32} className="text-[var(--accent)] mx-auto mb-2" /><p className="font-semibold text-lg">{body.title}</p><p className="text-gray-700 text-sm">{body.description}</p></div>;
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg cursor-pointer" onClick={() => setOpenPedagogical(!openPedagogical)}>
          <div className="flex justify-between items-center"><p className="text-2xl font-bold text-[var(--accent)]">Педагогический совет</p>{openPedagogical ? <ChevronUp /> : <ChevronDown />}</div>
          {openPedagogical && <div className="mt-4 space-y-2 border-t pt-4"><p><span className="font-semibold">Председатель:</span> {pedagogicalCouncil.chairman}</p><p><span className="font-semibold">Секретарь:</span> {pedagogicalCouncil.secretary}</p><p><span className="font-semibold">Члены совета:</span></p><ul className="list-decimal list-inside ml-4">{pedagogicalCouncil.members.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg cursor-pointer" onClick={() => setOpenSupervisory(!openSupervisory)}>
          <div className="flex justify-between items-center"><p className="text-2xl font-bold text-[var(--accent)]">Наблюдательный совет</p>{openSupervisory ? <ChevronUp /> : <ChevronDown />}</div>
          {openSupervisory && <div className="mt-4 space-y-2 border-t pt-4"><p><span className="font-semibold">Председатель:</span> {supervisoryCouncil.chairman}</p><p><span className="font-semibold">Секретарь:</span> {supervisoryCouncil.secretary}</p><p><span className="font-semibold">Члены совета:</span></p><ul className="list-decimal list-inside ml-4">{supervisoryCouncil.members.map((m, i) => <li key={i}>{m}</li>)}</ul></div>}
        </div>
      </div>
    </StaticPage>
  );
}