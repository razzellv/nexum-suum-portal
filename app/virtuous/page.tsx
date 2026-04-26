"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF";

const ACCENT     = "#c084fc";
const ACCENT_RGB = "192, 132, 252";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"   },
  { id: "log-data",  label: "Log Entry"  },
  { id: "resources", label: "Resources"  },
  { id: "notes",     label: "Notes"      },
];

const LOG_TYPES = [
  "Safety Concern",
  "Ethics Issue",
  "Policy Violation",
  "Positive Recognition",
  "Near Miss",
  "Environmental Concern",
  "Regulatory Compliance",
  "Team Behavior",
  "Vendor / Contractor Issue",
  "Other",
];

const DEPARTMENTS = [
  "Maintenance",
  "Operations",
  "Safety & Compliance",
  "Management",
  "Executive",
  "Human Resources",
  "Procurement",
  "Engineering",
  "Custodial",
  "Energy",
];

const STATUSES = ["Open", "In Progress", "Resolved", "Escalated", "Closed"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const EMPTY_FORM = {
  date: "",
  reporter: "",
  department: "",
  logType: "",
  severity: "",
  equipmentSystem: "",
  description: "",
  actionTaken: "",
  status: "Open",
};

const inputCls =
  "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#c084fc] focus:outline-none focus:ring-1 focus:ring-[#c084fc]/50 placeholder-[hsl(200_15%_40%)] text-sm transition-all";

const selectCls =
  "bg-[hsl(200_30%_12%)] border border-[hsl(200_30%_22%)] text-[hsl(200_18%_84%)] rounded-lg px-3 py-2 w-full focus:border-[#c084fc] focus:outline-none text-sm transition-all";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

const VIRTUOUS_DOCS = [
  {
    label: "Virtuous Ethical Logger",
    file: "facility/Organization Virtuous Ethical Logger.xlsx",
    type: "xlsx" as const,
  },
  {
    label: "Facility Client Dashboard",
    file: "facility/NS-FAC-PRM-Facility_Client_Dashboard001.xlsx",
    type: "xlsx" as const,
  },
  {
    label: "Compliance Handbook",
    file: "facility/compliance-templates/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx",
    type: "docx" as const,
  },
  {
    label: "Compliance Reference Guide",
    file: "facility/compliance-templates/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx",
    type: "docx" as const,
  },
];

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

export default function VirtuousPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM, date: todayStr() });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("virtuous_notes");
        if (stored) setNotes(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("virtuous_notes", JSON.stringify(updated));
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
        body: JSON.stringify({ system: "virtuous", ...form }),
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
            <Shield size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[hsl(200_18%_84%)]">Virtuous Ethics Logger</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-900/30 border border-purple-700/50 text-purple-400">
                ● ACTIVE
              </span>
            </div>
            <p className="text-sm text-[hsl(200_15%_55%)]">
              Ethical accountability · Safety observations · Compliance tracking
            </p>
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
                ? "border"
                : "text-[hsl(200_15%_55%)] hover:text-[hsl(200_18%_84%)]"
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
              { stat: "10 Log Types",      desc: "Safety, ethics, compliance, recognition & more" },
              { stat: "Anonymous Option",  desc: "Submit concerns confidentially — no name required" },
              { stat: "Live Dashboard",    desc: "All entries feed your Looker Studio analytics" },
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

          <div
            className="mb-6 p-4 rounded-xl border flex gap-3 items-start"
            style={{ background: `rgba(${ACCENT_RGB}, 0.05)`, borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}
          >
            <Shield size={18} style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>What is the Virtuous Logger?</p>
              <p className="text-sm text-[hsl(200_15%_55%)] leading-relaxed">
                The Virtuous Ethical Logger gives your organization a structured way to document safety concerns,
                ethical issues, policy observations, and positive recognitions. Entries feed directly into your
                Google Sheet and Looker Studio dashboard, giving management full visibility without creating
                barriers to reporting.
              </p>
            </div>
          </div>

          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-4">Ethics & Compliance Dashboard</h2>
          <div
            className="rounded-xl overflow-hidden mb-3"
            style={{ border: `1px solid rgba(${ACCENT_RGB}, 0.3)` }}
          >
            <iframe
              src={LOOKER_URL}
              width="100%"
              height="600"
              className="block"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Virtuous Ethics Looker Studio Dashboard"
            />
          </div>
          <p className="text-xs text-[hsl(200_15%_45%)]">
            Submit an entry in the Log Entry tab to update this dashboard.
          </p>
        </div>
      )}

      {/* Log Data */}
      {tab === "log-data" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">New Ethics Log Entry</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            All entries are stored in your Google Sheet and update the Looker Studio dashboard. Reporter
            name is optional — leave blank to submit anonymously.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                  Reporter Name <span className="text-[hsl(200_15%_40%)]">(optional — leave blank for anonymous)</span>
                </label>
                <input type="text" name="reporter" value={form.reporter} onChange={handleFormChange}
                  placeholder="Anonymous if blank" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Department *</label>
                <select name="department" value={form.department} onChange={handleFormChange} required className={selectCls}>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Log Type *</label>
                <select name="logType" value={form.logType} onChange={handleFormChange} required className={selectCls}>
                  <option value="">Select type…</option>
                  {LOG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Severity *</label>
                <select name="severity" value={form.severity} onChange={handleFormChange} required className={selectCls}>
                  <option value="">Select severity…</option>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange} className={selectCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                Equipment / System Involved <span className="text-[hsl(200_15%_40%)]">(optional)</span>
              </label>
              <input type="text" name="equipmentSystem" value={form.equipmentSystem} onChange={handleFormChange}
                placeholder="e.g. Boiler BLR-001, AHU-3, Chiller Plant" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleFormChange} required
                rows={4} placeholder="Describe the concern, observation, or recognition in detail…"
                className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                Action Taken <span className="text-[hsl(200_15%_40%)]">(optional)</span>
              </label>
              <textarea name="actionTaken" value={form.actionTaken} onChange={handleFormChange}
                rows={3} placeholder="Corrective action, follow-up steps, or resolution taken…"
                className={`${inputCls} resize-none`} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-2">Virtuous Resources</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">
            Download your Virtuous Ethical Logger workbook and compliance reference guides.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {VIRTUOUS_DOCS.map((doc) => (
              <div
                key={doc.file}
                className="flex items-center justify-between gap-3 p-4 rounded-lg border transition-all"
                style={{ background: "hsl(200 50% 8%)", borderColor: `rgba(${ACCENT_RGB}, 0.15)` }}
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
      )}

      {/* Notes */}
      {tab === "notes" && (
        <div>
          <h2 className="text-base font-semibold text-[hsl(200_18%_84%)] mb-1">Virtuous Notes</h2>
          <p className="text-sm text-[hsl(200_15%_55%)] mb-6">Private notes stored in your browser.</p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a private note about ethics, compliance, or observations…"
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

          <div className="max-w-2xl p-5 rounded-xl border"
            style={{ background: "hsl(200 50% 8%)", borderColor: `rgba(${ACCENT_RGB}, 0.2)` }}>
            <p className="text-sm text-[hsl(200_15%_55%)] mb-3">
              Upgrade to FI Platform for team-wide ethics dashboards, escalation workflows, and persistent audit logs.
            </p>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: `rgba(${ACCENT_RGB}, 0.1)`, border: `1px solid rgba(${ACCENT_RGB}, 0.35)`, color: ACCENT }}>
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
