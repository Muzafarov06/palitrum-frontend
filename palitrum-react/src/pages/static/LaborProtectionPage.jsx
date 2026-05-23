import StaticPage from "../../components/common/StaticPage";
import { Heart, Activity, ShieldCheck, FileText } from "lucide-react";

const points = [
  { icon: Heart, title: "Охрана здоровья обучающихся", text: "Созданы условия для охраны и укрепления здоровья учащихся, включая лиц с ОВЗ." },
  { icon: Activity, title: "Оптимальная нагрузка", text: "Определение учебной и внеучебной нагрузки, режима занятий и продолжительности каникул." },
  { icon: ShieldCheck, title: "Профилактика и безопасность", text: "Пропаганда здорового образа жизни, профилактика вредных привычек, антитеррористическая защищённость." }
];
const files = [
  { title: 'Положение об охране труда МАУ ДО "Ермолинская ДШИ"', file: "#" },
  { title: 'Отчет о проведении СОУТ МАУ ДО "Ермолинская ДШИ"', file: "#" }
];

export default function LaborProtectionPage() {
  return (
    <StaticPage title="Охрана труда">
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {points.map((p, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
            <p.icon size={32} className="text-[var(--accent)] mb-3" />
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <p className="mt-2 text-gray-700">{p.text}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {files.map((f, i) => (
          <a key={i} href={f.file} className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
            <FileText size={32} className="text-[var(--accent)]" />
            <span className="font-medium">{f.title}</span>
          </a>
        ))}
      </div>
    </StaticPage>
  );
}