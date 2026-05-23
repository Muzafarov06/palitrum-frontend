import StaticPage from "../../components/common/StaticPage";
import { Utensils, Info, XCircle } from "lucide-react";

export default function OrganizationFoodPage() {
  const items = [
    { icon: Utensils, text: "Питание обучающихся не предусмотрено." },
    { icon: Info, text: "В соответствии с уставом и материально-технической базой учреждения, организация питания не осуществляется." },
    { icon: XCircle, text: "Детская школа искусств не располагает помещениями и инфраструктурой для организации питания." }
  ];
  return (
    <StaticPage title="Организация питания в образовательной организации">
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="bg-[#FFF9F2] p-6 rounded-2xl shadow-lg flex gap-4 items-center hover:shadow-xl transition">
            <item.icon size={40} className="text-[var(--accent)]" />
            <p className="text-lg">{item.text}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}