import StaticPage from "../../components/common/StaticPage";
import { useState } from "react";
import { User, Mail, MessageCircle } from "lucide-react";

export default function AppealsDispatcherPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", consent: false });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Ваше обращение отправлено!");
    setForm({ name: "", email: "", message: "", consent: false });
  };
  return (
    <StaticPage title="Диспетчер обращений">
      <div className="bg-[#FFF9F2] border border-orange-200 rounded-3xl p-8 text-center">
        <p>Чтобы получить оперативный и квалифицированный ответ, заполните все поля формы. Ваше обращение будет рассмотрено в течение 30 дней.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-[#FFF9F2] p-8 rounded-3xl space-y-4">
        <div className="relative"><User className="absolute top-3 left-3 text-[#f6a623]" /><input type="text" placeholder="Фамилия и имя *" className="w-full rounded-xl border p-3 pl-10" required onChange={e => setForm({...form, name: e.target.value})} /></div>
        <div className="relative"><Mail className="absolute top-3 left-3 text-[#f6a623]" /><input type="email" placeholder="Email *" className="w-full rounded-xl border p-3 pl-10" required onChange={e => setForm({...form, email: e.target.value})} /></div>
        <div className="relative"><MessageCircle className="absolute top-3 left-3 text-[#f6a623]" /><textarea placeholder="Текст обращения *" rows={5} className="w-full rounded-xl border p-3 pl-10" required onChange={e => setForm({...form, message: e.target.value})} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" required onChange={e => setForm({...form, consent: e.target.checked})} /> Даю согласие на обработку персональных данных</label>
        <button type="submit" className="bg-[#f6a623] text-white py-2 rounded-xl">Отправить обращение</button>
      </form>
    </StaticPage>
  );
}