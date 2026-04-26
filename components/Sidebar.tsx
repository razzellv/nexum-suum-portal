"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Snowflake,
  Building2,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  FileCheck,
} from "lucide-react";

const navItems = [
  { name: "Overview",             href: "/",           icon: LayoutDashboard, color: "text-purple-400"   },
  { name: "Boiler Intelligence",  href: "/boiler",     icon: Flame,           color: "text-[#00FFE1]"    },
  { name: "Chiller Intelligence", href: "/chiller",    icon: Snowflake,       color: "text-sky-400"      },
  { name: "Facility Intelligence",href: "/facility",   icon: Building2,       color: "text-amber-400"    },
  { name: "Virtuous Ethics Log",  href: "/virtuous",   icon: Shield,          color: "text-purple-400"   },
  { name: "Compliance Center",    href: "/compliance", icon: FileCheck,       color: "text-amber-400"    },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 bg-[hsl(200_50%_8%)] border-r border-[hsl(200_30%_18%)] ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-3 py-5 border-b border-[hsl(200_30%_18%)] ${collapsed ? "justify-center" : ""}`}>
        <div className="shrink-0 w-9 h-9 rounded-lg bg-[#00FFE1]/10 border border-[#00FFE1]/30 flex items-center justify-center teal-glow-sm">
          <span className="text-[#00FFE1] font-bold text-sm font-mono">NS</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[#00FFE1] font-bold text-sm leading-tight truncate">Nexum Suum</p>
            <p className="text-[hsl(200_15%_55%)] text-[10px] leading-tight truncate">Intelligence Portal</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[hsl(200_15%_45%)] text-[10px] uppercase tracking-widest px-2 pb-2 font-semibold">Systems</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 group ${
                active
                  ? "bg-[hsl(173_100%_50%_/_0.1)] border border-[hsl(173_100%_50%_/_0.2)] text-[#00FFE1]"
                  : "hover:bg-[hsl(200_30%_12%)] text-[hsl(200_15%_55%)] hover:text-[hsl(200_18%_84%)]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${active ? "text-[#00FFE1]" : item.color} transition-colors`}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-2 pb-4 border-t border-[hsl(200_30%_18%)] pt-4">
        <a
          href="https://nexumsuum-facilityintelligence.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "Upgrade to FI Platform" : undefined}
          className={`flex items-center gap-2 rounded-lg bg-[#00FFE1]/10 border border-[#00FFE1]/30 text-[#00FFE1] font-semibold text-xs hover:bg-[#00FFE1]/20 teal-glow-sm transition-all ${
            collapsed ? "justify-center p-2.5" : "px-3 py-2.5"
          }`}
        >
          <Zap size={14} className="shrink-0" />
          {!collapsed && <span>Upgrade to FI Platform →</span>}
        </a>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[hsl(200_50%_12%)] border border-[hsl(200_30%_22%)] flex items-center justify-center text-[hsl(200_15%_55%)] hover:text-[#00FFE1] hover:border-[#00FFE1]/40 transition-all z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
