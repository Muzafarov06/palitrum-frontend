// src/pages/static/DocumentsPage.jsx
import StaticPage from "../../components/common/StaticPage";
import { documentCategories } from "../../data/documentsData";
import AccordionSection from "../../components/common/AccordionSection";
import DocumentCard from "../../components/common/DocumentCard";

export default function DocumentsPage() {
  return (
    <StaticPage title="Документы" subtitle="Все документы образовательной организации сгруппированы по категориям.">
      {documentCategories.map((cat, idx) => (
        <AccordionSection
          key={idx}
          title={cat.title}
          items={cat.documents}
          renderItem={(doc, i) => <DocumentCard key={i} title={doc} fileUrl="#" />}
        />
      ))}
    </StaticPage>
  );
}