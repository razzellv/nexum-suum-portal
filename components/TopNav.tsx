"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Snowflake, Building2, Shield, FileCheck, LayoutDashboard, Zap, Library } from "lucide-react";

const NAV = [
  { name: "Overview",   href: "/",           icon: LayoutDashboard },
  { name: "Boiler",     href: "/boiler",     icon: Flame           },
  { name: "Chiller",    href: "/chiller",    icon: Snowflake       },
  { name: "Facility",   href: "/facility",   icon: Building2       },
  { name: "Virtuous",   href: "/virtuous",   icon: Shield          },
  { name: "Compliance", href: "/compliance", icon: FileCheck       },
  { name: "Library",    href: "/library",    icon: Library         },
];

export default function TopNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "hsl(200 50% 7% / 0.95)",
        borderColor: "hsl(200 30% 18%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center teal-glow-sm"
              style={{ background: "rgba(0,255,225,0.1)", border: "1px solid rgba(0,255,225,0.3)" }}
            >
              <span className="text-[#00FFE1] font-bold text-xs font-mono">NS</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[#00FFE1] font-bold text-sm leading-none">Nexum Suum</p>
              <p className="text-[hsl(200_15%_50%)] text-[10px] leading-none mt-0.5">Intelligence Portal</p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5 overflow-x-auto hide-scrollbar">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
                  style={
                    active
                      ? {
                          background: "rgba(0,255,225,0.1)",
                          border: "1px solid rgba(0,255,225,0.25)",
                          color: "#00FFE1",
                        }
                      : {
                          color: "hsl(200 15% 55%)",
                          border: "1px solid transparent",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "hsl(200 18% 84%)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLAnchorElement).style.color = "hsl(200 15% 55%)";
                  }}
                >
                  <Icon size={14} className="shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          <a
            href="https://nexumsuum-facilityintelligence.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all teal-glow-sm"
            style={{
              background: "rgba(0,255,225,0.1)",
              border: "1px solid rgba(0,255,225,0.3)",
              color: "#00FFE1",
            }}
          >
            <Zap size={12} />
            Upgrade
          </a>

        </div>
      </div>
    </nav>
  );
}
