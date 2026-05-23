import StaticPage from "../../components/common/StaticPage";
import IconLinkCard from "../../components/common/IconLinkCard";
import { ExternalLink } from "lucide-react";

const links = [
  { title: "Федеральный портал проектов нормативных правовых актов", link: "https://regulation.gov.ru/" },
  { title: 'Федеральный закон от 17.07.2009 №172-ФЗ "Об антикоррупционной экспертизе..."', link: "http://pravo.gov.ru/proxy/ips/?searchres=&bpas=cd00000&intelsearch=172-%D4%C7&sort=-1" },
  { title: "Перечень должностей, при замещении которых служащие обязаны предоставлять сведения о доходах", link: "#" }
];

export default function AntiCorruptionExpertisePage() {
  return (
    <StaticPage title="Антикоррупционная экспертиза">
      <div className="bg-[#FFF6EA] border border-orange-200 rounded-3xl p-8 shadow-md">
        <p className="text-lg leading-relaxed mb-4">Антикоррупционная экспертиза – это деятельность по выявлению в нормативных правовых актах и их проектах положений, содержащих коррупционные факторы.</p>
        <p className="text-lg leading-relaxed">Информация о подготовке проектов нормативных актов, результатах общественного обсуждения и независимой экспертизы размещается по следующим ссылкам:</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-6 mt-6">
        {links.map((item, idx) => (
          <IconLinkCard key={idx} icon={ExternalLink} title={item.title} href={item.link} />
        ))}
      </div>
    </StaticPage>
  );
}