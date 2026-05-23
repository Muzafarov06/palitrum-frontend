import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ? 64 : 256;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Десктопный Sidebar */}
      <div
        className="hidden md:block"
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          transition: "width 0.3s",
          overflow: "hidden",
        }}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
        />
      </div>

      {/* Мобильный Sidebar – оверлей, не занимает места */}
      <div className="block md:hidden">
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
        />
      </div>

      {/* Основной контент */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          background: "#f9fafb",
        }}
      >
        {children}
      </main>
    </div>
  );
}