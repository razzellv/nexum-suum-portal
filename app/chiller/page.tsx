"use client";

import { useState, useEffect } from "react";
import { Snowflake, Thermometer, Zap, Droplets, BarChart3 } from "lucide-react";
import { CHILLER_INTELLIGENCE } from "@/app/lib/products";
import {
  PageHeader, TabBar, StatCard, SectionHeader,
  Card, CardContent, DocCard, UpgradeBanner, inputCls,
} from "@/components/ui";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/29067deb-fc12-4d99-a2a3-47291d3b2019/page/4Z2aF";

const ACCENT     = "#38bdf8";
const ACCENT_RGB = "56, 189, 248";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note { id: string; text: string; timestamp: number }

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "log-data",  label: "Log Data"  },
  { id: "resources", label: "Resources" },
  { id: "notes",     label: "Notes"     },
];

const DOCS  = CHILLER_INTELLIGENCE.documents;
const GUIDE = DOCS.filter((d) => d.file.includes("/guide/"));
const LOGS  = DOCS.filter((d) => d.file.includes("/logs/"));
const EXTRA = DOCS.filter((d) => !d.file.includes("/guide/") && !d.file.includes("/logs/"));

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

const EMPTY = {
  date: "", equipmentId: "", chillerName: "", chilledWaterSupply: "", chilledWaterReturn: "",
  condenserWaterEntering: "", condenserWaterLeaving: "", refrigerantSuction: "",
  refrigerantDischarge: "", operatingKw: "", hzSpeed: "", gpm: "", notes: "", techName: "",
};

const LOG_FIELDS = [
  { label: "Date",                            name: "date",                   type: "date"                              },
  { label: "Equipment ID",                    name: "equipmentId",            type: "text", placeholder: "e.g. CHLLR-001"    },
  { label: "Chiller Name / Location",         name: "chillerName",            type: "text", placeholder: "e.g. Chiller Plant A" },
  { label: "CHW Supply Temp (°F)",            name: "chilledWaterSupply",     type: "text", placeholder: "e.g. 44"             },
  { label: "CHW Return Temp (°F)",            name: "chilledWaterReturn",     type: "text", placeholder: "e.g. 54"             },
  { label: "CW Entering Temp (°F)",           name: "condenserWaterEntering", type: "text", placeholder: "e.g. 85"             },
  { label: "CW Leaving Temp (°F)",            name: "condenserWaterLeaving",  type: "text", placeholder: "e.g. 95"             },
  { label: "Refrigerant Suction Temp (°F)",   name: "refrigerantSuction",     type: "text", placeholder: "e.g. 40"             },
  { label: "Refrigerant Discharge Temp (°F)", name: "refrigerantDischarge",   type: "text", placeholder: "e.g. 110"            },
  { label: "Operating kW",                    name: "operatingKw",            type: "text", placeholder: "e.g. 120"            },
  { label: "Hz / Speed (%)",                  name: "hzSpeed",                type: "text", placeholder: "e.g. 60 Hz / 80%"   },
  { label: "GPM (Flow)",                      name: "gpm",                    type: "text", placeholder: "e.g. 450"            },
  { label: "Technician Name",                 name: "techName",               type: "text", placeholder: "Full name"           },
];

