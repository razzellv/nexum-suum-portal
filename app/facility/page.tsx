"use client";

import { useState, useEffect } from "react";
import { Building2, ClipboardList, ShieldCheck, BarChart3, BookOpen } from "lucide-react";
import { FACILITY_INTELLIGENCE } from "@/app/lib/products";
import {
  PageHeader, TabBar, StatCard, SectionHeader,
  Card, CardContent, DocCard, UpgradeBanner, inputCls,
} from "@/components/ui";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF";

const ACCENT     = "#fbbf24";
const ACCENT_RGB = "251, 191, 36";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note { id: string; text: string; timestamp: number }

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"  },
  { id: "log-data",  label: "Log Data"  },
  { id: "resources", label: "Resources" },
  { id: "notes",     label: "Notes"     },
];

const DOCS       = FACILITY_INTELLIGENCE.documents;
const SOP_DOCS   = DOCS.filter((d) => d.file.includes("/sops/"));
const COMP_DOCS  = DOCS.filter((d) => d.file.includes("/compliance-templates/"));
const CALC_DOCS  = DOCS.filter((d) => d.file.includes("/calculators/"));

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

const EMPTY = {
  date: "", facilityName: "", systemEquipment: "", systemType: "", observationReading: "",
  operatingStatus: "", correctiveAction: "", followUpRequired: "", complianceNotes: "", techName: "",
};

const inCls  = () => inputCls();
const selCls = `${inputCls()} appearance-none`;

export default function FacilityPage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [newNote, setNewNote]   = useState("");
  const [form, setForm]         = useState({ ...EMPTY, date: todayStr() });

  useEffect(() => {
    try { const s = localStorage.getItem("facility_notes"); if (s) setNotes(JSON.parse(s)); } catch {}
  }, []);

  function saveNotes(n: Note[]) {
    setNotes(n);
    try { localStorage.setItem("facility_notes", JSON.stringify(n)); } catch {}
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "facility", ...form }) });
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
        icon={Building2}
        title="Facility Intelligence"
        sub="9-system SOPs · Compliance · Multi-system logging"
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
            <StatCard label="System SOPs"       value="9"    sub="Boiler, chiller, pump, AHU & more" icon={ClipboardList} accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Compliance Docs"   value="8+"   sub="Templates & regulatory guides"      icon={ShieldCheck}  accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Calculators"       value="3"    sub="Energy & capacity tools"            icon={BarChart3}    accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Reference Guides"  value="2"    sub="Handbook + compliance guide"        icon={BookOpen}     accent={ACCENT} accentRgb={ACCENT_RGB} />
          </div>

          <SectionHeader title="Facility Performance Dashboard" sub="Submit readings in Log Data to update" accent={ACCENT} />
          <Card className="overflow-hidden mb-2" accent={ACCENT}>
            <iframe src={LOOKER_URL} width="100%" height="620" className="block"
              allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Facility Looker Studio Dashboard" />
          </Card>
          <p className="text-xs text-[hsl(200_15%_45%)] mb-6">Data updates within minutes of a log entry.</p>
        </div>
      )}

      {/* ── Log Data ── */}
      {tab === "log-data" && (
        <div className="max-w-2xl">
          <SectionHeader title="Log Facility Data" sub="Submit a system observation — feeds directly into Looker Studio." accent={ACCENT} />

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
                {[
                  { label: "Date", name: "date", el: "input", type: "date" },
                  { label: "Facility Name", name: "facilityName", el: "input", placeholder: "e.g. North Campus Building A" },
                  { label: "System / Equipment", name: "systemEquipment", el: "input", placeholder: "e.g. Chiller 2, AHU-03" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">{f.label}</label>
                    <input type={f.type ?? "text"} name={f.name}
                      value={form[f.name as keyof typeof form]} onChange={handleChange}
                      placeholder={"placeholder" in f ? f.placeholder : undefined}
                      className={inCls()} />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">System Type</label>
                  <select name="systemType" value={form.systemType} onChange={handleChange} className={selCls}>
                    <option value="">Select system type…</option>
                    {["Boiler","Chiller","AHU","Pump","Cooling Tower","Electrical","Other"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Observation / Reading</label>
                  <input type="text" name="observationReading" value={form.observationReading} onChange={handleChange}
                    placeholder="e.g. Supply temp 48°F, 320 GPM, 95 kW" className={inCls()} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Operating Status</label>
                  <select name="operatingStatus" value={form.operatingStatus} onChange={handleChange} className={selCls}>
                    <option value="">Select status…</option>
                    {["Normal","Warning","Critical","Offline"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Corrective Action Taken</label>
                  <input type="text" name="correctiveAction" value={form.correctiveAction} onChange={handleChange}
                    placeholder="e.g. Adjusted set point, replaced filter" className={inCls()} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Follow-Up Required</label>
                  <select name="followUpRequired" value={form.followUpRequired} onChange={handleChange} className={selCls}>
                    <option value="">Select…</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Compliance Notes</label>
                  <textarea name="complianceNotes" value={form.complianceNotes} onChange={handleChange} rows={3}
                    placeholder="Any regulatory or compliance observations..."
                    className={`${inCls()} resize-none`} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Technician Name</label>
                  <input type="text" name="techName" value={form.techName} onChange={handleChange}
                    placeholder="Full name" className={inCls()} />
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
          <SectionHeader title="Facility Resource Library" sub="SOPs, compliance templates, and calculators" accent={ACCENT} />
          {[["SOPs", SOP_DOCS], ["Compliance Templates", COMP_DOCS], ["Calculators & Dashboards", CALC_DOCS]].map(([title, docs]) =>
            (docs as typeof SOP_DOCS).length === 0 ? null : (
              <div key={title as string} className="mb-8">
                <p className="text-xs font-semibold text-[hsl(200_15%_50%)] uppercase tracking-widest mb-3">{title as string}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(docs as typeof SOP_DOCS).map((doc) => (
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
          <SectionHeader title="Facility Notes" sub="Private notes stored in your browser" accent={ACCENT} />
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4}
                placeholder="Add a note about facility systems, issues, or follow-ups..."
                className={`${inCls()} resize-none`} />
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
