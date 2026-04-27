"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame, Snowflake, Building2, Shield, FileCheck,
  Library, BarChart3, FileText, ClipboardCheck, LayoutDashboard,
} from "lucide-react";

const ACCENT     = "#00FFE1";
const ACCENT_RGB = "0, 255, 225";

type HomeTab = "overview" | "packages" | "how-it-works";

const HOME_TABS: { id: HomeTab; label: string }[] = [
  { id: "overview",       label: "Overview"     },
  { id: "packages",       label: "Packages"     },
  { id: "how-it-works",  label: "How It Works" },
];

const PACKAGES = [
  {
    title:    "Boiler Intelligence",
    href:     "/boiler",
    icon:     Flame,
    accent:   "#00FFE1",
    rgb:      "0, 255, 225",
    category: "Combustion & Stack",
    docs:     "47 documents",
    sub:      "Combustion · Stack · Pressure · Safety",
  },
  {
    title:    "Chiller Intelligence",
    href:     "/chiller",
    icon:     Snowflake,
    accent:   "#38bdf8",
    rgb:      "56, 189, 248",
    category: "Cooling Systems",
    docs:     "13 documents",
    sub:      "Chilled water · Condenser · Refrigerant",
  },
  {
    title:    "Facility Intelligence",
    href:     "/facility",
    icon:     Building2,
    accent:   "#fbbf24",
    rgb:      "251, 191, 36",
    category: "Multi-System SOPs",
    docs:     "90+ documents",
    sub:      "9-system SOPs · Compliance · Calculators",
  },
  {
    title:    "Virtuous Ethics Logger",
    href:     "/virtuous",
    icon:     Shield,
    accent:   "#c084fc",
    rgb:      "192, 132, 252",
    category: "Ethics & Safety",
    docs:     "4 resources",
    sub:      "10 log types · Anonymous reporting",
  },
  {
    title:    "Compliance Center",
    href:     "/compliance",
    icon:     FileCheck,
    accent:   "#fb923c",
    rgb:      "251, 146, 60",
    category: "OSHA · EPA · Fire",
    docs:     "6 SOPs + 2 guides",
    sub:      "24-item checklist · Permit tracking",
  },
];

const STEPS = [
  { num: "01", title: "Log Your Readings",         desc: "Submit boiler, chiller, or facility data from any device in seconds." },
  { num: "02", title: "Data Feeds Looker Studio",  desc: "Entries sync to Google Sheets and power live dashboards automatically." },
  { num: "03", title: "Download SOPs & Checklists", desc: "Access your full library of SOPs, procedures, and compliance docs." },
];

