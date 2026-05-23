import StaticPage from "../../components/common/StaticPage";
import { MapPin, Home, Grid, ArrowUp, Tag, Book, Globe } from "lucide-react";
import { facilitiesList, electronicResourcesList } from "../../data/facilitiesData";

export default function FacilitiesPage() {
  return (
    <StaticPage title="Материально-техническое обеспечение">
      <div className="grid md:grid-cols-2 gap-6">
        {facilitiesList.map((f, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">{f.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><MapPin className="mx-auto mb-2 text-[var(--accent)]" /><b>Адрес</b><p className="text-sm">{f.address}</p></div>
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><Home className="mx-auto mb-2 text-[var(--accent)]" /><b>Объект</b><p className="text-sm">{f.building}</p></div>
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><Grid className="mx-auto mb-2 text-[var(--accent)]" /><b>Площадь</b><p className="text-sm">{f.area}</p></div>
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><ArrowUp className="mx-auto mb-2 text-[var(--accent)]" /><b>Этаж</b><p className="text-sm">{f.floor}</p></div>
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><Tag className="mx-auto mb-2 text-[var(--accent)]" /><b>Собственность</b><p className="text-sm">{f.ownership}</p></div>
              <div className="bg-[#FFF9F2] p-4 rounded-lg text-center"><Book className="mx-auto mb-2 text-[var(--accent)]" /><b>Использование</b><p className="text-sm">{f.usage}</p></div>
            </div>
            {f.documents && <div className="mt-4 bg-[#FFF9F2] p-4 rounded-lg"><b>Документы:</b><ul className="list-disc ml-5 mt-2">{f.documents.map((d, idx) => <li key={idx}>{d}</li>)}</ul></div>}
            {f.accessibility && <div className="mt-4 bg-[#FFF9F2] p-4 rounded-lg"><b>Доступная среда:</b><ul className="list-disc ml-5 mt-2">{f.accessibility.map((a, idx) => <li key={idx}>{a}</li>)}</ul></div>}
          </div>
        ))}
      </div>
      <div><h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">Электронные образовательные ресурсы</h2>
        <div className="grid md:grid-cols-3 gap-4">{electronicResourcesList.map((res, i) => <a key={i} href={res.link} target="_blank" rel="noopener" className="bg-[#FFF9F2] p-4 rounded-2xl shadow hover:bg-[#FFF1D6] flex items-center gap-3"><Globe className="text-[var(--accent)]" /><span>{res.name}</span></a>)}</div>
      </div>
    </StaticPage>
  );
}