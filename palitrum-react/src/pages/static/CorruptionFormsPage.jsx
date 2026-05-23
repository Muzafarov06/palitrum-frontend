import StaticPage from "../../components/common/StaticPage";
import IconLinkCard from "../../components/common/IconLinkCard";
import { FileText } from "lucide-react";

const forms = [
    { 
        title: "Формы и бланки", 
        link: "https://spravki-bk.ru/" 
    },
    {   
        title: "СПО «Справки БК»", 
        link: "https://gossluzhba.gov.ru/Page/index/spravki_bk" 
    },
    {
        title: "Уведомление представителя нанимателя о фактах склонения к коррупционным правонарушениям",
        link: "#",
    },
    {
        title: "Уведомление представителя нанимателя о намерении выполнять иную оплачиваемую работу",
        link: "#",
    },
    {
        title: "Уведомление о конфликте интересов или возможности его возникновения",
        link: "#",
    },
    { 
        title: "Уведомление о получении подарка", link: "#"
    },
    {
        title: "Справка о расходах лица, замещающего государственную должность РФ",
        link: "#",
    },
    { 
        title: "Справка о доходах, расходах", link: "#"
    },
    { 
        title: "Обращение по факту коррупции", link: "#"

    },
    { 
        title: "Обращение гражданина о согласии", link: "#"

    },
    {
        title: "Заявление служащего о невозможности представить сведения о доходах",
        link: "#",
    },
    { 
        title: "Заявление о выкупе подарка", link: "#"
    },
];

export default function CorruptionFormsPage() {
  return (
    <StaticPage title="Формы документов, связанных с противодействием коррупции">
      <div className="grid md:grid-cols-2 gap-4">
        {forms.map((f, i) => <IconLinkCard key={i} icon={FileText} title={f.title} href={f.link} />)}
      </div>
    </StaticPage>
  );
}