export default function ChillerPage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [newNote, setNewNote]   = useState("");
  const [form, setForm]         = useState({ ...EMPTY, date: todayStr() });

  useEffect(() => {
    try { const s = localStorage.getItem("chiller_notes"); if (s) setNotes(JSON.parse(s)); } catch {}
  }, []);

  function saveNotes(n: Note[]) {
    setNotes(n);
    try { localStorage.setItem("chiller_notes", JSON.stringify(n)); } catch {}
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "chiller", ...form }) });
    } catch {}
    setSubmitted(true);
    setForm({ ...EMPTY, date: todayStr() });
    setSubmitting(false);
    setTimeout(() => setSubmitted(false), 6000);
  }

  function addNote() {
    if (!newNote.trim()) return;
    saveNotes([{ id: Date.now().toString(), text: newNote.trim(), timestamp: Date.now() }, ...notes]);
    setNewNote("");
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        icon={Snowflake}
        title="Chiller Intelligence"
        sub="Chilled water · Condenser · Refrigerant · Cooling tower"
        accent={ACCENT}
        accentRgb={ACCENT_RGB}
        badge="Active"
        badgeVariant="success"
      />

      <TabBar tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} accentRgb={ACCENT_RGB} />

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Documents"      value="14"     sub="Optimization guides & checklists" icon={BarChart3}  accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="CHW Supply"     value="44°F"   sub="Target supply temp"               icon={Thermometer} accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Operating kW"   value="120 kW" sub="Baseline efficiency target"       icon={Zap}        accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Flow Rate"      value="450 GPM" sub="Chilled water flow target"       icon={Droplets}   accent={ACCENT} accentRgb={ACCENT_RGB} />
          </div>

          <SectionHeader title="Chiller Performance Dashboard" sub="Submit readings in Log Data to update" accent={ACCENT} />
          <Card className="overflow-hidden mb-2" accent={ACCENT}>
            <iframe src={LOOKER_URL} width="100%" height="620" className="block"
              allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Chiller Looker Studio Dashboard" />
          </Card>
          <p className="text-xs text-[hsl(200_15%_45%)] mb-6">Data updates within minutes of a log entry.</p>
        </div>
      )}

      {/* ── Log Data ── */}
      {tab === "log-data" && (
        <div className="max-w-2xl">
          <SectionHeader title="Log Chiller Data" sub="Submit a reading to your Google Sheet — feeds directly into Looker Studio." accent={ACCENT} />

          {submitted && (
            <div className="mb-6 p-4 rounded-lg border flex items-center gap-3"
              style={{ background: `rgba(${ACCENT_RGB}, 0.08)`, borderColor: `rgba(${ACCENT_RGB}, 0.4)`, color: ACCENT }}>
              <span className="text-lg">✓</span>
              <span className="text-sm font-semibold">Entry logged — dashboard updates within minutes.</span>
            </div>
          )}

          <Card>
            <CardContent className="pt-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {LOG_FIELDS.map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">{f.label}</label>
                    <input type={f.type} name={f.name} value={form[f.name as keyof typeof form]}
                      onChange={handleChange} placeholder={"placeholder" in f ? f.placeholder : undefined}
                      className={inputCls()} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                    placeholder="Observations, anomalies, maintenance notes..."
                    className={`${inputCls()} resize-none`} />
                </div>
                <button type="submit" disabled={submitting}
                  className="font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 text-sm"
                  style={{ background: ACCENT, color: "#001923" }}>
                  {submitting ? "Submitting…" : "Submit Log Entry"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Resources ── */}
      {tab === "resources" && (
        <div>
          <SectionHeader title="Chiller Resource Library" sub="Guides, logs, and checklists" accent={ACCENT} />
          {[["Guide", GUIDE], ["Logs & Checklists", LOGS], ["Additional Resources", EXTRA]].map(([title, docs]) =>
            (docs as typeof GUIDE).length === 0 ? null : (
              <div key={title as string} className="mb-8">
                <p className="text-xs font-semibold text-[hsl(200_15%_50%)] uppercase tracking-widest mb-3">{title as string}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(docs as typeof GUIDE).map((doc) => (
                    <DocCard key={doc.file} label={doc.label} file={doc.file} type={doc.type} accent={ACCENT} accentRgb={ACCENT_RGB} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ── Notes ── */}
      {tab === "notes" && (
        <div className="max-w-2xl">
          <SectionHeader title="Chiller Notes" sub="Private notes stored in your browser" accent={ACCENT} />
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4}
                placeholder="Add a note about this chiller system..."
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
