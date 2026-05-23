import StaticPage from "../../components/common/StaticPage";
import { useState } from "react";
import { galleryCategories, galleryImages } from "../../data/galleryData";

export default function GalleryPage() {
  const [active, setActive] = useState("events");
  return (
    <StaticPage title="Галерея школы искусств">
      <div className="flex justify-center gap-4 mb-10">
        {galleryCategories.map((c) => (
          <button key={c.id} className={`px-6 py-2 rounded-xl text-lg font-medium transition ${active === c.id ? "bg-[#f6a623] text-white shadow-lg" : "bg-[#FFF6EA] hover:bg-[#f6a623]"}`} onClick={() => setActive(c.id)}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {galleryImages[active].map((img, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer break-inside-avoid">
            <img src={img.src} alt={img.title} className="w-full transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/95 to-transparent opacity-0 group-hover:opacity-100 transition">
              <p className="text-lg font-semibold text-white">{img.title}</p>
            </div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}