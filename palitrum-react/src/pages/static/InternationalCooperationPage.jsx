import StaticPage from "../../components/common/StaticPage";
import { Globe } from "lucide-react";

export default function InternationalCooperationPage() {
  return (
    <StaticPage title="Международное сотрудничество">
      <div className="bg-[#FFF9F2] p-12 rounded-3xl shadow-lg text-center max-w-2xl mx-auto">
        <Globe size={48} className="text-[var(--accent)] mx-auto mb-4" />
        <p>Информация о заключенных и планируемых к заключению договорах с иностранными и (или) международными организациями по вопросам образования и науки.</p>
        <p className="mt-4 font-semibold">В настоящий момент договоры с международными организациями отсутствуют.</p>
      </div>
    </StaticPage>
  );
}