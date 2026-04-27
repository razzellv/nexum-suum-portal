"use client";

import { useState, useEffect } from "react";
import { Flame, Thermometer, Gauge, ShieldCheck, BarChart3 } from "lucide-react";
import { BOILER_INTELLIGENCE } from "@/app/lib/products";
import {
  PageHeader, TabBar, StatCard, SectionHeader,
  Card, CardContent, DocCard, UpgradeBanner, inputCls,
} from "@/components/ui";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/4456f0c6-262f-4b8b-aba0-7eacd0be494e/page/H3TaF";

const ACCENT     = "#00FFE1";
const ACCENT_RGB = "0, 255, 225";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note { id: string; text: string; timestamp: number }

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "log-data",  label: "Log Data"  },
  { id: "resources", label: "Resources" },
  { id: "notes",     label: "Notes"     },
];

const DOCS      = BOILER_INTELLIGENCE.documents;
const GUIDE     = DOCS.filter((d) => d.file.includes("/guide/"));
const LOG_DOCS  = DOCS.filter((d) => d.file.includes("/logs/"));
const SAFETY    = DOCS.filter((d) => d.file.includes("/safety/"));
const OPS       = DOCS.filter(
  (d) => d.file.includes("/ops/") ||
    (!d.file.includes("/guide/") && !d.file.includes("/logs/") && !d.file.includes("/safety/") && d.file.includes("boiler/"))
);

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

const EMPTY = {
  date: "", equipmentId: "", boilerName: "", stackTemp: "", supplyTemp: "",
  returnTemp: "", fuelInput: "", operatingPressure: "", kwAmps: "", hzSpeed: "",
  notes: "", techName: "",
};

const LOG_FIELDS = [
  { label: "Date",                  name: "date",              type: "date"                                         },
  { label: "Equipment ID",          name: "equipmentId",       type: "text", placeholder: "e.g. BLR-001"           },
  { label: "Boiler Name / Location",name: "boilerName",        type: "text", placeholder: "e.g. Main Boiler Room"  },
  { label: "Stack Temperature (°F)",name: "stackTemp",         type: "text", placeholder: "e.g. 420"               },
  { label: "Supply Temp (°F)",      name: "supplyTemp",        type: "text", placeholder: "e.g. 180"               },
  { label: "Return Temp (°F)",      name: "returnTemp",        type: "text", placeholder: "e.g. 160"               },
  { label: "Fuel Input (CCF/BTU)",  name: "fuelInput",         type: "text", placeholder: "e.g. 85 CCF"            },
  { label: "Operating Pressure (PSI)", name: "operatingPressure", type: "text", placeholder: "e.g. 15"            },
  { label: "kW / Amps",             name: "kwAmps",            type: "text", placeholder: "e.g. 12 kW"             },
  { label: "Hz / Speed (%)",        name: "hzSpeed",           type: "text", placeholder: "e.g. 60 Hz / 75%"       },
  { label: "Technician Name",       name: "techName",          type: "text", placeholder: "Full name"              },
];

export default function BoilerPage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [newNote, setNewNote]   = useState("");
  const [form, setForm]         = useState({ ...EMPTY, date: todayStr() });

  useEffect(() => {
    try { const s = localStorage.getItem("boiler_notes"); if (s) setNotes(JSON.parse(s)); } catch {}
  }, []);

  function saveNotes(n: Note[]) {
    setNotes(n);
    try { localStorage.setItem("boiler_notes", JSON.stringify(n)); } catch {}
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "boiler", ...form }) });
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
        icon={Flame}
        title="Boiler Intelligence"
        sub="Stack analysis · Combustion · Pressure · Safety"
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
            <StatCard label="Documents"       value="47"      sub="Complete intelligence library" icon={BarChart3}   accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Safety Modules"  value="6"       sub="Protocols for every scenario"  icon={ShieldCheck} accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Stack Threshold" value="425°F"   sub="Optimal max stack temp"        icon={Thermometer} accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Pressure Range"  value="12–15 PSI" sub="Standard operating window"  icon={Gauge}       accent={ACCENT} accentRgb={ACCENT_RGB} />
          </div>

          <SectionHeader title="Boiler Performance Dashboard" sub="Submit readings in Log Data to update" accent={ACCENT} />
          <Card className="overflow-hidden mb-2" accent={ACCENT}>
            <iframe src={LOOKER_URL} width="100%" height="620" className="block"
              allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Boiler Looker Studio Dashboard" />
          </Card>
          <p className="text-xs text-[hsl(200_15%_45%)] mb-6">Data updates within minutes of a log entry.</p>
        </div>
      )}

      {/* ── Log Data ── */}
      {tab === "log-data" && (
        <div className="max-w-2xl">
          <SectionHeader title="Log Boiler Data" sub="Submit a reading to your Google Sheet — feeds directly into Looker Studio." accent={ACCENT} />

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
          <SectionHeader title="Boiler Resource Library" sub="Guides, logs, safety protocols, and operations documents" accent={ACCENT} />
          {[["Guide", GUIDE], ["Logs & Checklists", LOG_DOCS], ["Safety", SAFETY], ["Operations", OPS]].map(([title, docs]) =>
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
          <SectionHeader title="Boiler Notes" sub="Private notes stored in your browser" accent={ACCENT} />
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4}
                placeholder="Add a note about this boiler system..."
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
