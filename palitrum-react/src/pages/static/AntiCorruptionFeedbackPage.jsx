import StaticPage from "../../components/common/StaticPage";
import { Phone, Mail } from "lucide-react";
import { useState } from "react";

export default function AntiCorruptionFeedbackPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "", consent: false });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Сообщение отправлено (демо)");
  };
  return (
    <StaticPage title="Обратная связь для сообщений о фактах коррупции">
      <div className="bg-gray-50 border rounded-2xl p-6">
        <p className="mb-5">Информацию о готовящемся или свершившемся коррупционном преступлении Вы можете сообщить в органы власти по следующим телефонам:</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><Phone className="text-[#e29216]" /> Телефон «горячей линии» прокуратуры России: <b>+7 (495) 987-56-56</b></div>
          <div className="flex items-center gap-3"><Phone className="text-[#e29216]" /> Телефон доверия Следственного комитета России: <b>8-800-100-12-60</b></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <input type="text" placeholder="Ваше имя *" className="w-full rounded-xl border p-3" required onChange={e => setForm({...form, name: e.target.value})} />
        <input type="text" placeholder="Email или телефон *" className="w-full rounded-xl border p-3" required onChange={e => setForm({...form, contact: e.target.value})} />
        <textarea placeholder="Сообщение *" rows={4} className="w-full rounded-xl border p-3" required onChange={e => setForm({...form, message: e.target.value})} />
        <label className="flex items-center gap-2"><input type="checkbox" required onChange={e => setForm({...form, consent: e.target.checked})} /> Даю согласие на обработку моих персональных данных</label>
        <button type="submit" className="bg-[#f6a623] text-white px-6 py-2 rounded-xl">Отправить сообщение</button>
      </form>
    </StaticPage>
  );
}