import React from "react";
import { User } from "lucide-react";

export default function TestimonialsCards() {
  const messages = [
    { name: "Алексей", text: "Спасибо преподавателям за эмоциональные концерты!" },
    { name: "Мария", text: "Очень нравится атмосфера школы и занятия!" },
    { name: "Екатерина", text: "Прекрасная школа, дети всегда довольны занятиями!" },
    { name: "Иван", text: "Очень уютное место, приятно приходить!" },
    { name: "София", text: "Обожаем занятия по вокалу!" },
  ];

  const colors = ["#FFF4E5", "#FFF9F2", "#FFEFD6", "#FFF1C2"];

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-[50px] font-bold text-gray-900 mb-10 text-center">
        Что о нас говорят?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="relative w-full max-w-[340px] p-6 rounded-3xl shadow-xl transform transition duration-500 hover:scale-105"
            style={{
              backgroundColor: colors[i % colors.length],
              rotate: `${(i % 3 - 1) * 2}deg`,
            }}
          >
            <div className="absolute -top-4 -left-4 bg-[#f6a623] p-3 rounded-full shadow-md">
              <User size={20} className="text-white" />
            </div>

            <h4 className="font-bold text-[#f6a623] text-[25px] mb-2">{msg.name}</h4>
            <p className="text-gray-700">{msg.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
