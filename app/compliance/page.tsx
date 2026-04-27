"use client";

import { useState, useEffect } from "react";
import { FileCheck, ShieldCheck, BookOpen, ClipboardList, AlertCircle } from "lucide-react";
import {
  PageHeader, TabBar, StatCard, SectionHeader,
  Card, CardContent, DocCard, UpgradeBanner, inputCls,
} from "@/components/ui";

const ACCENT     = "#fbbf24";
const ACCENT_RGB = "251, 191, 36";

type Tab = "overview" | "documents" | "checklist" | "notes";

interface Note      { id: string; text: string; timestamp: number }
interface CheckItem { id: string; label: string; category: string; checked: boolean }

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "documents", label: "Documents" },
  { id: "checklist", label: "Checklist" },
  { id: "notes",     label: "Notes"     },
];

const COMPLIANCE_DOCS = [
  { label: "Compliance Handbook",           file: "facility/compliance-templates/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx",              type: "docx" as const, desc: "Full compliance handbook covering all facility systems" },
  { label: "Compliance Reference Guide",    file: "facility/compliance-templates/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx", type: "docx" as const, desc: "Boilers, chillers & facility compliance with regulatory checklists" },
  { label: "Boiler SOP",                   file: "facility/sops/Nexum_Suum_Boiler_SOP.docx",                                                        type: "docx" as const, desc: "Standard operating procedure for boiler systems" },
  { label: "Chiller SOP",                  file: "facility/sops/Nexum_Suum_Chiller_SOP.docx",                                                       type: "docx" as const, desc: "Standard operating procedure for chiller systems" },
  { label: "Water Treatment SOP",          file: "facility/sops/Nexum_Suum_Water_Treatment_and_Chemistry_SOP.docx",                                 type: "docx" as const, desc: "Water treatment and chemistry compliance procedures" },
  { label: "Electrical & Controls SOP",    file: "facility/sops/Nexum_Suum_Electrical_Electronics_and_Control_Systems_SOP.docx",                   type: "docx" as const, desc: "Electrical systems compliance and safety" },
];

const DEFAULT_CHECKLIST: CheckItem[] = [
  { id: "b1", label: "Boiler operating log current and signed",               category: "Boiler",            checked: false },
  { id: "b2", label: "Safety relief valves inspected & tested",               category: "Boiler",            checked: false },
  { id: "b3", label: "Water treatment log up to date",                        category: "Boiler",            checked: false },
  { id: "b4", label: "Annual boiler inspection certificate valid",             category: "Boiler",            checked: false },
  { id: "b5", label: "Low-water cutoff tested monthly",                       category: "Boiler",            checked: false },
  { id: "c1", label: "Refrigerant log current (EPA 608 required)",            category: "Chiller",           checked: false },
  { id: "c2", label: "Condenser water treatment log up to date",              category: "Chiller",           checked: false },
  { id: "c3", label: "Chiller operating permits current",                     category: "Chiller",           checked: false },
  { id: "c4", label: "Annual chiller efficiency test completed",              category: "Chiller",           checked: false },
  { id: "o1", label: "OSHA 300 log posted Feb 1–Apr 30 (if required)",       category: "OSHA",              checked: false },
  { id: "o2", label: "SDS (Safety Data Sheets) accessible & current",        category: "OSHA",              checked: false },
  { id: "o3", label: "PPE policy documented and enforced",                    category: "OSHA",              checked: false },
  { id: "o4", label: "Lockout/tagout procedures posted at equipment",         category: "OSHA",              checked: false },
  { id: "o5", label: "Fire extinguishers inspected monthly",                  category: "OSHA",              checked: false },
  { id: "o6", label: "Emergency action plan posted and rehearsed",            category: "OSHA",              checked: false },
  { id: "e1", label: "Refrigerant leak inspection completed (<100 lb units)", category: "EPA",               checked: false },
  { id: "e2", label: "Hazardous waste manifests filed and retained",          category: "EPA",               checked: false },
  { id: "e3", label: "Stormwater/NPDES permit current (if applicable)",       category: "EPA",               checked: false },
  { id: "f1", label: "Fire suppression inspection certificate current",       category: "Fire / Life Safety", checked: false },
  { id: "f2", label: "Sprinkler system inspected (quarterly)",                category: "Fire / Life Safety", checked: false },
  { id: "f3", label: "Smoke detector battery / function test logged",         category: "Fire / Life Safety", checked: false },
  { id: "f4", label: "Emergency exit signs lit and unobstructed",             category: "Fire / Life Safety", checked: false },
  { id: "p1", label: "Facility operating permit current",                     category: "Permits",            checked: false },
  { id: "p2", label: "Air quality permits current (if applicable)",           category: "Permits",            checked: false },
  { id: "p3", label: "Elevator / escalator inspection current",               category: "Permits",            checked: false },
];

