"use client";

import Link from "next/link";

const packages = [
  {
    color: "emerald",
    accent: "#00ff88",
    border: "border-[#00ff88]/40",
    bg: "bg-[#00ff88]/10",
    glow: "hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]",
    textColor: "text-[#00ff88]",
    title: "Boiler Intelligence",
    href: "/boiler",
    icon: "🔥",
    bullets: [
      "Looker Studio live dashboard integration",
      "Digital log data entry — syncs to Google Sheets",
      "SOPs, safety modules, and operational procedures",
      "Combustion analysis, blowdown, LWFCO guides",
    ],
  },
  {
    color: "cyan",
    accent: "#00d4ff",
    border: "border-[#00d4ff]/40",
    bg: "bg-[#00d4ff]/10",
    glow: "hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]",
    textColor: "text-[#00d4ff]",
    title: "Chiller Intelligence",
    href: "/chiller",
    icon: "❄️",
    bullets: [
      "Real-time chiller performance dashboard",
      "Log chilled water, condenser, and refrigerant data",
      "Cooling tower and pump optimization guides",
      "Master checklists and log sheet library",
    ],
  },
  {
    color: "amber",
    accent: "#ffb800",
    border: "border-[#ffb800]/40",
    bg: "bg-[#ffb800]/10",
    glow: "hover:shadow-[0_0_30px_rgba(255,184,0,0.3)]",
    textColor: "text-[#ffb800]",
    title: "Facility Intelligence",
    href: "/facility",
    icon: "🏭",
    bullets: [
      "Full facility system SOPs — 9 major systems covered",
      "Compliance handbook and regulatory reference guide",
      "Multi-system log entry with status tracking",
      "Facility client dashboard and ethical logger (Excel)",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020810]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        {/* Background glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-[#00ff88]/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-[#00d4ff]/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-medium uppercase tracking-widest">
            Prospect Portal
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Nexum Suum{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff]">
              Intelligence Portal
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-4">
            Boiler · Chiller · Facility Systems Intelligence
          </p>
          <p className="text-sm text-gray-500 mb-12 max-w-xl mx-auto">
            Real-time data logging. Looker Studio analytics. SOPs when you need them.
          </p>

          {/* CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {packages.map((pkg) => (
              <Link
                key={pkg.href}
                href={pkg.href}
                className={`block p-6 rounded-2xl bg-[#0a1628] border ${pkg.border} ${pkg.glow} transition-all duration-300 group cursor-pointer`}
              >
                <div className="text-3xl mb-3">{pkg.icon}</div>
                <div className={`text-lg font-bold ${pkg.textColor} mb-2`}>
                  {pkg.title}
                </div>
                <div className="text-gray-500 text-sm">Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What Each Package Does */}
      <section className="px-4 py-20 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          What Each Package Does
        </h2>
        <p className="text-gray-500 text-center mb-12 text-sm">
          Purpose-built tools for facilities that run boilers, chillers, and complex mechanical systems.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.href}
              className={`p-6 rounded-2xl bg-[#0a1628] border ${pkg.border} ${pkg.glow} transition-all duration-300`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{pkg.icon}</span>
                <h3 className={`text-lg font-bold ${pkg.textColor}`}>{pkg.title}</h3>
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className={`${pkg.textColor} mt-0.5 text-xs`}>▸</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.href}
                className={`text-sm font-medium ${pkg.textColor} hover:underline`}
              >
                View Package →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Upgrade CTA Banner */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center p-10 rounded-2xl bg-[#0a1628] border border-[#00ff88]/30 shadow-[0_0_40px_rgba(0,255,136,0.15)]">
          <div className="text-3xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready for the full platform?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Upgrade to FI Basic for live dashboards, team collaboration, work orders, vendor management, compliance tracking, and more.
          </p>
          <a
            href="https://nexumsuum-facilityintelligence.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] font-semibold hover:bg-[#00ff88]/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
          >
            Upgrade to FI Basic →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a3a5c] py-6 text-center text-sm text-gray-600">
        Nexum Suum © 2025 — Facility Efficiency &amp; Digital Compliance
      </footer>
    </div>
  );
}
