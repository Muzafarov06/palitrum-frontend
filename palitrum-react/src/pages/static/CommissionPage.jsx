import StaticPage from "../../components/common/StaticPage";
import DocumentCard from "../../components/common/DocumentCard";

const items = [
  { title: 'Положение о комиссии по урегулированию споров в МАУ ДО "Ермолинская ДШИ"', file: "#" },
  { title: 'Порядок уведомления работниками о возникновении личной заинтересованности', file: "#" }
];

export default function CommissionPage() {
  return (
    <StaticPage title="Комиссия по соблюдению требований к служебному поведению и урегулированию конфликта интересов">
      <div className="space-y-4">
        {items.map((item, idx) => <DocumentCard key={idx} title={item.title} fileUrl={item.file} />)}
      </div>
    </StaticPage>
  );
}