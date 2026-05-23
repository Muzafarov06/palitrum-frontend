import StaticPage from "../../components/common/StaticPage";
import DocumentCard from "../../components/common/DocumentCard";

const items = [
  { title: "Информационное письмо о запрете подарков", file: "#" },
  { title: "Памятка: виды коррупционных правонарушений", file: "#" }
];

export default function AntiCorruptionDocsPage() {
  return (
    <StaticPage title="Доклады, отчеты, обзоры, письма, статистическая информация по вопросам противодействия коррупции">
      <div className="space-y-4">
        {items.map((item, idx) => (
          <DocumentCard key={idx} title={item.title} fileUrl={item.file} />
        ))}
      </div>
    </StaticPage>
  );
}