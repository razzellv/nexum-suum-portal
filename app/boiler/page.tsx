"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { BOILER_INTELLIGENCE } from "@/app/lib/products";
import type { LibraryDocument } from "@/app/lib/products";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/4456f0c6-262f-4b8b-aba0-7eacd0be494e/page/H3TaF";

const ACCENT = "#00FFE1";
const ACCENT_RGB = "0, 255, 225";

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

const DOCS = BOILER_INTELLIGENCE.documents;
const GUIDE_DOCS = DOCS.filter((d) => d.file.includes("/guide/"));
const LOG_DOCS = DOCS.filter((d) => d.file.includes("/logs/"));
const SAFETY_DOCS = DOCS.filter((d) => d.file.includes("/safety/"));
const OPS_DOCS = DOCS.filter(
  (d) =>
    d.file.includes("/ops/") ||
    (!d.file.includes("/guide/") &&
      !d.file.includes("/logs/") &&
      !d.file.includes("/safety/") &&
      d.file.includes("boiler/"))
);

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
            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[hsl(200_30%_18%)] hover:border-[#00FFE1]/40 transition-all"
            style={{ background: "hsl(200 50% 8%)" }}
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
  equipmentId: "",
  boilerName: "",
  stackTemp: "",
  supplyTemp: "",
  returnTemp: "",
  fuelInput: "",
  operatingPressure: "",
  kwAmps: "",
  hzSpeed: "",
  notes: "",
  techName: "",
};

const inputCls =
  "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#00FFE1] focus:outline-none focus:ring-1 focus:ring-[#00FFE1]/50 placeholder-[hsl(200_15%_40%)] text-sm transition-all";

const logFields = [
  { label: "Date", name: "date", type: "date" },
  { label: "Equipment ID", name: "equipmentId", type: "text", placeholder: "e.g. BLR-001" },
  { label: "Boiler Name / Location", name: "boilerName", type: "text", placeholder: "e.g. Main Boiler Room" },
  { label: "Stack Temperature (°F)", name: "stackTemp", type: "text", placeholder: "e.g. 420" },
  { label: "Supply Temp (°F)", name: "supplyTemp", type: "text", placeholder: "e.g. 180" },
  { label: "Return Temp (°F)", name: "returnTemp", type: "text", placeholder: "e.g. 160" },
  { label: "Fuel Input (CCF or BTU)", name: "fuelInput", type: "text", placeholder: "e.g. 85 CCF" },
  { label: "Operating Pressure (PSI)", name: "operatingPressure", type: "text", placeholder: "e.g. 15" },
  { label: "kW / Amps", name: "kwAmps", type: "text", placeholder: "e.g. 12 kW" },
  { label: "Hz / Speed (%)", name: "hzSpeed", type: "text", placeholder: "e.g. 60 Hz / 75%" },
  { label: "Technician Name", name: "techName", type: "text", placeholder: "Full name" },
];

export default function BoilerPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM, date: todayStr() });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("boiler_notes");
        if (stored) setNotes(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("boiler_notes", JSON.stringify(updated));
    }
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
        body: JSON.stringify({ system: "boiler", ...form }),
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
            <Flame size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[hsl(200_18%_84%)]">Boiler Intelligence</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/30 border border-green-700/50 text-green-400">
                ● ACTIVE
              </span>
            </div>
            <p className="text-sm text-[hsl(200_15%_55%)]">Stack analysis · Combustion · Pressure · Safety</p>
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
              tab === t.id
                ? "text-[#00FFE1] border border-[hsl(173_100%_50%_/_0.3)]"
                : "text-[hsl(200_15%_55%)] hover:text-[hsl(200_18%_84%)]"
            }`}
            style={tab === t.id ? { background: "hsl(173 100% 50% / 0.15)" } : {}}
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
              { stat: "47 Documents", desc: "Complete boiler intelligence library" },
              { stat: "Live Dashboard", desc: "Looker Studio embedded analytics" },
              { stat: "6 Safety Modules", desc: "Protocols for every scenario" },
            ].map((card) => (
              <div
                key={card.stat}
                className="p-5 rounded-xl border transition-all"
                style={{
                  background: "hsl(200 50% 10%)",
                  borderColor: `rgba(${ACCENT_RGB}, 0.2)`,
                }}
              >
                <p className="text-xl font-bold mb-1" style={{ color: ACCENT }}>{card.stat}</p>
                <p className="text-sm text-[hsl(200_15%_55%)]">{card.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-4">Boiler Performance Dashboard</h2>
          <div
            className="rounded-xl overflow-hidden mb-3 teal-glow"
            style={{ border: `1px solid rgba(${ACCENT_RGB}, 0.3)` }}
          >
            <iframe
              src={LOOKER_URL}
              width="100%"
              height="600"
              className="block"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Boiler Looker Studio Dashboard"
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
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Log Boiler Data</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            Submit a reading to your Google Sheet. Data feeds directly into the Looker Studio dashboard.
          </p>

          {submitted && (
            <div
              className="mb-6 p-4 rounded-lg border flex items-center gap-3"
              style={{
                background: `rgba(${ACCENT_RGB}, 0.08)`,
                borderColor: `rgba(${ACCENT_RGB}, 0.4)`,
                color: ACCENT,
              }}
            >
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold">Entry logged — Looker Studio will update within minutes.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {logFields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleFormChange}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                rows={3}
                placeholder="Observations, anomalies, maintenance notes..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#00FFE1] text-[#001923] font-semibold px-6 py-2 rounded-lg hover:bg-[#00FFE1]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Log Entry"}
            </button>
          </form>
        </div>
      )}

      {/* Resources */}
      {tab === "resources" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-6">Boiler Resource Library</h2>
          <DocSection title="Guide" docs={GUIDE_DOCS} />
          <DocSection title="Logs & Checklists" docs={LOG_DOCS} />
          <DocSection title="Safety" docs={SAFETY_DOCS} />
          <DocSection title="Operations" docs={OPS_DOCS} />
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Boiler Notes</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            Private notes stored in your browser.
          </p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a note about this boiler system..."
              className={`${inputCls} resize-none mb-3`}
            />
            <button
              onClick={addNote}
              className="bg-[#00FFE1] text-[#001923] font-semibold px-5 py-2 rounded-lg hover:bg-[#00FFE1]/90 transition-all text-sm"
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
              style={{
                background: `rgba(${ACCENT_RGB}, 0.1)`,
                border: `1px solid rgba(${ACCENT_RGB}, 0.35)`,
                color: ACCENT,
              }}
            >
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
