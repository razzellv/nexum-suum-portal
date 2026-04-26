"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FACILITY_INTELLIGENCE } from "@/app/lib/products";
import type { LibraryDocument } from "@/app/lib/products";

const FACILITY_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF";

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
const COMPLIANCE_DOCS = DOCS.filter((d) =>
  d.file.includes("/compliance-templates/")
);
const CALCULATOR_DOCS = DOCS.filter((d) => d.file.includes("/calculators/"));

function TypeBadge({ type }: { type: LibraryDocument["type"] }) {
  const colors: Record<string, string> = {
    pdf: "bg-red-900/40 text-red-400 border-red-700/50",
    docx: "bg-blue-900/40 text-blue-400 border-blue-700/50",
    xlsx: "bg-green-900/40 text-green-400 border-green-700/50",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono border uppercase ${
        colors[type] ?? ""
      }`}
    >
      {type}
    </span>
  );
}

function DocSection({
  title,
  docs,
}: {
  title: string;
  docs: LibraryDocument[];
}) {
  if (docs.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map((doc) => (
          <div
            key={doc.file}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#0a1628] border border-[#1a3a5c] hover:border-[#ffb800]/40 hover:shadow-[0_0_20px_rgba(255,184,0,0.1)] transition-all"
          >
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate mb-1">
                {doc.label}
              </p>
              <TypeBadge type={doc.type} />
            </div>
            <a
              href={`/library/${doc.file}`}
              download
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] text-xs font-medium hover:bg-[#ffb800]/20 transition-all"
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

export default function FacilityPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(FACILITY_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "facility", ...form }),
      });
    } catch {}
    showToast("Entry logged — Looker Studio will update shortly");
    setForm({ ...EMPTY_FORM, date: todayStr() });
    setSubmitting(false);
  }

  function addNote() {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      text: newNote.trim(),
      timestamp: Date.now(),
    };
    saveNotes([note, ...notes]);
    setNewNote("");
  }

  function deleteNote(id: string) {
    saveNotes(notes.filter((n) => n.id !== id));
  }

  const selectClass =
    "w-full px-4 py-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a5c] text-white focus:outline-none focus:border-[#ffb800]/60 focus:shadow-[0_0_10px_rgba(255,184,0,0.15)] transition-all text-sm appearance-none";

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a5c] text-white placeholder-gray-600 focus:outline-none focus:border-[#ffb800]/60 focus:shadow-[0_0_10px_rgba(255,184,0,0.15)] transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#020810] px-4 py-10 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/50 text-[#ffb800] text-sm font-medium shadow-[0_0_20px_rgba(255,184,0,0.3)]">
          ✓ {toast}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏭</span>
          <h1 className="text-3xl font-bold text-white">Facility Intelligence Portal</h1>
        </div>
        <p className="text-gray-400">
          Full-facility system intelligence — SOPs, compliance templates, and multi-system log entry.
        </p>
      </div>

      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[#0a1628] border border-[#1a3a5c] w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-[#ffb800]/20 text-[#ffb800] border border-[#ffb800]/40 shadow-[0_0_10px_rgba(255,184,0,0.2)]"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: "📋",
                title: "9 System SOPs",
                desc: "Boiler, chiller, pump, AHU, cooling tower, water treatment, electrical, air compressor, and feedwater SOPs in one place.",
              },
              {
                icon: "✅",
                title: "Compliance Ready",
                desc: "Compliance handbook and reference guide covering regulatory requirements for boilers, chillers, and facility systems.",
              },
              {
                icon: "📊",
                title: "Facility Dashboard",
                desc: "Live Looker Studio analytics pulling from your multi-system log entries for facility-wide performance tracking.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-5 rounded-xl bg-[#0a1628] border border-[#1a3a5c] hover:border-[#ffb800]/40 hover:shadow-[0_0_20px_rgba(255,184,0,0.15)] transition-all"
              >
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">
            Facility Performance Dashboard
          </h2>
          <div className="rounded-xl overflow-hidden border border-[#1a3a5c] mb-3">
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
          <p className="text-xs text-gray-500">
            Data updates when entries are submitted in the Log Data tab.
          </p>
        </div>
      )}

      {tab === "log-data" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Log Facility Data</h2>
          <p className="text-sm text-gray-400 mb-6">
            Submit a system observation to your Google Sheet. Data feeds directly into the Looker Studio dashboard.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Facility Name</label>
              <input
                type="text"
                name="facilityName"
                value={form.facilityName}
                onChange={handleFormChange}
                placeholder="e.g. North Campus Building A"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">System / Equipment</label>
              <input
                type="text"
                name="systemEquipment"
                value={form.systemEquipment}
                onChange={handleFormChange}
                placeholder="e.g. Chiller 2, AHU-03"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">System Type</label>
              <select
                name="systemType"
                value={form.systemType}
                onChange={handleFormChange}
                className={selectClass}
              >
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
              <label className="block text-sm text-gray-400 mb-1">Observation / Reading</label>
              <input
                type="text"
                name="observationReading"
                value={form.observationReading}
                onChange={handleFormChange}
                placeholder="e.g. Supply temp 48°F, 320 GPM, 95 kW"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Operating Status</label>
              <select
                name="operatingStatus"
                value={form.operatingStatus}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select status…</option>
                <option>Normal</option>
                <option>Warning</option>
                <option>Critical</option>
                <option>Offline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Corrective Action Taken</label>
              <input
                type="text"
                name="correctiveAction"
                value={form.correctiveAction}
                onChange={handleFormChange}
                placeholder="e.g. Adjusted set point, replaced filter"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Follow-Up Required</label>
              <select
                name="followUpRequired"
                value={form.followUpRequired}
                onChange={handleFormChange}
                className={selectClass}
              >
                <option value="">Select…</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Compliance Notes</label>
              <textarea
                name="complianceNotes"
                value={form.complianceNotes}
                onChange={handleFormChange}
                rows={3}
                placeholder="Any regulatory or compliance observations..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Technician Name</label>
              <input
                type="text"
                name="techName"
                value={form.techName}
                onChange={handleFormChange}
                placeholder="Full name"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/40 text-[#ffb800] font-semibold hover:bg-[#ffb800]/20 hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Log Entry"}
            </button>
          </form>
        </div>
      )}

      {tab === "resources" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-6">
            Facility Resource Library
          </h2>
          <DocSection title="SOPs" docs={SOP_DOCS} />
          <DocSection title="Compliance Templates" docs={COMPLIANCE_DOCS} />
          <DocSection title="Calculators / Dashboards" docs={CALCULATOR_DOCS} />
        </div>
      )}

      {tab === "notes" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Facility Notes</h2>
          <p className="text-sm text-gray-400 mb-6">
            Private notes stored in your browser. For team-wide notes, upgrade to the FI Platform.
          </p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a note about facility systems, issues, or follow-ups..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1a3a5c] text-white placeholder-gray-600 focus:outline-none focus:border-[#ffb800]/60 focus:shadow-[0_0_10px_rgba(255,184,0,0.15)] transition-all text-sm resize-none mb-3"
            />
            <button
              onClick={addNote}
              className="px-5 py-2.5 rounded-xl bg-[#ffb800]/10 border border-[#ffb800]/40 text-[#ffb800] font-semibold hover:bg-[#ffb800]/20 hover:shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all text-sm"
            >
              Save Note
            </button>
          </div>

          <div className="space-y-3 max-w-2xl mb-10">
            {notes.length === 0 && (
              <p className="text-gray-600 text-sm">No notes yet. Add one above.</p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-[#0a1628] border border-[#1a3a5c]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">
                      {formatTimestamp(note.timestamp)}
                    </p>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="shrink-0 text-gray-600 hover:text-red-400 transition-colors text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl p-5 rounded-xl bg-[#0a1628] border border-[#ffb800]/20">
            <p className="text-sm text-gray-400 mb-3">
              Upgrade to FI Platform for team-wide notes, API sync, and advanced diagnostics.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffb800]/10 border border-[#ffb800]/40 text-[#ffb800] text-sm font-semibold hover:bg-[#ffb800]/20 transition-all"
            >
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
