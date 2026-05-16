"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid, Flame, Snowflake, Building2,
  ChevronLeft, ChevronRight, BookOpen, ClipboardList, Zap, LogOut,
  Database, Droplets, Users, Package,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const NAV = [
  { label: "Overview",              icon: LayoutGrid,    href: "/"           },
  { label: "Boiler Intelligence",   icon: Flame,         href: "/boiler"     },
  { label: "Chiller Intelligence",  icon: Snowflake,     href: "/chiller"    },
  { label: "Facility Intelligence", icon: Building2,     href: "/facility"   },
  { label: "Assets",                icon: Database,      href: "/assets"     },
  { label: "Blowdowns",             icon: Droplets,      href: "/blowdowns"  },
  { label: "Employees",             icon: Users,         href: "/employees"  },
  { label: "Inventory",             icon: Package,       href: "/inventory"  },
  { label: "Document Library",      icon: BookOpen,      href: "/library"    },
  { label: "Compliance",            icon: ClipboardList, href: "/compliance" },
];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#030d14" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 border-r ${collapsed ? "w-[60px]" : "w-56"}`}
        style={{ background: "rgba(2, 10, 18, 0.98)", borderColor: "rgba(0,255,225,0.07)" }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-3.5 pt-6 pb-5 ${collapsed ? "justify-center" : ""}`}>
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.18)", color: "#00FFE1" }}>
            NS
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <p className="text-white font-bold text-sm truncate">Nexum Suum</p>
              <p className="text-[10px] tracking-wide" style={{ color: "rgba(0,255,225,0.45)" }}>Intelligence Portal</p>
            </div>
          )}
        </div>

        <div className="mx-3 h-px mb-3" style={{ background: "rgba(0,255,225,0.06)" }} />

        {!collapsed && (
          <p className="px-3.5 text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: "rgba(0,255,225,0.3)" }}>
            Systems
          </p>
        )}

        <nav className="flex-1 flex flex-col gap-0.5 px-2">
          {NAV.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <button key={href} onClick={() => router.push(href)} title={collapsed ? label : undefined}
                className={`flex items-center gap-2.5 w-full rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
                style={active ? {
                  background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.16)", color: "#00FFE1",
                } : { border: "1px solid transparent", color: "rgba(148,163,184,0.5)" }}
                onMouseEnter={(e) => { if (!active) { const b = e.currentTarget; b.style.color = "#00FFE1"; b.style.background = "rgba(0,255,225,0.04)"; } }}
                onMouseLeave={(e) => { if (!active) { const b = e.currentTarget; b.style.color = "rgba(148,163,184,0.5)"; b.style.background = "transparent"; } }}
              >
                <Icon size={15} className="shrink-0" style={{ color: active ? "#00FFE1" : undefined }} />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Upgrade */}
        <div className="px-2 pb-2">
          <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
            title={collapsed ? "Upgrade to FI Platform" : undefined}
            className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-2.5 text-[13px] font-semibold transition-all ${collapsed ? "justify-center" : ""}`}
            style={{ background: "rgba(0,255,225,0.06)", border: "1px solid rgba(0,255,225,0.13)", color: "#00FFE1" }}>
            <Zap size={14} className="shrink-0" />
            {!collapsed && <span>Upgrade to FI →</span>}
          </a>
        </div>

        {/* User badge */}
        {user && (
          <div className={`px-2 pb-2 ${collapsed ? "flex justify-center" : ""}`}>
            <div className={`flex items-center gap-2 w-full rounded-xl px-2.5 py-2 ${collapsed ? "justify-center" : ""}`}
              style={{ background: "rgba(0,255,225,0.03)", border: "1px solid rgba(0,255,225,0.07)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "rgba(0,255,225,0.1)", color: "#00FFE1" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] capitalize" style={{ color: "rgba(0,255,225,0.4)" }}>{user.tier} tier</p>
                  </div>
                  <button onClick={logout} className="shrink-0 text-gray-700 hover:text-red-400 transition-colors">
                    <LogOut size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div className={`px-2 pb-5 ${collapsed ? "flex justify-center" : "flex justify-end"}`}>
          <button onClick={() => setCollapsed((v) => !v)}
            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(0,255,225,0.05)", border: "1px solid rgba(0,255,225,0.1)", color: "rgba(0,255,225,0.4)" }}>
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
