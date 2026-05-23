import StaticPage from "../../components/common/StaticPage";
import { useState } from "react";
import { User } from "lucide-react";
import { initialMessages } from "../../data/guestBookData";

const colors = ["#FFF4E5", "#FFF9F2", "#FFEFD6", "#FFF1C2"];

export default function GuestBookPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [form, setForm] = useState({ name: "", text: "", consent: false });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.text || !form.consent) return;
    setMessages([...messages, { name: form.name, text: form.text }]);
    setForm({ name: "", text: "", consent: false });
  };
  return (
    <StaticPage title="Гостевая книга">
      <div className="bg-[#FFF9F2] border border-orange-200 rounded-3xl p-8 text-center mb-12">
        <p className="text-lg font-semibold">Спасибо преподавателям школы искусств за эмоциональные и качественные концерты!</p>
      </div>
      <div className="flex flex-wrap gap-6 justify-center mb-12">
        {messages.map((msg, i) => (
          <div key={i} className="relative w-[300px] p-6 rounded-3xl shadow-xl" style={{ backgroundColor: colors[i % colors.length], rotate: `${(i % 3 - 1) * 2}deg` }}>
            <div className="absolute -top-4 -left-4 bg-[#f6a623] p-3 rounded-full shadow-md"><User size={20} className="text-white" /></div>
            <h4 className="font-bold text-[#f6a623] mb-2">{msg.name}</h4>
            <p className="text-gray-700">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#FFF9F2] p-8 rounded-3xl shadow-2xl border border-orange-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#f6a623]">Оставьте своё сообщение</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Ваше имя *" className="border rounded-xl p-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <textarea placeholder="Сообщение *" rows={4} className="border rounded-xl p-3 resize-none" value={form.text} onChange={e => setForm({...form, text: e.target.value})} required />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.consent} onChange={e => setForm({...form, consent: e.target.checked})} required className="accent-[#f6a623]" /> Даю согласие на обработку моих персональных данных</label>
          <button type="submit" className="bg-[#f6a623] text-white font-semibold py-3 rounded-xl hover:bg-[#e29216] transition">Отправить</button>
        </form>
      </div>
    </StaticPage>
  );
}