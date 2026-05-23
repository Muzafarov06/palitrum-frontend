import StaticPage from "../../components/common/StaticPage";
import { Info, ArrowRightCircle } from "lucide-react";
import { qualityAssessment } from "../../data/qualityAssessmentData";

export default function QualityAssessmentPage() {
  return (
    <StaticPage title={qualityAssessment.title}>
      <div className="bg-gradient-to-r from-[#FFF9F2] to-[#FFF6EA] border border-orange-200 rounded-3xl p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Info size={28} className="text-orange-500" />
          <h2 className="text-2xl font-semibold text-orange-500">Ваше мнение важно</h2>
        </div>
        <p className="text-lg leading-relaxed">{qualityAssessment.description}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="bg-gradient-to-br from-[#FFF4E5] to-[#FFEFD6] border border-orange-200 rounded-3xl p-6 text-center">
          <p className="text-orange-500 font-semibold mb-2">QR-НОКО</p>
          <img src={qualityAssessment.qrCodeUrl} alt="QR код НОКО" className="w-36 h-36 mx-auto" />
        </div>
        <a href={qualityAssessment.formUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#FFF6EA] to-[#FFF1D6] border rounded-3xl p-6 text-center flex flex-col gap-2">
          <span className="text-orange-500 font-semibold text-lg flex items-center gap-2">Пройти анкетирование <ArrowRightCircle size={20} /></span>
          <span className="text-gray-700 text-sm">Откроется в новом окне</span>
        </a>
      </div>
      <iframe src={qualityAssessment.formUrl} width="100%" height="800" frameBorder="0" title="Форма НОКО" className="rounded-3xl"></iframe>
    </StaticPage>
  );
}