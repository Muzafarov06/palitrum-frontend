import StaticPage from "../../components/common/StaticPage";
import { FileText } from "lucide-react";

export default function EducationalStandardsPage() {
  return (
    <StaticPage title="Образовательные стандарты и требования">
      <div className="flex flex-col items-center">
        <a href="/files/FGT_Fortepiano.pdf" download className="bg-[#FFF9F2] p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4 hover:shadow-2xl transition w-full max-w-xl text-center">
          <FileText size={48} className="text-[var(--accent)]" />
          <p className="text-lg font-semibold">ФГТ к дополнительной предпрофессиональной программе «Фортепиано» (приказ + дополнения)</p>
        </a>
      </div>
    </StaticPage>
  );
}