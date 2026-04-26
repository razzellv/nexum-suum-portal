"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CHILLER_INTELLIGENCE } from "@/app/lib/products";
import type { LibraryDocument } from "@/app/lib/products";

const CHILLER_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwPaDRoieGEY-6WOrVzUX1JsQlHqIIV2SExc4binnXaqtdvzd4sv5XSw4KIOLkLIkcH/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/29067deb-fc12-4d99-a2a3-47291d3b2019/page/4Z2aF";

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

const DOCS = CHILLER_INTELLIGENCE.documents;
const GUIDE_DOCS = DOCS.filter((d) => d.file.includes("/guide/"));
const LOG_DOCS = DOCS.filter((d) => d.file.includes("/logs/"));

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
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#0a1628] border border-[#1a3a5c] hover:border-[#00d4ff]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all"
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
              className="shrink-0 px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-medium hover:bg-[#00d4ff]/20 transition-all"
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
  chillerName: "",
  chilledWaterSupply: "",
  chilledWaterReturn: "",
  condenserWaterEntering: "",
  condenserWaterLeaving: "",
  refrigerantSuction: "",
  refrigerantDischarge: "",
  operatingKw: "",
  hzSpeed: "",
  gpm: "",
  notes: "",
  techName: "",
};

export default function ChillerPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM, date: todayStr() });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("chiller_notes");
        if (stored) setNotes(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function saveNotes(updated: Note[]) {
    setNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("chiller_notes", JSON.stringify(updated));
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(CHILLER_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "chiller", ...form }),
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

  const logFields = [
    { label: "Date", name: "date", type: "date" },
    { label: "Equipment ID", name: "equipmentId", type: "text", placeholder: "e.g. CHLLR-001" },
    { label: "Chiller Name / Location", name: "chillerName", type: "text", placeholder: "e.g. Chiller Plant A" },
    { label: "Chilled Water Supply Temp (°F)", name: "chilledWaterSupply", type: "text", placeholder: "e.g. 44" },
    { label: "Chilled Water Return Temp (°F)", name: "chilledWaterReturn", type: "text", placeholder: "e.g. 54" },
    { label: "Condenser Water Entering (°F)", name: "condenserWaterEntering", type: "text", placeholder: "e.g. 85" },
    { label: "Condenser Water Leaving (°F)", name: "condenserWaterLeaving", type: "text", placeholder: "e.g. 95" },
    { label: "Refrigerant Suction Temp (°F)", name: "refrigerantSuction", type: "text", placeholder: "e.g. 40" },
    { label: "Refrigerant Discharge Temp (°F)", name: "refrigerantDischarge", type: "text", placeholder: "e.g. 110" },
    { label: "Operating kW", name: "operatingKw", type: "text", placeholder: "e.g. 120" },
    { label: "Hz / Speed (%)", name: "hzSpeed", type: "text", placeholder: "e.g. 60 Hz / 80%" },
    { label: "GPM (Flow)", name: "gpm", type: "text", placeholder: "e.g. 450" },
    { label: "Technician Name", name: "techName", type: "text", placeholder: "Full name" },
  ];

  return (
    <div className="min-h-screen bg-[#020810] px-4 py-10 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/50 text-[#00d4ff] text-sm font-medium shadow-[0_0_20px_rgba(0,212,255,0.3)]">
          ✓ {toast}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">❄️</span>
          <h1 className="text-3xl font-bold text-white">Chiller Intelligence Portal</h1>
        </div>
        <p className="text-gray-400">
          Real-time chiller monitoring, log entry, optimization guides, and checklists.
        </p>
      </div>

      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[#0a1628] border border-[#1a3a5c] w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
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
                icon: "📊",
                title: "Live Analytics",
                desc: "Track chilled water temps, condenser performance, and refrigerant data in real time via Looker Studio.",
              },
              {
                icon: "📋",
                title: "Digital Log Forms",
                desc: "Log chilled water supply/return, condenser temps, refrigerant readings, kW, and GPM from any device.",
              },
              {
                icon: "📚",
                title: "Optimization Library",
                desc: "Access cooling tower guides, chilled water pump guides, checklists, and refrigerant references on demand.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-5 rounded-xl bg-[#0a1628] border border-[#1a3a5c] hover:border-[#00d4ff]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-all"
              >
                <div className="text-2xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-white mb-4">
            Chiller Performance Dashboard
          </h2>
          <div className="rounded-xl overflow-hidden border border-[#1a3a5c] mb-3">
            <iframe
              src={LOOKER_URL}
              width="100%"
              height="600"
              className="block"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Chiller Looker Studio Dashboard"
            />
          </div>
          <p className="text-xs text-gray-500">
            Data updates when entries are submitted in the Log Data tab.
          </p>
        </div>
      )}

      {tab === "log-data" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Log Chiller Data</h2>
          <p className="text-sm text-gray-400 mb-6">
            Submit a reading to your Google Sheet. Data feeds directly into the Looker Studio dashboard.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            {logFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm text-gray-400 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleFormChange}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a5c] text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.15)] transition-all text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                rows={3}
                placeholder="Observations, anomalies, maintenance notes..."
                className="w-full px-4 py-2.5 rounded-lg bg-[#0a1628] border border-[#1a3a5c] text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.15)] transition-all text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff] font-semibold hover:bg-[#00d4ff]/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit Log Entry"}
            </button>
          </form>
        </div>
      )}

      {tab === "resources" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-6">
            Chiller Resource Library
          </h2>
          <DocSection title="Guide" docs={GUIDE_DOCS} />
          <DocSection title="Logs & Checklists" docs={LOG_DOCS} />
        </div>
      )}

      {tab === "notes" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Chiller Notes</h2>
          <p className="text-sm text-gray-400 mb-6">
            Private notes stored in your browser. For team-wide notes, upgrade to the FI Platform.
          </p>
          <div className="mb-6 max-w-2xl">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              placeholder="Add a note about this chiller system..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1a3a5c] text-white placeholder-gray-600 focus:outline-none focus:border-[#00d4ff]/60 focus:shadow-[0_0_10px_rgba(0,212,255,0.15)] transition-all text-sm resize-none mb-3"
            />
            <button
              onClick={addNote}
              className="px-5 py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff] font-semibold hover:bg-[#00d4ff]/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all text-sm"
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

          <div className="max-w-2xl p-5 rounded-xl bg-[#0a1628] border border-[#00d4ff]/20">
            <p className="text-sm text-gray-400 mb-3">
              Upgrade to FI Platform for team-wide notes, API sync, and advanced diagnostics.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff] text-sm font-semibold hover:bg-[#00d4ff]/20 transition-all"
            >
              Upgrade to FI Platform →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
