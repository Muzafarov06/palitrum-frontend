import StaticPage from "../../components/common/StaticPage";
import { CreditCard, FileText, BarChart2 } from "lucide-react";

const sections = [
  { title: "Объем образовательной деятельности", items: [
    { name: "Федеральный бюджет", value: "не осуществляется", icon: CreditCard },
    { name: "Бюджет субъектов РФ", value: "не осуществляется", icon: CreditCard },
    { name: "Местные бюджеты", value: "не осуществляется", icon: CreditCard },
    { name: "Договоры платных образовательных услуг", value: "не осуществляется", icon: CreditCard }
  ]},
  { title: "Муниципальное задание", items: [
    { name: "Муниципальное задание 2023г.", icon: FileText, file: "#" },
    { name: "Отчет о муниципальном задании 2023г.", icon: FileText, file: "#" },
    { name: "Муниципальное задание 2024г.", icon: FileText, file: "#" },
    { name: "Отчет о муниципальном задании 2024г.", icon: FileText, file: "#" },
    { name: "Муниципальное задание 2025г.", icon: FileText, file: "#" }
  ]},
  { title: "Планы и отчеты ФХД", items: [
    { name: "План ФХД 2023г.", icon: BarChart2, file: "#" },
    { name: "Отчет ФХД 2023г.", icon: BarChart2, file: "#" },
    { name: "План ФХД 2024г.", icon: BarChart2, file: "#" },
    { name: "Отчет ФХД 2024г.", icon: BarChart2, file: "#" },
    { name: "План ФХД 2025г.", icon: BarChart2, file: "#" }
  ]}
];

export default function FinancialPage() {
  return (
    <StaticPage title="Финансово-хозяйственная деятельность">
      {sections.map((sec, idx) => (
        <div key={idx} className="mb-12">
          <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4">{sec.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sec.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <a key={i} href={item.file || "#"} className="bg-[#FFF9F2] p-6 rounded-3xl shadow-lg text-center hover:scale-105 transition">
                  <Icon size={32} className="text-[var(--accent)] mx-auto mb-3" />
                  <p className="font-semibold">{item.name}</p>
                  {item.value && <p className="text-sm mt-1">{item.value}</p>}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </StaticPage>
  );
}