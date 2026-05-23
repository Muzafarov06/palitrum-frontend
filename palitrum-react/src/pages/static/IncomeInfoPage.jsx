import StaticPage from "../../components/common/StaticPage";
import IconLinkCard from "../../components/common/IconLinkCard";
import { FileText } from "lucide-react";
import { incomeLinks } from "../../data/incomeInfoData";

export default function IncomeInfoPage() {
  return (
    <StaticPage title="Сведения о доходах, расходах, об имуществе и обязательствах имущественного характера">
      <div className="bg-white rounded-2xl shadow-md p-6 border">
        <p className="text-gray-700 mb-6">Здесь размещены сведения о доходах, расходах, об имуществе и обязательствах имущественного характера.</p>
        <div className="space-y-3">
          {incomeLinks.map((item, idx) => <IconLinkCard key={idx} icon={FileText} title={item.title} href={item.link} />)}
        </div>
      </div>
    </StaticPage>
  );
}