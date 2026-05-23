import StaticPage from "../../components/common/StaticPage";
import { useState } from "react";
import { Send, Upload, Bookmark } from "lucide-react";
import { initialStories } from "../../data/memoryWallData";

export default function MemoryWallPage() {
  const [stories, setStories] = useState(initialStories);
  const [form, setForm] = useState({ name: "", veteranName: "", birthYear: "", story: "", files: [], consent: false });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.veteranName || !form.birthYear || !form.story || !form.consent) return;
    setStories([...stories, { name: form.veteranName, year: form.birthYear, text: form.story }]);
    setForm({ name: "", veteranName: "", birthYear: "", story: "", files: [], consent: false });
    alert("История добавлена на стенд!");
  };
  return (
    <StaticPage title="Помним. Гордимся. Чтим." subtitle="Сохраните историю своих предков-героев для будущих поколений.">
      <div className="bg-white/60 backdrop-blur-xl shadow-xl rounded-2xl p-8 border mb-12">
        <p>Заполните форму, укажите информацию о ветеране и его историю — она появится на стенде памяти.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl p-10 rounded-2xl shadow-xl space-y-7">
          <div><label className="block text-lg font-semibold mb-2">Ваше имя *</label><input type="text" className="w-full p-3 rounded-xl border" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><label className="block text-lg font-semibold mb-2">ФИО ветерана *</label><input type="text" className="w-full p-3 rounded-xl border" required value={form.veteranName} onChange={e => setForm({...form, veteranName: e.target.value})} /></div>
          <div><label className="block text-lg font-semibold mb-2">Год рождения ветерана *</label><input type="number" className="w-full p-3 rounded-xl border" required value={form.birthYear} onChange={e => setForm({...form, birthYear: e.target.value})} /></div>
          <div><label className="block text-lg font-semibold mb-2">История / биография *</label><textarea rows={5} className="w-full p-4 rounded-xl border" required value={form.story} onChange={e => setForm({...form, story: e.target.value})} /></div>
          <div><label className="block text-lg font-semibold mb-2">Прикрепить файлы</label><label className="flex items-center gap-3 px-5 py-3 bg-[#f6a623] text-white rounded-xl cursor-pointer"><Upload />Выберите файлы<input type="file" className="hidden" multiple onChange={e => setForm({...form, files: Array.from(e.target.files)})} /></label></div>
          <div className="flex items-start gap-3"><input type="checkbox" required className="mt-1 accent-[#f6a623]" checked={form.consent} onChange={e => setForm({...form, consent: e.target.checked})} /> Даю согласие на обработку моих персональных данных</div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#f6a623] hover:bg-[#e29216] text-white py-3.5 rounded-xl font-semibold"><Send /> Добавить на стенд</button>
        </form>
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-6"><Bookmark className="text-[#f6a623]" /><h2 className="text-2xl font-bold">Стенд Памяти</h2></div>
          <div className="space-y-6">
            {stories.map((s, i) => <div key={i} className="p-5 rounded-xl border shadow-md hover:shadow-lg transition bg-white/90"><p className="font-bold text-lg">{s.name} ({s.year} г.р.)</p><p className="text-gray-600">{s.text}</p></div>)}
          </div>
        </div>
      </div>
    </StaticPage>
  );
}