"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileCheck } from "lucide-react";

const ACCENT     = "#fbbf24";
const ACCENT_RGB = "251, 191, 36";

type Tab = "overview" | "documents" | "checklist" | "notes";

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

interface CheckItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview"   },
  { id: "documents",  label: "Documents"  },
  { id: "checklist",  label: "Checklist"  },
  { id: "notes",      label: "Notes"      },
];

const COMPLIANCE_DOCS = [
  {
    label: "Compliance Handbook",
    file: "facility/compliance-templates/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx",
    type: "docx" as const,
    desc: "Full compliance handbook covering all facility systems",
  },
  {
    label: "Compliance Reference Guide",
    file: "facility/compliance-templates/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx",
    type: "docx" as const,
    desc: "Boilers, chillers, and facility compliance reference with regulatory checklists",
  },
  {
    label: "Boiler SOP",
    file: "facility/sops/Nexum_Suum_Boiler_SOP.docx",
    type: "docx" as const,
    desc: "Standard operating procedure for boiler systems",
  },
  {
    label: "Chiller SOP",
    file: "facility/sops/Nexum_Suum_Chiller_SOP.docx",
    type: "docx" as const,
    desc: "Standard operating procedure for chiller systems",
  },
  {
    label: "Water Treatment SOP",
    file: "facility/sops/Nexum_Suum_Water_Treatment_and_Chemistry_SOP.docx",
    type: "docx" as const,
    desc: "Water treatment and chemistry compliance procedures",
  },
  {
    label: "Electrical & Controls SOP",
    file: "facility/sops/Nexum_Suum_Electrical_Electronics_and_Control_Systems_SOP.docx",
    type: "docx" as const,
    desc: "Electrical systems compliance and safety",
  },
];

const DEFAULT_CHECKLIST: CheckItem[] = [
  // Boiler
  { id: "b1", label: "Boiler operating log current and signed",               category: "Boiler",     checked: false },
  { id: "b2", label: "Safety relief valves inspected & tested",               category: "Boiler",     checked: false },
  { id: "b3", label: "Water treatment log up to date",                        category: "Boiler",     checked: false },
  { id: "b4", label: "Annual boiler inspection certificate valid",             category: "Boiler",     checked: false },
  { id: "b5", label: "Low-water cutoff tested monthly",                       category: "Boiler",     checked: false },
  // Chiller
  { id: "c1", label: "Refrigerant log current (EPA 608 required)",            category: "Chiller",    checked: false },
  { id: "c2", label: "Condenser water treatment log up to date",              category: "Chiller",    checked: false },
  { id: "c3", label: "Chiller operating permits current",                     category: "Chiller",    checked: false },
  { id: "c4", label: "Annual chiller efficiency test completed",              category: "Chiller",    checked: false },
  // OSHA
  { id: "o1", label: "OSHA 300 log posted Feb 1–Apr 30 (if required)",       category: "OSHA",       checked: false },
  { id: "o2", label: "SDS (Safety Data Sheets) accessible & current",        category: "OSHA",       checked: false },
  { id: "o3", label: "PPE policy documented and enforced",                    category: "OSHA",       checked: false },
  { id: "o4", label: "Lockout/tagout procedures posted at equipment",         category: "OSHA",       checked: false },
  { id: "o5", label: "Fire extinguishers inspected monthly",                  category: "OSHA",       checked: false },
  { id: "o6", label: "Emergency action plan posted and rehearsed",            category: "OSHA",       checked: false },
  // EPA
  { id: "e1", label: "Refrigerant leak inspection completed (<100 lb units)", category: "EPA",        checked: false },
  { id: "e2", label: "Hazardous waste manifests filed and retained",          category: "EPA",        checked: false },
  { id: "e3", label: "Stormwater/NPDES permit current (if applicable)",       category: "EPA",        checked: false },
  // Fire
  { id: "f1", label: "Fire suppression inspection certificate current",       category: "Fire / Life Safety", checked: false },
  { id: "f2", label: "Sprinkler system inspected (quarterly)",                category: "Fire / Life Safety", checked: false },
  { id: "f3", label: "Smoke detector battery / function test logged",         category: "Fire / Life Safety", checked: false },
  { id: "f4", label: "Emergency exit signs lit and unobstructed",             category: "Fire / Life Safety", checked: false },
  // Permits
  { id: "p1", label: "Facility operating permit current",                     category: "Permits",    checked: false },
  { id: "p2", label: "Air quality permits current (if applicable)",           category: "Permits",    checked: false },
  { id: "p3", label: "Elevator / escalator inspection current",               category: "Permits",    checked: false },
];

