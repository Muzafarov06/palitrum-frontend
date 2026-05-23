// src/pages/static/FAQPage.jsx
import StaticPage from "../../components/common/StaticPage";
import { faqData } from "../../data/faqData";
import AccordionSection from "../../components/common/AccordionSection";

export default function FAQPage() {
  return (
    <StaticPage title="Часто задаваемые вопросы">
      <AccordionSection
        title="Вопросы и ответы"
        items={faqData}
        renderItem={(item, idx) => (
          <div key={idx} className="border-b pb-4">
            <h3 className="font-bold text-lg">{item.q}</h3>
            <p className="text-gray-700 whitespace-pre-line">{item.a}</p>
          </div>
        )}
      />
    </StaticPage>
  );
}