export default function HomePage() {
  const [tab, setTab] = useState<HomeTab>("overview");

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ── */}
      <section className="pt-6 pb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border text-xs font-semibold uppercase tracking-widest"
          style={{ background: `rgba(${ACCENT_RGB}, 0.06)`, borderColor: `rgba(${ACCENT_RGB}, 0.25)`, color: ACCENT }}
        >
          Prospect Access
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(200_18%_84%)] mb-2 tracking-tight">
          Nexum Suum Intelligence Portal
        </h1>
        <p className="text-[hsl(200_15%_55%)] text-base">
          Real-time diagnostics · Looker Studio analytics · SOPs when you need them
        </p>
      </section>

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Packages",        value: "5",    icon: LayoutDashboard, accent: ACCENT,     rgb: ACCENT_RGB },
          { label: "Total Documents", value: "170+", icon: FileText,        accent: "#38bdf8",  rgb: "56, 189, 248" },
          { label: "Live Dashboards", value: "3",    icon: BarChart3,       accent: "#fbbf24",  rgb: "251, 191, 36" },
          { label: "Compliance Docs", value: "8",    icon: ClipboardCheck,  accent: "#fb923c",  rgb: "251, 146, 60" },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.label} className="stat-tile">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${tile.rgb}, 0.1)`, border: `1px solid rgba(${tile.rgb}, 0.25)` }}
                >
                  <Icon size={16} style={{ color: tile.accent }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(200_15%_45%)] mb-0.5">{tile.label}</p>
                  <p className="text-2xl font-bold leading-none" style={{ color: tile.accent }}>{tile.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab bar ── */}
      <div className="border-b border-[rgba(255,255,255,0.07)] mb-8 flex gap-0">
        {HOME_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab-btn${tab === t.id ? " active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Package list rows */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: "#0e1e2c", borderColor: "rgba(255,255,255,0.07)" }}>
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(200_15%_45%)] mb-0.5">Intelligence Packages</p>
                <h2 className="text-sm font-bold text-[hsl(200_18%_84%)]">Your Active Portal</h2>
              </div>
              <Link href="/library" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: ACCENT }}>
                <Library size={13} /> Full Library
              </Link>
            </div>

            {PACKAGES.map((pkg, i) => {
              const Icon = pkg.icon;
              return (
                <div
                  key={pkg.href}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{ borderBottom: i < PACKAGES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `rgba(${pkg.rgb}, 0.1)`, border: `1px solid rgba(${pkg.rgb}, 0.2)` }}
                  >
                    <Icon size={15} style={{ color: pkg.accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[hsl(200_18%_84%)] truncate">{pkg.title}</p>
                    <p className="text-xs text-[hsl(200_15%_50%)] truncate">{pkg.sub}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-[hsl(200_15%_45%)] hidden sm:block">{pkg.docs}</span>
                  <span className="badge-active shrink-0">Active</span>
                  <Link
                    href={pkg.href}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: `rgba(${pkg.rgb}, 0.08)`,
                      border: `1px solid rgba(${pkg.rgb}, 0.25)`,
                      color: pkg.accent,
                    }}
                  >
                    Open →
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Upgrade banner */}
          <div
            className="p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: "#0e1e2c",
              border: `1px solid rgba(${ACCENT_RGB}, 0.15)`,
              borderLeft: `3px solid ${ACCENT}`,
            }}
          >
            <div>
              <h3 className="text-sm font-bold text-[hsl(200_18%_84%)] mb-1">Ready for the full platform?</h3>
              <p className="text-xs text-[hsl(200_15%_50%)] max-w-lg">
                Nexum Suum Facility Intelligence — team dashboards, work orders, vendor management, live compliance tracking, and more.
              </p>
            </div>
            <a
              href="https://nexumsuum-facilityintelligence.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: ACCENT, color: "#001923" }}
            >
              Upgrade to FI Platform →
            </a>
          </div>
        </div>
      )}

      {/* ── Packages tab ── */}
      {tab === "packages" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.href}
                className="card flex flex-col transition-all"
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${pkg.rgb}, 0.35)`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `rgba(${pkg.rgb}, 0.1)`, border: `1px solid rgba(${pkg.rgb}, 0.25)` }}
                  >
                    <Icon size={18} style={{ color: pkg.accent }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(200_15%_45%)]">{pkg.category}</p>
                    <h3 className="text-sm font-bold" style={{ color: pkg.accent }}>{pkg.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-[hsl(200_15%_50%)] mb-4 flex-1 leading-relaxed">{pkg.sub}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[hsl(200_15%_45%)]">{pkg.docs}</span>
                  <Link
                    href={pkg.href}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: `rgba(${pkg.rgb}, 0.1)`,
                      border: `1px solid rgba(${pkg.rgb}, 0.3)`,
                      color: pkg.accent,
                    }}
                  >
                    Open →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── How it works tab ── */}
      {tab === "how-it-works" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step) => (
            <div key={step.num} className="card text-center">
              <div
                className="text-4xl font-bold font-mono mb-3"
                style={{ color: `rgba(${ACCENT_RGB}, 0.25)` }}
              >
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-[hsl(200_18%_84%)] mb-2">{step.title}</h3>
              <p className="text-xs text-[hsl(200_15%_50%)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-16 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center text-xs text-[hsl(200_15%_40%)]">
        Nexum Suum &copy; 2025 — Facility Efficiency &amp; Digital Compliance
      </footer>
    </div>
  );
}
