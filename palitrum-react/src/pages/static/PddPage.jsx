import StaticPage from "../../components/common/StaticPage";
import { Car, BookOpen, Shield, AlertTriangle, CircleHelp } from "lucide-react";
import { pddReasons, pddTips, pddLookTips } from "../../data/pddData";

export default function PddPage() {
  return (
    <StaticPage title="Правила дорожного движения">
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-2xl shadow-md bg-white hover:bg-gradient-to-r from-orange-100 to-yellow-100"><Car className="text-orange-500 mb-3" /><h3 className="font-semibold">Безопасность на дороге</h3><p className="text-sm">Напоминайте ребёнку основы безопасного поведения.</p></div>
        <div className="p-6 rounded-2xl shadow-md bg-white hover:bg-gradient-to-r from-orange-100 to-yellow-100"><BookOpen className="text-blue-500 mb-3" /><h3 className="font-semibold">Маршрут в школу</h3><p className="text-sm">Пройдите с ребёнком путь до школы. Обратите внимание на разметку.</p></div>
        <div className="p-6 rounded-2xl shadow-md bg-white hover:bg-gradient-to-r from-orange-100 to-yellow-100"><Shield className="text-green-600 mb-3" /><h3 className="font-semibold">Перевозка детей</h3><p className="text-sm">Используйте ремни и удерживающие устройства.</p></div>
      </div>
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-8 rounded-3xl mb-10"><h2 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="text-orange-600" />Основные причины ДТП с детьми</h2><ul className="list-disc ml-6 mt-4 space-y-1">{pddReasons.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
      <div className="space-y-6"><h2 className="text-3xl font-bold flex items-center gap-2"><CircleHelp className="text-blue-600" />Советы родителям</h2><div className="space-y-4"><div className="bg-white p-6 rounded-2xl shadow-md"><h3 className="text-xl font-semibold mb-3">Что важно соблюдать:</h3><ul className="list-disc ml-6 space-y-2">{pddTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div><div className="bg-white p-6 rounded-2xl shadow-md"><h3 className="text-xl font-semibold mb-3">Учите ребёнка смотреть:</h3><ul className="list-disc ml-6 space-y-2">{pddLookTips.map((t, i) => <li key={i}>{t}</li>)}</ul></div></div></div>
    </StaticPage>
  );
}