const CHECKLIST_CATEGORIES = [...new Set(DEFAULT_CHECKLIST.map((i) => i.category))];

function TypeBadge({ type }: { type: "pdf" | "docx" | "xlsx" }) {
  const colors: Record<string, string> = {
    pdf:  "bg-red-900/40 text-red-400 border-red-700/50",
    docx: "bg-blue-900/40 text-blue-400 border-blue-700/50",
    xlsx: "bg-green-900/40 text-green-400 border-green-700/50",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border uppercase ${colors[type]}`}>
      {type}
    </span>
  );
}

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function CompliancePage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [checklist, setChecklist] = useState<CheckItem[]>(DEFAULT_CHECKLIST);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("compliance_notes");
        if (stored) setNotes(JSON.parse(stored));
        const storedCheck = localStorage.getItem("compliance_checklist");
        if (storedCheck) setChecklist(JSON.parse(storedCheck));
      } catch {}
    }
  }, []);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    localStorage.setItem("compliance_notes", JSON.stringify(updated));
  }

  function toggleCheck(id: string) {
    const updated = checklist.map((c) => c.id === id ? { ...c, checked: !c.checked } : c);
    setChecklist(updated);
    localStorage.setItem("compliance_checklist", JSON.stringify(updated));
  }

  function resetChecklist() {
    const reset = DEFAULT_CHECKLIST;
    setChecklist(reset);
    localStorage.setItem("compliance_checklist", JSON.stringify(reset));
  }

  function addNote() {
    if (!newNote.trim()) return;
    const note: Note = { id: Date.now().toString(), text: newNote.trim(), timestamp: Date.now() };
    saveNotes([note, ...notes]);
    setNewNote("");
  }

  function deleteNote(id: string) {
    saveNotes(notes.filter((n) => n.id !== id));
  }

  const total   = checklist.length;
  const done    = checklist.filter((c) => c.checked).length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  const inputCls =
    "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-[#fbbf24]/50 placeholder-[hsl(200_15%_40%)] text-sm transition-all";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.3)` }}
          >
            <FileCheck size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[hsl(200_18%_84%)]">Compliance Center</h1>
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold"
                style={{
                  background: pct === 100 ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)",
                  border: pct === 100 ? "1px solid rgba(74,222,128,0.5)" : "1px solid rgba(251,191,36,0.5)",
                  color: pct === 100 ? "#4ade80" : "#fbbf24",
                }}
              >
                {pct}% Complete
              </span>
            </div>
            <p className="text-sm text-[hsl(200_15%_55%)]">OSHA · EPA · Fire · Permits · SOPs</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 mb-8 p-1 rounded-lg border border-[hsl(200_30%_18%)] w-fit flex-wrap"
        style={{ background: "hsl(200 50% 8%)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.id ? "border" : "text-[hsl(200_15%_55%)] hover:text-[hsl(200_18%_84%)]"
            }`}
            style={
              tab === t.id
                ? { background: `rgba(${ACCENT_RGB}, 0.15)`, borderColor: `rgba(${ACCENT_RGB}, 0.3)`, color: ACCENT }
                : {}
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { stat: `${done} / ${total}`, desc: "Compliance items checked off" },
              { stat: "6 SOPs",             desc: "Boiler, chiller, pump, AHU, water treatment, electrical" },
              { stat: "2 Reference Guides", desc: "Compliance handbook & boiler/chiller reference" },
            ].map((card) => (
              <div
                key={card.stat}
                className="p-5 rounded-xl border"
                style={{ background: "hsl(200 50% 10%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
              >
                <p className="text-xl font-bold mb-1" style={{ color: ACCENT }}>{card.stat}</p>
                <p className="text-sm text-[hsl(200_15%_55%)]">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="p-6 rounded-xl border mb-8"
            style={{ background: "hsl(200 50% 10%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
          >
            <div className="flex justify-between mb-2">
              <p className="text-sm font-semibold text-[hsl(200_18%_84%)]">Overall Compliance Progress</p>
              <p className="text-sm font-bold" style={{ color: ACCENT }}>{pct}%</p>
            </div>
            <div className="w-full h-2 bg-[hsl(200_30%_18%)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: ACCENT }}
              />
            </div>
            <p className="text-xs text-[hsl(200_15%_45%)] mt-2">
              {done} of {total} items completed · Go to the Checklist tab to update
            </p>
          </div>

          <div
            className="p-5 rounded-xl border"
            style={{ background: "hsl(200 50% 10%)", borderColor: `rgba(${ACCENT_RGB}, 0.15)` }}
          >
            <p className="text-sm font-semibold text-[hsl(200_18%_84%)] mb-2">What's included</p>
            <ul className="space-y-1.5 text-sm text-[hsl(200_15%_55%)]">
              {["OSHA 300 & 301 log guidance", "EPA refrigerant & hazardous waste requirements",
                "Boiler, chiller & facility permit tracking", "Fire suppression & life safety checklist",
                "SOP library for 6 major systems", "Compliance Handbook (downloadable)"].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span style={{ color: ACCENT }}>▸</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Documents */}
      {tab === "documents" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-2">Compliance Documents</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            Download your compliance handbook, reference guides, and SOPs.
          </p>
          <div className="space-y-3 max-w-3xl">
            {COMPLIANCE_DOCS.map((doc) => (
              <div
                key={doc.file}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border transition-all"
                style={{ background: "hsl(200 50% 8%)", borderColor: `rgba(${ACCENT_RGB}, 0.15)` }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-[hsl(200_18%_84%)] font-medium truncate">{doc.label}</p>
                    <TypeBadge type={doc.type} />
                  </div>
                  <p className="text-xs text-[hsl(200_15%_45%)]">{doc.desc}</p>
                </div>
                <a
                  href={`/library/${doc.file}`}
                  download
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: `rgba(${ACCENT_RGB}, 0.08)`,
                    border: `1px solid rgba(${ACCENT_RGB}, 0.3)`,
                    color: ACCENT,
                  }}
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist */}
      {tab === "checklist" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Compliance Checklist</h2>
              <p className="text-sm text-[hsl(200_15%_55%)]">
                {done} of {total} items complete. Checkboxes are saved to your browser.
              </p>
            </div>
            <button
              onClick={resetChecklist}
              className="text-xs text-[hsl(200_15%_45%)] hover:text-red-400 transition-colors"
            >
              Reset all
            </button>
          </div>

          {CHECKLIST_CATEGORIES.map((cat) => {
            const items = checklist.filter((c) => c.category === cat);
            const catDone = items.filter((c) => c.checked).length;
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-semibold text-[hsl(200_15%_55%)] uppercase tracking-widest">{cat}</h3>
                  <span className="text-xs text-[hsl(200_15%_40%)]">({catDone}/{items.length})</span>
                </div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                      style={{
                        background: item.checked ? `rgba(${ACCENT_RGB}, 0.06)` : "hsl(200 50% 8%)",
                        borderColor: item.checked ? `rgba(${ACCENT_RGB}, 0.3)` : "hsl(200 30% 18%)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheck(item.id)}
                        className="w-4 h-4 rounded accent-amber-400 shrink-0"
                      />
                      <span
                        className={`text-sm transition-all ${
                          item.checked ? "line-through text-[hsl(200_15%_45%)]" : "text-[hsl(200_18%_84%)]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          <div
            className="mt-6 p-5 rounded-xl border"
            style={{ background: "hsl(200 50% 8%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
          >
            <p className="text-sm text-[hsl(200_15%_55%)] mb-3">
              Upgrade to FI Platform for team-wide compliance tracking, automated reminders, and audit exports.
            </p>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.35)`, color: ACCENT }}>
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Compliance Notes</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">Private notes stored in your browser.</p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a compliance note, inspection finding, or follow-up action…"
              className={`${inputCls} resize-none mb-3`}
            />
            <button
              onClick={addNote}
              className="font-semibold px-5 py-2 rounded-lg transition-all text-sm"
              style={{ background: ACCENT, color: "#001923" }}
            >
              Save Note
            </button>
          </div>
          <div className="space-y-3 max-w-2xl">
            {notes.length === 0 && (
              <p className="text-sm text-[hsl(200_15%_45%)]">No notes yet.</p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="p-4 rounded-lg border border-[hsl(200_30%_18%)]"
                style={{ background: "hsl(200 50% 8%)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[hsl(200_15%_45%)] mb-1">{formatTimestamp(note.timestamp)}</p>
                    <p className="text-sm text-[hsl(200_18%_84%)] whitespace-pre-wrap">{note.text}</p>
                  </div>
                  <button onClick={() => deleteNote(note.id)}
                    className="shrink-0 text-red-500/60 hover:text-red-400 transition-colors text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
