"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Snowflake, Building2, ShieldCheck, BookOpen, LogIn, TrendingUp, FileText, BarChart3, CheckSquare } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import AuthModal from "../components/AuthModal";

const STAT_TILES = [
  { label: "Packages",       value: "3",             icon: BarChart3,   accent: "#00FFE1" },
  { label: "Assets Tracked", value: "Live",           icon: FileText,    accent: "#38bdf8" },
  { label: "Compliance",     value: "VirtuousBoard™", icon: CheckSquare, accent: "#fbbf24" },
  { label: "Analytics",      value: "On",             icon: TrendingUp,  accent: "#34d399" },
];

const PACKAGES = [
  { title: "Boiler Intelligence",   href: "/boiler",   icon: Flame,       accent: "#00FFE1", accentRgb: "0,255,225",   desc: "Combustion · Stack · Pressure · Safety",          docs: "47 documents",    tier: "boiler"   },
  { title: "Chiller Intelligence",  href: "/chiller",  icon: Snowflake,   accent: "#38bdf8", accentRgb: "56,189,248",  desc: "Chilled water · Condenser · Refrigerant",        docs: "13 documents",    tier: "chiller"  },
  { title: "Facility Intelligence", href: "/facility", icon: Building2,   accent: "#fbbf24", accentRgb: "251,191,36",  desc: "9-system SOPs · Compliance · Calculators",       docs: "90+ documents",   tier: "facility" },
];

const STEPS = [
  { num: "01", title: "Register & Select Tier", desc: "Sign up with your facility info and choose Boiler, Chiller, or Facility tier." },
  { num: "02", title: "Log Your Readings",       desc: "Submit equipment data — readings are stored locally and synced to the AWS-powered backend." },
  { num: "03", title: "Analyze & Download",      desc: "View built-in charts, run efficiency calculators, download SOPs and checklists." },
];

type MainTab = "Overview" | "Packages" | "How It Works";

export default function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [tab, setTab] = useState<MainTab>("Overview");

  const canAccess = (tier: string) => user && (user.tier === tier || user.tier === "facility");

  return (
    <div className="min-h-full" style={{ background: "#030d14" }}>
      {/* ── Page header ── */}
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "rgba(0,255,225,0.06)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Nexum Suum Intelligence Portal</h1>
            <p className="text-gray-500 text-sm">Real-time diagnostics · Built-in analytics · SOPs when you need them</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{user.name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{user.company} · {user.tier} tier</p>
                </div>
                <button onClick={logout}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-800 text-gray-500 hover:border-red-500/40 hover:text-red-400 transition-all">
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.2)", color: "#00FFE1" }}>
                <LogIn size={14} />
                Login / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `rgba(${t.accent === "#00FFE1" ? "0,255,225" : t.accent === "#38bdf8" ? "56,189,248" : t.accent === "#fbbf24" ? "251,191,36" : "52,211,153"},0.1)` }}>
                  <Icon size={16} style={{ color: t.accent }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-none">{t.value}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{t.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="px-8 border-b" style={{ borderColor: "rgba(0,255,225,0.06)" }}>
        <div className="flex gap-6">
          {(["Overview", "Packages", "How It Works"] as MainTab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={tab === t
                ? { color: "#00FFE1", borderColor: "#00FFE1" }
                : { color: "rgba(148,163,184,0.5)", borderColor: "transparent" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">

        {/* ── OVERVIEW TAB ── */}
        {tab === "Overview" && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-1">Intelligence Packages</p>
                <p className="text-white font-semibold">Your Active Portal</p>
              </div>
              <button onClick={() => router.push("/library")} className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: "#00FFE1" }}>
                <BookOpen size={13} /> Full Library
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              {PACKAGES.map((pkg, i) => {
                const Icon = pkg.icon;
                const access = canAccess(pkg.tier);
                return (
                  <div key={pkg.href}
                    className="flex items-center gap-4 px-5 py-4 transition-all group cursor-pointer"
                    style={{
                      borderBottom: i < PACKAGES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                    onClick={() => access ? router.push(pkg.href) : setShowAuth(true)}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,255,225,0.025)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `rgba(${pkg.accentRgb},0.1)`, border: `1px solid rgba(${pkg.accentRgb},0.2)` }}>
                      <Icon size={16} style={{ color: pkg.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white">{pkg.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{pkg.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-600">{pkg.docs}</span>
                      {access ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `rgba(${pkg.accentRgb},0.1)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.25)` }}>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-600 border border-gray-800">
                          {user ? "UPGRADE" : "SIGN UP"}
                        </span>
                      )}
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: access ? `rgba(${pkg.accentRgb},0.08)` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${access ? `rgba(${pkg.accentRgb},0.25)` : "rgba(255,255,255,0.06)"}`,
                          color: access ? pkg.accent : "rgba(148,163,184,0.4)",
                        }}>
                        Open →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {!user && (
              <div className="mt-6 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                style={{ background: "rgba(0,255,225,0.03)", border: "1px solid rgba(0,255,225,0.1)", borderLeft: "3px solid #00FFE1" }}>
                <div>
                  <p className="font-bold text-white mb-1">Get started — it&apos;s free</p>
                  <p className="text-sm text-gray-500">Register to access your tier&apos;s full module library, log data, and analytics.</p>
                </div>
                <button onClick={() => setShowAuth(true)}
                  className="shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "#00FFE1", color: "#001923" }}>
                  Sign Up →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PACKAGES TAB ── */}
        {tab === "Packages" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
            {PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              const access = canAccess(pkg.tier);
              return (
                <div key={pkg.href} className="rounded-2xl p-6 flex flex-col transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(${pkg.accentRgb},0.12)` }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${pkg.accentRgb},0.3)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${pkg.accentRgb},0.12)`; }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `rgba(${pkg.accentRgb},0.1)`, border: `1px solid rgba(${pkg.accentRgb},0.2)` }}>
                      <Icon size={18} style={{ color: pkg.accent }} />
                    </div>
                    {access && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `rgba(${pkg.accentRgb},0.1)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.25)` }}>ACTIVE</span>}
                  </div>
                  <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: `rgba(${pkg.accentRgb},0.6)` }}>
                    {pkg.tier === "boiler" ? "Combustion & Stack" : pkg.tier === "chiller" ? "Cooling Systems" : "Multi-System SOPs"}
                  </p>
                  <h3 className="font-bold text-white mb-2" style={{ color: pkg.accent }}>{pkg.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">{pkg.desc}</p>
                  <p className="text-xs text-gray-700 mb-5 flex-1">{pkg.docs}</p>
                  <button onClick={() => access ? router.push(pkg.href) : setShowAuth(true)}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: access ? `rgba(${pkg.accentRgb},0.1)` : "rgba(255,255,255,0.03)",
                      border: `1px solid rgba(${pkg.accentRgb},${access ? "0.3" : "0.1"})`,
                      color: access ? pkg.accent : "rgba(148,163,184,0.4)",
                    }}>
                    {access ? "Open →" : user ? "Upgrade Tier →" : "Sign Up to Access →"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HOW IT WORKS TAB ── */}
        {tab === "How It Works" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {STEPS.map((step) => (
              <div key={step.num} className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-4xl font-bold font-mono mb-4" style={{ color: "rgba(0,255,225,0.2)" }}>{step.num}</p>
                <h3 className="font-bold text-white mb-2 text-sm">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