const CATEGORIES = [...new Set(DEFAULT_CHECKLIST.map((i) => i.category))];

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function CompliancePage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [checklist, setChecklist] = useState<CheckItem[]>(DEFAULT_CHECKLIST);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [newNote, setNewNote]   = useState("");

  useEffect(() => {
    try {
      const n = localStorage.getItem("compliance_notes");
      if (n) setNotes(JSON.parse(n));
      const c = localStorage.getItem("compliance_checklist");
      if (c) setChecklist(JSON.parse(c));
    } catch {}
  }, []);

  function saveNotes(n: Note[]) {
    setNotes(n);
    try { localStorage.setItem("compliance_notes", JSON.stringify(n)); } catch {}
  }

  function toggleCheck(id: string) {
    const updated = checklist.map((c) => c.id === id ? { ...c, checked: !c.checked } : c);
    setChecklist(updated);
    try { localStorage.setItem("compliance_checklist", JSON.stringify(updated)); } catch {}
  }

  function resetChecklist() {
    setChecklist(DEFAULT_CHECKLIST);
    try { localStorage.setItem("compliance_checklist", JSON.stringify(DEFAULT_CHECKLIST)); } catch {}
  }

  function addNote() {
    if (!newNote.trim()) return;
    saveNotes([{ id: Date.now().toString(), text: newNote.trim(), timestamp: Date.now() }, ...notes]);
    setNewNote("");
  }

  const total = checklist.length;
  const done  = checklist.filter((c) => c.checked).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const badgeLabel   = `${pct}% Complete`;
  const badgeVariant = pct === 100 ? "success" as const : "warning" as const;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={FileCheck}
        title="Compliance Center"
        sub="OSHA · EPA · Fire · Permits · SOPs"
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        badge={badgeLabel}
        badgeVariant={badgeVariant}
      />

      <TabBar tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} accentRgb={ACCENT_RGB} />

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Checklist Progress" value={`${done}/${total}`} sub="Items completed"                        icon={ClipboardList} accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="SOPs"               value="6"                  sub="Boiler, chiller, pump, AHU & more"      icon={BookOpen}      accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Reference Guides"   value="2"                  sub="Handbook & boiler/chiller reference"    icon={ShieldCheck}   accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Categories"         value="6"                  sub="OSHA, EPA, Fire, Permits & more"        icon={AlertCircle}   accent={ACCENT} accentRgb={ACCENT_RGB} />
          </div>

          <SectionHeader title="Overall Compliance Progress" sub="Go to the Checklist tab to mark items complete" accent={ACCENT} />
          <Card className="mb-8">
            <CardContent className="pt-5">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-[hsl(200_18%_84%)]">Progress</p>
                <p className="text-sm font-bold" style={{ color: ACCENT }}>{pct}%</p>
              </div>
              <div className="w-full h-2.5 bg-[hsl(200_30%_18%)] rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: ACCENT }} />
              </div>
              <p className="text-xs text-[hsl(200_15%_45%)]">{done} of {total} items completed</p>
            </CardContent>
          </Card>

          <SectionHeader title="What's Included" accent={ACCENT} />
          <Card>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {["OSHA 300 & 301 log guidance", "EPA refrigerant & hazardous waste requirements",
                  "Boiler, chiller & facility permit tracking", "Fire suppression & life safety checklist",
                  "SOP library for 6 major systems", "Compliance Handbook (downloadable)"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[hsl(200_15%_55%)]">
                    <span style={{ color: ACCENT }}>▸</span>{item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Documents ── */}
      {tab === "documents" && (
        <div>
          <SectionHeader title="Compliance Documents" sub="Download your compliance handbook, reference guides, and SOPs" accent={ACCENT} />
          <div className="space-y-3 max-w-3xl">
            {COMPLIANCE_DOCS.map((doc) => (
              <div key={doc.file}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-all"
                style={{ background: "hsl(200 50% 8%)", borderColor: "hsl(200 30% 16%)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${ACCENT_RGB}, 0.35)`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(200 30% 16%)"; }}
              >
                <div className="min-w-0">
                  <p className="text-sm text-[hsl(200_18%_84%)] font-medium truncate mb-0.5">{doc.label}</p>
                  <p className="text-xs text-[hsl(200_15%_45%)] mb-1.5">{doc.desc}</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    doc.type === "docx" ? "bg-blue-900/30 border-blue-700/40 text-blue-400" : "bg-red-900/30 border-red-700/40 text-red-400"
                  }`}>{doc.type}</span>
                </div>
                <a href={`/library/${doc.file}`} download
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: `rgba(${ACCENT_RGB}, 0.08)`, border: `1px solid rgba(${ACCENT_RGB}, 0.25)`, color: ACCENT }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${ACCENT_RGB}, 0.15)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${ACCENT_RGB}, 0.08)`; }}
                >
                  ↓ Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Checklist ── */}
      {tab === "checklist" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="Compliance Checklist" sub={`${done} of ${total} items complete — saved to your browser`} accent={ACCENT} />
            <button onClick={resetChecklist}
              className="text-xs text-[hsl(200_15%_45%)] hover:text-red-400 transition-colors shrink-0">
              Reset all
            </button>
          </div>

          {CATEGORIES.map((cat) => {
            const items   = checklist.filter((c) => c.category === cat);
            const catDone = items.filter((c) => c.checked).length;
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold text-[hsl(200_15%_50%)] uppercase tracking-widest">{cat}</p>
                  <span className="text-xs text-[hsl(200_15%_40%)]">({catDone}/{items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background:   item.checked ? `rgba(${ACCENT_RGB}, 0.05)` : "hsl(200 50% 8%)",
                        borderColor:  item.checked ? `rgba(${ACCENT_RGB}, 0.3)`  : "hsl(200 30% 18%)",
                      }}>
                      <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 rounded accent-amber-400 shrink-0" />
                      <span className={`text-sm transition-all ${item.checked ? "line-through text-[hsl(200_15%_45%)]" : "text-[hsl(200_18%_84%)]"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <UpgradeBanner accent={ACCENT} accentRgb={ACCENT_RGB} />
        </div>
      )}

      {/* ── Notes ── */}
      {tab === "notes" && (
        <div className="max-w-2xl">
          <SectionHeader title="Compliance Notes" sub="Private notes stored in your browser" accent={ACCENT} />
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4}
                placeholder="Add a compliance note, inspection finding, or follow-up action…"
                className={`${inputCls()} resize-none`} />
              <button onClick={addNote}
                className="font-semibold px-5 py-2 rounded-lg transition-all text-sm"
                style={{ background: ACCENT, color: "#001923" }}>
                Save Note
              </button>
            </CardContent>
          </Card>

          <div className="space-y-3 mb-6">
            {notes.length === 0 && (
              <p className="text-sm text-[hsl(200_15%_45%)]">No notes yet. Add your first observation above.</p>
            )}
            {notes.map((n) => (
              <Card key={n.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-[hsl(200_15%_45%)] mb-1">{fmt(n.timestamp)}</p>
                      <p className="text-sm text-[hsl(200_18%_84%)] whitespace-pre-wrap">{n.text}</p>
                    </div>
                    <button onClick={() => saveNotes(notes.filter((x) => x.id !== n.id))}
                      className="shrink-0 text-red-500/60 hover:text-red-400 transition-colors text-xs">
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <UpgradeBanner accent={ACCENT} accentRgb={ACCENT_RGB} />
        </div>
      )}
    </div>
  );
}
