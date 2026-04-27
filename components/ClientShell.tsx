"use client";

import TopNav from "./TopNav";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Animated background */}
      <div className="fias-bg">
        <div className="fias-floater-mid" />
        <div className="fias-floater-white" />
      </div>
      <div className="fias-grid" />

      {/* App shell */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
