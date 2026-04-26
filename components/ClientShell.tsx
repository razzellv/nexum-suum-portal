"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="fias-bg">
        <div className="fias-floater-mid" />
        <div className="fias-floater-white" />
      </div>
      <div className="fias-grid" />
      <div className="flex min-h-screen relative z-10">
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <main
          className={`flex-1 transition-all duration-300 ${
            collapsed ? "ml-16" : "ml-60"
          } p-6 md:p-8`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
