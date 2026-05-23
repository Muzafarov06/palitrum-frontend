import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "С какого возраста принимают детей в школу искусств?",
      a: "По дополнительным предпрофессиональным и общеразвивающим общеобразовательным программам с 6,5 лет."
    },
    {
      q: "Возможно ли обучение в ДШИ детей младше 6 лет 6 месяцев?",
      a: "Для детей от 4 до 6 лет работает общеэстетическое отделение."
    },
    {
      q: "Какие документы необходимо предоставить при поступлении?",
      a: `- заявление установленной формы;
- копия свидетельства о рождении;
- фото 3×4 (2 шт);
- СНИЛС ребенка;
- паспорт родителя (законного представителя).`
    },
    {
      q: "Не будет ли мешать обучение в ДШИ основному обучению в общеобразовательной школе?",
      a: "Расписание занятий составляется индивидуально для каждого обучающегося исходя из занятости в общеобразовательной школе."
    },
    {
      q: "В каких направлениях обучают в вашей школе?",
      a: `В нашей школе ведется обучение по 3 направлениям:
- музыкальное (фортепиано, гитара, народное пение, эстрадное пение, фольклор);
- художественное;
- хореографическое.`
    },
    {
      q: "Получает ли обучающийся после окончания школы какой-либо документ?",
      a: "Да. Обучающимся, в полном объеме освоившим дополнительные программы, выдается Свидетельство об освоении указанной программы."
    }
  ];

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="w-full  py-12">
      <h1 className="text-[50px] font-bold text-gray-900 text-center">
        Часто задаваемые вопросы
      </h1>

      <div className="space-y-5 w-full">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="
              bg-white shadow-md rounded-2xl border border-gray-200 
              hover:shadow-xl transition-all duration-300 w-full
            "
          >
            <button
              onClick={() => toggle(i)}
              className="
                w-full flex justify-between items-center gap-4
                px-6 py-5 text-left
                hover:bg-[#e29216]/10 rounded-2xl transition
              "
            >
              <div className="flex gap-4">
                <div
                  className="
                    text-[#e29216] font-bold text-2xl min-w-8 text-center
                  "
                >
                  {i + 1}
                </div>

                <span className="text-lg font-semibold text-gray-900">
                  {item.q}
                </span>
              </div>

              <ChevronDown
                className={`w-6 h-6 text-gray-500 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === i && (
              <div className="px-6 pb-6 pt-0 text-gray-700 whitespace-pre-line leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
