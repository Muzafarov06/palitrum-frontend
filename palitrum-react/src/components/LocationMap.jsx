import React from "react";

export default function LocationMap() {
  return (
    <section className="w-full max-w-7xl mx-auto">
      <h2 className="text-[50px] font-bold text-gray-900 mb-10 text-center">
        Нас легко найти!
      </h2>

      <div className="w-full rounded-3xl overflow-hidden shadow-xl">
        <iframe
          src="https://yandex.ru/map-widget/v1/?text=Новгородский%20район%2C%20Ермолинское%20сельское%20поселение%2C%20деревня%20Ермолино%2C%2033Б&z=17&lang=ru_RU"
          width="100%"
          height="350"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}
