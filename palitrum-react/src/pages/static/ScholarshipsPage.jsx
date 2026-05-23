import StaticPage from "../../components/common/StaticPage";
import { Award } from "lucide-react";

export default function ScholarshipsPage() {
  return (
    <StaticPage title="Стипендии и меры поддержки обучающихся">
      <div className="bg-[#FFF9F2] p-12 rounded-3xl shadow-lg text-center max-w-xl mx-auto">
        <Award size={48} className="text-[var(--accent)] mx-auto mb-4" />
        <p className="text-lg">Наличие и условия предоставления обучающимся стипендий:</p>
        <p className="mt-4 text-base font-semibold">МАУ ДО "Ермолинская ДШИ" не предоставляет стипендии.</p>
      </div>
    </StaticPage>
  );
}