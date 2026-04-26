"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { FACILITY_INTELLIGENCE } from "@/app/lib/products";
import type { LibraryDocument } from "@/app/lib/products";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF";

const ACCENT = "#fbbf24";
const ACCENT_RGB = "251, 191, 36";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "log-data", label: "Log Data" },
  { id: "resources", label: "Resources" },
  { id: "notes", label: "Notes" },
];

const DOCS = FACILITY_INTELLIGENCE.documents;
const SOP_DOCS = DOCS.filter((d) => d.file.includes("/sops/"));
const COMPLIANCE_DOCS = DOCS.filter((d) => d.file.includes("/compliance-templates/"));
const CALCULATOR_DOCS = DOCS.filter((d) => d.file.includes("/calculators/"));

function TypeBadge({ type }: { type: LibraryDocument["type"] }) {
  const colors: Record<string, string> = {
    pdf: "bg-red-900/40 text-red-400 border-red-700/50",
    docx: "bg-blue-900/40 text-blue-400 border-blue-700/50",
    xlsx: "bg-green-900/40 text-green-400 border-green-700/50",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border uppercase ${colors[type] ?? ""}`}>
      {type}
    </span>
  );
}

function DocSection({ title, docs }: { title: string; docs: LibraryDocument[] }) {
  if (docs.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-[hsl(200_15%_55%)] uppercase tracking-widest mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map((doc) => (
          <div
            key={doc.file}
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[hsl(200_30%_18%)] transition-all"
            style={{ background: "hsl(200 50% 8%)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${ACCENT_RGB}, 0.4)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(200 30% 18%)";
            }}
          >
            <div className="min-w-0">
              <p className="text-sm text-[hsl(200_18%_84%)] font-medium truncate mb-1">{doc.label}</p>
              <TypeBadge type={doc.type} />
            </div>
            <a
              href={`/library/${doc.file}`}
              download
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: `rgba(${ACCENT_RGB}, 0.08)`, border: `1px solid rgba(${ACCENT_RGB}, 0.3)`, color: ACCENT }}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const EMPTY_FORM = {
  date: "",
  facilityName: "",
  systemEquipment: "",
  systemType: "",
  observationReading: "",
  operatingStatus: "",
  correctiveAction: "",
  followUpRequired: "",
  complianceNotes: "",
  techName: "",
};

const inputCls =
  "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-amber-400/50 placeholder-[hsl(200_15%_40%)] text-sm transition-all";

const selectCls =
  "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#fbbf24] focus:outline-none focus:ring-1 focus:ring-amber-400/50 text-sm transition-all appearance-none";

export default function FacilityPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM, date: todayStr() });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("facility_notes");
        if (stored) setNotes(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("facility_notes", JSON.stringify(updated));
    }
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "facility", ...form }),
      });
    } catch {}
    setSubmitted(true);
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 6000);
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.3)` }}
          >
            <Building2 size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[hsl(200_18%_84%)]">Facility Intelligence</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/30 border border-green-700/50 text-green-400">
                ● ACTIVE
              </span>
            </div>
            <p className="text-sm text-[hsl(200_15%_55%)]">9-system SOPs · Compliance · Multi-system logging</p>
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
                ? { background: `rgba(${ACCENT_RGB}, 0.12)`, borderColor: `rgba(${ACCENT_RGB}, 0.35)`, color: ACCENT }
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
              { stat: "9 System SOPs", desc: "Boiler, chiller, pump, AHU, and more" },
              { stat: "Compliance Ready", desc: "Handbook & reference guide included" },
              { stat: "Live Dashboard", desc: "Looker Studio facility analytics" },
            ].map((card) => (
              <div
                key={card.stat}
                className="p-5 rounded-xl border transition-all"
                style={{ background: "hsl(200 50% 10%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
              >
                <p className="text-xl font-bold mb-1" style={{ color: ACCENT }}>{card.stat}</p>
                <p className="text-sm text-[hsl(200_15%_55%)]">{card.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-4">Facility Performance Dashboard</h2>
          <div
            className="rounded-xl overflow-hidden mb-3"
            style={{ border: `1px solid rgba(${ACCENT_RGB}, 0.3)`, boxShadow: `0 0 20px rgba(${ACCENT_RGB}, 0.08)` }}
          >
            <iframe
              src={LOOKER_URL}
              width="100%"
              height="600"
              className="block"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Facility Looker Studio Dashboard"
            />
          </div>
          <p className="text-xs text-[hsl(200_15%_45%)]">
            Submit readings in the Log Data tab to update this dashboard.
          </p>
        </div>
      )}

      {/* Log Data */}
      {tab === "log-data" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Log Facility Data</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            Submit a system observation. Data feeds directly into the Looker Studio dashboard.
          </p>

          {submitted && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-center gap-3"
              style={{ background: `rgba(${ACCENT_RGB}, 0.08)`, borderColor: `rgba(${ACCENT_RGB}, 0.4)`, color: ACCENT }}
            >
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold">Entry logged — Looker Studio will update within minutes.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleFormChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Facility Name</label>
              <input type="text" name="facilityName" value={form.facilityName} onChange={handleFormChange} placeholder="e.g. North Campus Building A" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">System / Equipment</label>
              <input type="text" name="systemEquipment" value={form.systemEquipment} onChange={handleFormChange} placeholder="e.g. Chiller 2, AHU-03" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">System Type</label>
              <select name="systemType" value={form.systemType} onChange={handleFormChange} className={selectCls}>
                <option value="">Select system type…</option>
                <option>Boiler</option>
                <option>Chiller</option>
                <option>AHU</option>
                <option>Pump</option>
                <option>Cooling Tower</option>
                <option>Electrical</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Observation / Reading</label>
              <input type="text" name="observationReading" value={form.observationReading} onChange={handleFormChange} placeholder="e.g. Supply temp 48°F, 320 GPM, 95 kW" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Operating Status</label>
              <select name="operatingStatus" value={form.operatingStatus} onChange={handleFormChange} className={selectCls}>
                <option value="">Select status…</option>
                <option>Normal</option>
                <option>Warning</option>
                <option>Critical</option>
                <option>Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Corrective Action Taken</label>
              <input type="text" name="correctiveAction" value={form.correctiveAction} onChange={handleFormChange} placeholder="e.g. Adjusted set point, replaced filter" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Follow-Up Required</label>
              <select name="followUpRequired" value={form.followUpRequired} onChange={handleFormChange} className={selectCls}>
                <option value="">Select…</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Compliance Notes</label>
              <textarea name="complianceNotes" value={form.complianceNotes} onChange={handleFormChange} rows={3} placeholder="Any regulatory or compliance observations..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Technician Name</label>
              <input type="text" name="techName" value={form.techName} onChange={handleFormChange} placeholder="Full name" className={inputCls} />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ background: ACCENT, color: "#001923" }}
            >
              {submitting ? "Submitting…" : "Submit Log Entry"}
            </button>
          </form>
        </div>
      )}

      {/* Resources */}
      {tab === "resources" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-6">Facility Resource Library</h2>
          <DocSection title="SOPs" docs={SOP_DOCS} />
          <DocSection title="Compliance Templates" docs={COMPLIANCE_DOCS} />
          <DocSection title="Calculators / Dashboards" docs={CALCULATOR_DOCS} />
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Facility Notes</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">Private notes stored in your browser.</p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a note about facility systems, issues, or follow-ups..."
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

          <div className="space-y-3 max-w-2xl mb-10">
            {notes.length === 0 && (
              <p className="text-sm text-[hsl(200_15%_45%)]">No notes yet. Add your first observation.</p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg border border-[hsl(200_30%_18%)]"
                style={{ background: "hsl(200 50% 8%)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-[hsl(200_15%_45%)] mb-1">{formatTimestamp(note.timestamp)}</p>
                    <p className="text-sm text-[hsl(200_18%_84%)] whitespace-pre-wrap">{note.text}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="shrink-0 text-red-500/60 hover:text-red-400 transition-colors text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            className="max-w-2xl p-5 rounded-xl border"
            style={{ background: "hsl(200 50% 8%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
          >
            <p className="text-sm text-[hsl(200_15%_55%)] mb-3">
              Upgrade to FI Platform for team notes, API sync, and full diagnostic history.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.35)`, color: ACCENT }}
            >
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
