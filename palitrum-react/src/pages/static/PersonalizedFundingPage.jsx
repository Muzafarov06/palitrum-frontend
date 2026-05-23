import StaticPage from "../../components/common/StaticPage";
import { fundingSteps, fundingDocs } from "../../data/personalizedFundingData";
import DocumentCard from "../../components/common/DocumentCard";

export default function PersonalizedFundingPage() {
  return (
    <StaticPage title="Персонифицированное финансирование дополнительного образования">
      <div className="bg-[#FFF9F2] border border-orange-200 rounded-3xl p-8 text-center">
        <p>Уважаемые родители! Мы кратко объясним, зачем нужен сертификат и как работает система персонифицированного финансирования.</p>
      </div>
      <div className="relative pl-12">
        <div className="absolute left-7 top-0 w-1 h-full bg-orange-300 rounded-full"></div>
        {fundingSteps.map((step, i) => (
          <div key={i} className="flex gap-6 items-start relative mb-8">
            <div className="absolute left-0 top-2 w-14 h-14 bg-white rounded-full border border-orange-300 shadow-md flex items-center justify-center">
              <span className="text-orange-500 font-bold text-xl">{i+1}</span>
            </div>
            <div className="ml-20 bg-white p-6 rounded-2xl border border-orange-100 shadow-md">
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {fundingDocs.map((doc, i) => <DocumentCard key={i} title={doc.title} fileUrl={doc.file} />)}
      </div>
    </StaticPage>
  );
}