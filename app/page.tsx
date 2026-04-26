"use client";

import Link from "next/link";
import { Flame, Snowflake, Building2 } from "lucide-react";

const packages = [
  {
    title: "Boiler Intelligence",
    href: "/boiler",
    Icon: Flame,
    accent: "#00FFE1",
    accentRgb: "0, 255, 225",
    bullets: [
      "Combustion & stack analysis",
      "Boiler log sheets & checklists",
      "6 safety protocol modules",
      "Looker Studio live dashboard",
    ],
  },
  {
    title: "Chiller Intelligence",
    href: "/chiller",
    Icon: Snowflake,
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
    bullets: [
      "Chilled water & condensate logs",
      "Cooling tower performance tracking",
      "Refrigerant temp monitoring",
      "Looker Studio live dashboard",
    ],
  },
  {
    title: "Facility Intelligence",
    href: "/facility",
    Icon: Building2,
    accent: "#fbbf24",
    accentRgb: "251, 191, 36",
    bullets: [
      "9-system SOPs (boiler to electrical)",
      "Compliance handbook & templates",
      "Virtuous ethical logger",
      "Looker Studio live dashboard",
    ],
  },
];

const steps = [
  { num: "01", title: "Log Your Readings", desc: "Submit boiler, chiller, or facility data from any device." },
  { num: "02", title: "Data Feeds Looker Studio", desc: "Your entries sync to Google Sheets and power live dashboards." },
  { num: "03", title: "Download SOPs & Checklists", desc: "Access your full library of procedures and compliance docs." },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <section className="pt-8 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#00FFE1]/30 text-[#00FFE1] text-xs font-semibold uppercase tracking-widest bg-[#00FFE1]/5">
          PROSPECT ACCESS
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#00FFE1] mb-4 tracking-tight">
          Nexum Suum Intelligence Portal
        </h1>
        <p className="text-[hsl(200_18%_84%)] text-lg mb-2">
          Real-time diagnostics · Looker Studio analytics · SOPs when you need them
        </p>
        <p className="text-[hsl(200_15%_55%)] text-sm">
          Boiler · Chiller · Facility Systems Intelligence
        </p>
      </section>

      {/* Package cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {packages.map((pkg) => {
          const Icon = pkg.Icon;
          return (
            <div
              key={pkg.href}
              className="flex flex-col p-6 rounded-xl border transition-all duration-300"
              style={{
                background: "hsl(200 50% 10%)",
                borderColor: `rgba(${pkg.accentRgb}, 0.25)`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${pkg.accentRgb}, 0.5)`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px rgba(${pkg.accentRgb}, 0.12)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${pkg.accentRgb}, 0.25)`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `rgba(${pkg.accentRgb}, 0.1)`, border: `1px solid rgba(${pkg.accentRgb}, 0.3)` }}
              >
                <Icon size={20} style={{ color: pkg.accent }} />
              </div>
              <h3 className="text-lg font-bold mb-3" style={{ color: pkg.accent }}>
                {pkg.title}
              </h3>
              <ul className="space-y-2 flex-1 mb-6">
                {pkg.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-[hsl(200_18%_84%)]">
                    <span className="mt-1 text-xs" style={{ color: pkg.accent }}>▸</span>
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.href}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: `rgba(${pkg.accentRgb}, 0.1)`,
                  border: `1px solid rgba(${pkg.accentRgb}, 0.35)`,
                  color: pkg.accent,
                }}
              >
                Open →
              </Link>
            </div>
          );
        })}
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-[hsl(200_18%_84%)] text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 rounded-xl border border-[hsl(200_30%_20%)] text-center"
              style={{ background: "hsl(200 50% 10%)" }}
            >
              <div className="text-3xl font-bold text-[#00FFE1]/30 font-mono mb-3">{step.num}</div>
              <h3 className="font-semibold text-[hsl(200_18%_84%)] mb-2">{step.title}</h3>
              <p className="text-sm text-[hsl(200_15%_55%)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upgrade banner */}
      <section className="mb-12">
        <div
          className="p-8 rounded-xl border-l-4 border-[#00FFE1] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ background: "hsl(200 50% 10%)", border: "1px solid hsl(200 30% 20%)", borderLeft: "4px solid #00FFE1" }}
        >
          <div>
            <h2 className="text-xl font-bold text-[hsl(200_18%_84%)] mb-2">Ready for the full platform?</h2>
            <p className="text-sm text-[hsl(200_15%_55%)] max-w-xl">
              Nexum Suum Facility Intelligence includes live team dashboards, work orders, vendor management,
              compliance tracking, and more.
            </p>
          </div>
          <a
            href="https://nexumsuum-facilityintelligence.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-lg bg-[#00FFE1] text-[#001923] font-bold text-sm hover:bg-[#00FFE1]/90 transition-all teal-glow"
          >
            Upgrade to FI Platform →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(200_30%_20%)] py-6 text-center text-xs text-[hsl(200_15%_45%)]">
        Nexum Suum &copy; 2025 — Facility Efficiency &amp; Digital Compliance
      </footer>
    </div>
  );
}
