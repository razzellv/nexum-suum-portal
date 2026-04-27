"use client";
// ── Shared UI primitives — matches FI Platform design language ─────────────────
// Card, StatCard, Badge, SectionHeader, TabBar, DocCard, PageHeader

import { type ReactNode } from "react";

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: string; // CSS color string for left border
}) {
  return (
    <div
      className={`rounded-xl border bg-[hsl(200_50%_9%)] ${className}`}
      style={{
        borderColor: "hsl(200 30% 18%)",
        borderLeftColor: accent || undefined,
        borderLeftWidth: accent ? "3px" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pt-5 pb-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  accentRgb,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number | string; className?: string; style?: React.CSSProperties }>;
  accent: string;
  accentRgb: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex items-start gap-4 transition-all duration-200 hover:border-opacity-60"
      style={{
        background: "hsl(200 50% 9%)",
        borderColor: `rgba(${accentRgb}, 0.2)`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `rgba(${accentRgb}, 0.1)`, border: `1px solid rgba(${accentRgb}, 0.25)` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(200_15%_45%)] mb-1">{label}</p>
        <p className="text-2xl font-bold leading-none" style={{ color: accent }}>{value}</p>
        {sub && <p className="text-xs text-[hsl(200_15%_50%)] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "muted" | "accent";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: "bg-green-900/30 border-green-700/50 text-green-400",
  warning: "bg-amber-900/30 border-amber-700/50 text-amber-400",
  danger:  "bg-red-900/30 border-red-700/50 text-red-400",
  info:    "bg-sky-900/30 border-sky-700/50 text-sky-400",
  muted:   "bg-[hsl(200_30%_14%)] border-[hsl(200_30%_22%)] text-[hsl(200_15%_55%)]",
  accent:  "bg-[rgba(0,255,225,0.08)] border-[rgba(0,255,225,0.3)] text-[#00FFE1]",
};

export function Badge({
  children,
  variant = "muted",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${BADGE_STYLES[variant]}`}>
      {children}
    </span>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  sub,
  accent = "#00FFE1",
}: {
  title: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-0.5 self-stretch rounded-full mt-0.5" style={{ background: accent }} />
      <div>
        <h2 className="text-sm font-bold text-[hsl(200_18%_84%)] uppercase tracking-wider">{title}</h2>
        {sub && <p className="text-xs text-[hsl(200_15%_50%)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── TabBar ────────────────────────────────────────────────────────────────────
export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  accent = "#00FFE1",
  accentRgb = "0, 255, 225",
}: {
  tabs: { id: T; label: string; icon?: React.ComponentType<{ size?: number }> }[];
  active: T;
  onChange: (id: T) => void;
  accent?: string;
  accentRgb?: string;
}) {
  return (
    <div
      className="flex gap-1 p-1 rounded-xl border mb-8 flex-wrap"
      style={{ background: "hsl(200 50% 7%)", borderColor: "hsl(200 30% 16%)" }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              isActive
                ? {
                    background: `rgba(${accentRgb}, 0.12)`,
                    border: `1px solid rgba(${accentRgb}, 0.3)`,
                    color: accent,
                  }
                : { color: "hsl(200 15% 50%)", border: "1px solid transparent" }
            }
          >
            {Icon && <Icon size={14} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({
  icon: Icon,
  title,
  sub,
  accent,
  accentRgb,
  badge,
  badgeVariant = "success",
  action,
}: {
  icon: React.ComponentType<{ size?: number | string; style?: React.CSSProperties }>;
  title: string;
  sub: string;
  accent: string;
  accentRgb: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 mb-8 p-5 rounded-xl border"
      style={{
        background: "hsl(200 50% 9%)",
        borderColor: `rgba(${accentRgb}, 0.2)`,
        borderLeftColor: accent,
        borderLeftWidth: "3px",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `rgba(${accentRgb}, 0.1)`, border: `1px solid rgba(${accentRgb}, 0.25)` }}
        >
          <Icon size={22} style={{ color: accent }} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-xl font-bold text-[hsl(200_18%_84%)]">{title}</h1>
            {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
          </div>
          <p className="text-sm text-[hsl(200_15%_50%)]">{sub}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── DocCard ───────────────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
  pdf:  "bg-red-900/30 border-red-700/40 text-red-400",
  docx: "bg-blue-900/30 border-blue-700/40 text-blue-400",
  xlsx: "bg-green-900/30 border-green-700/40 text-green-400",
};

export function DocCard({
  label,
  file,
  type,
  accent,
  accentRgb,
}: {
  label: string;
  file: string;
  type: string;
  accent: string;
  accentRgb: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-150 group"
      style={{
        background: "hsl(200 50% 8%)",
        borderColor: "hsl(200 30% 16%)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${accentRgb}, 0.35)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(200 30% 16%)"; }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[hsl(200_18%_84%)] truncate mb-1.5">{label}</p>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${TYPE_BADGE[type] ?? TYPE_BADGE.pdf}`}>
          {type}
        </span>
      </div>
      <a
        href={`/library/${file}`}
        download
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: `rgba(${accentRgb}, 0.08)`,
          border: `1px solid rgba(${accentRgb}, 0.25)`,
          color: accent,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${accentRgb}, 0.15)`; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${accentRgb}, 0.08)`; }}
      >
        ↓ Download
      </a>
    </div>
  );
}

// ── Input / Textarea / Select ─────────────────────────────────────────────────
export const inputCls = (accent = "#00FFE1") =>
  `w-full bg-[hsl(200_30%_11%)] border border-[hsl(200_30%_20%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2.5 text-sm placeholder-[hsl(200_15%_38%)] transition-all outline-none focus:border-[${accent}] focus:ring-1 focus:ring-[${accent}]/30`;

// ── UpgradeBanner ─────────────────────────────────────────────────────────────
export function UpgradeBanner({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  return (
    <div
      className="p-5 rounded-xl border mt-6"
      style={{
        background: `rgba(${accentRgb}, 0.04)`,
        borderColor: `rgba(${accentRgb}, 0.18)`,
      }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: accent }}>Ready for the full platform?</p>
      <p className="text-xs text-[hsl(200_15%_50%)] mb-3">
        Upgrade to Nexum Suum Facility Intelligence for team dashboards, persistent logs, API sync, and full diagnostic history.
      </p>
      <a
        href="/pricing"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
        style={{
          background: accent,
          color: "#001923",
        }}
      >
        Upgrade to FI Platform →
      </a>
    </div>
  );
}
