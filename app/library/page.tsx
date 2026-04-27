"use client";

import { useState } from "react";
import { Library, Download, FileText, BarChart3, ExternalLink } from "lucide-react";
import {
  BOILER_INTELLIGENCE,
  CHILLER_INTELLIGENCE,
  FACILITY_INTELLIGENCE,
  FACILITY_COMPLIANCE_GUIDE,
  THERMODYNAMICS_MAINTENANCE,
} from "@/app/lib/products";
import { PageHeader, StatCard, SectionHeader, Badge } from "@/components/ui";

const ACCENT     = "#00FFE1";
const ACCENT_RGB = "0, 255, 225";

type Filter = "all" | "boiler" | "chiller" | "facility" | "document";

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: "all",      label: "All"       },
  { id: "boiler",   label: "Boiler"    },
  { id: "chiller",  label: "Chiller"   },
  { id: "facility", label: "Facility"  },
  { id: "document", label: "Documents" },
];

interface LibSection {
  id: Filter;
  title: string;
  category: Filter;
  accent: string;
  accentRgb: string;
  badge?: string;
  docs: { label: string; file: string; type: "pdf" | "docx" | "xlsx" }[];
  lookerUrl?: string;
  docCount: number;
}

const SECTIONS: LibSection[] = [
  {
    id: "boiler",
    title: "Boiler Intelligence",
    category: "boiler",
    accent: "#00FFE1",
    accentRgb: "0, 255, 225",
    badge: "47 docs",
    docs: BOILER_INTELLIGENCE.documents,
    lookerUrl: "https://datastudio.google.com/embed/reporting/4456f0c6-262f-4b8b-aba0-7eacd0be494e/page/H3TaF",
    docCount: BOILER_INTELLIGENCE.documents.length,
  },
  {
    id: "chiller",
    title: "Chiller Intelligence",
    category: "chiller",
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
    badge: "13 docs",
    docs: CHILLER_INTELLIGENCE.documents,
    lookerUrl: "https://datastudio.google.com/embed/reporting/29067deb-fc12-4d99-a2a3-47291d3b2019/page/4Z2aF",
    docCount: CHILLER_INTELLIGENCE.documents.length,
  },
  {
    id: "facility",
    title: "Facility Intelligence",
    category: "facility",
    accent: "#fbbf24",
    accentRgb: "251, 191, 36",
    badge: "90+ docs",
    docs: FACILITY_INTELLIGENCE.documents,
    lookerUrl: "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF",
    docCount: FACILITY_INTELLIGENCE.documents.length,
  },
  {
    id: "document",
    title: "Compliance & Reference Documents",
    category: "document",
    accent: "#f97316",
    accentRgb: "249, 115, 22",
    badge: "5 docs",
    docs: [
      ...FACILITY_COMPLIANCE_GUIDE.documents,
      ...THERMODYNAMICS_MAINTENANCE.documents,
    ],
    docCount: FACILITY_COMPLIANCE_GUIDE.documents.length + THERMODYNAMICS_MAINTENANCE.documents.length,
  },
];

const TYPE_COLORS: Record<string, string> = {
  pdf:  "bg-red-900/30 border-red-700/40 text-red-400",
  docx: "bg-blue-900/30 border-blue-700/40 text-blue-400",
  xlsx: "bg-green-900/30 border-green-700/40 text-green-400",
};

export default function LibraryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const visibleSections = SECTIONS.filter(
    (s) => filter === "all" || s.category === filter
  );

  const totalDocs = SECTIONS.reduce((sum, s) => sum + s.docCount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Library}
        title="Document Library"
        sub="All intelligence packages, SOPs, logs, checklists, and reference guides"
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        badge="Full Access"
        badgeVariant="success"
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Documents" value={totalDocs}    sub="Across all packages" icon={FileText}  accent={ACCENT}     accentRgb={ACCENT_RGB} />
        <StatCard label="Boiler Docs"     value={SECTIONS[0].docCount} sub="Guides, logs, safety" icon={BarChart3}  accent="#00FFE1"   accentRgb="0, 255, 225" />
        <StatCard label="Chiller Docs"    value={SECTIONS[1].docCount} sub="Logs & optimization" icon={BarChart3}  accent="#38bdf8"   accentRgb="56, 189, 248" />
        <StatCard label="Facility Docs"   value={SECTIONS[2].docCount} sub="SOPs, calculators"  icon={BarChart3}  accent="#fbbf24"   accentRgb="251, 191, 36" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="fi-input flex-1"
        />
        <div
          className="flex gap-0.5 p-1 rounded-xl border overflow-x-auto hide-scrollbar"
          style={{ background: "hsl(200 50% 7%)", borderColor: "hsl(200 30% 16%)" }}
        >
          {FILTER_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={
                filter === t.id
                  ? { background: `rgba(${ACCENT_RGB}, 0.12)`, border: `1px solid rgba(${ACCENT_RGB}, 0.3)`, color: ACCENT }
                  : { color: "hsl(200 15% 50%)", border: "1px solid transparent" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {visibleSections.map((section) => {
          const filtered = search.trim()
            ? section.docs.filter((d) => d.label.toLowerCase().includes(search.toLowerCase()))
            : section.docs;

          if (filtered.length === 0) return null;

          return (
            <div key={section.id}>
              <SectionHeader
                title={section.title}
                sub={`${filtered.length} document${filtered.length !== 1 ? "s" : ""}${section.lookerUrl ? " · Live dashboard available" : ""}`}
                accent={section.accent}
              />

              {/* Card container */}
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: "#0e1e2c", borderColor: "rgba(255,255,255,0.07)" }}
              >
                {/* Looker row */}
                {section.lookerUrl && (
                  <div
                    className="flex items-center justify-between gap-3 px-5 py-3.5 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.05)", background: `rgba(${section.accentRgb}, 0.04)` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 size={15} style={{ color: section.accent }} />
                      <span className="text-sm font-medium text-[hsl(200_18%_84%)]">Looker Studio Dashboard</span>
                      <span className="badge-active">Live</span>
                    </div>
                    <a
                      href={section.lookerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                      style={{ color: section.accent }}
                    >
                      Open Dashboard <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {/* Document rows */}
                {filtered.map((doc, i) => (
                  <div
                    key={doc.file}
                    className="row-item px-5"
                    style={{
                      borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[hsl(200_18%_84%)] truncate">{doc.label}</p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${TYPE_COLORS[doc.type] ?? TYPE_COLORS.pdf}`}>
                      {doc.type}
                    </span>
                    <a
                      href={`/library/${doc.file}`}
                      download
                      title={`Download ${doc.label}`}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: `rgba(${section.accentRgb}, 0.08)`,
                        border: `1px solid rgba(${section.accentRgb}, 0.25)`,
                        color: section.accent,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${section.accentRgb}, 0.15)`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${section.accentRgb}, 0.08)`; }}
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {visibleSections.every((s) => {
          const filtered = search.trim()
            ? s.docs.filter((d) => d.label.toLowerCase().includes(search.toLowerCase()))
            : s.docs;
          return filtered.length === 0;
        }) && (
          <div className="text-center py-12">
            <p className="text-sm text-[hsl(200_15%_45%)]">No documents match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
