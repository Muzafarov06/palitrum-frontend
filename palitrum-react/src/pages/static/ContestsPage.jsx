import StaticPage from "../../components/common/StaticPage";
import InfoCard from "../../components/common/InfoCard";
import { Trophy } from "lucide-react";

const contests = [
  { title: "Международный музыкальный конкурс «Созвездие талантов»", date: "Март 2025", place: "г. Калуга" },
  { title: "Региональный художественный конкурс «Юный акварелист»", date: "Апрель 2025", place: "г. Обнинск" },
  { title: "Вокальный конкурс «Голос поколения»", date: "Февраль 2025", place: "г. Жуков" }
];

export default function ContestsPage() {
  return (
    <StaticPage title="Конкурсы">
      <div className="grid md:grid-cols-2 gap-8">
        {contests.map((c, i) => (
          <InfoCard key={i} icon={Trophy} title={c.title} text={`${c.date}, ${c.place}`} />
        ))}
      </div>
    </StaticPage>
  );
}