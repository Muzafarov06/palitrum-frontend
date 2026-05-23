// src/components/common/StaticPage.jsx
import React from "react";

export default function StaticPage({ title, subtitle, children }) {
  return (
    <main className="container pt-[180px] pb-16 space-y-12">
      <section className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold text-[var(--accent)] mb-4">{title}</h1>
        {subtitle && <p className="text-lg max-w-2xl mx-auto">{subtitle}</p>}
      </section>
      <div className="animate-fade-in">{children}</div>
    </main>
  );
}