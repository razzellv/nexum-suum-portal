"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, ThumbsUp, Eye, BarChart3 } from "lucide-react";
import {
  PageHeader, TabBar, StatCard, SectionHeader,
  Card, CardContent, DocCard, UpgradeBanner, inputCls,
} from "@/components/ui";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxmbYPEuVIRL_pb2BJxcjnli5UYyUe0M2kI6NedHk9bBu3FuYhex1lAuDYv1psACGL9/exec";

const LOOKER_URL =
  "https://datastudio.google.com/embed/reporting/d8aa2097-4b2a-42c1-913c-d644f26f890b/page/WrJaF";

const ACCENT     = "#c084fc";
const ACCENT_RGB = "192, 132, 252";

type Tab = "overview" | "log-data" | "resources" | "notes";

interface Note { id: string; text: string; timestamp: number }

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview"   },
  { id: "log-data",  label: "Log Entry"  },
  { id: "resources", label: "Resources"  },
  { id: "notes",     label: "Notes"      },
];

const LOG_TYPES = [
  "Safety Concern", "Ethics Issue", "Policy Violation", "Positive Recognition",
  "Near Miss", "Environmental Concern", "Regulatory Compliance",
  "Team Behavior", "Vendor / Contractor Issue", "Other",
];
const DEPARTMENTS = [
  "Maintenance", "Operations", "Safety & Compliance", "Management", "Executive",
  "Human Resources", "Procurement", "Engineering", "Custodial", "Energy",
];
const STATUSES   = ["Open", "In Progress", "Resolved", "Escalated", "Closed"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const EMPTY = {
  date: "", reporter: "", department: "", logType: "", severity: "",
  equipmentSystem: "", description: "", actionTaken: "", status: "Open",
};

const VIRTUOUS_DOCS = [
  { label: "Virtuous Ethical Logger",    file: "facility/Organization Virtuous Ethical Logger.xlsx",                                             type: "xlsx" as const },
  { label: "Facility Client Dashboard",  file: "facility/NS-FAC-PRM-Facility_Client_Dashboard001.xlsx",                                          type: "xlsx" as const },
  { label: "Compliance Handbook",        file: "facility/compliance-templates/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx",               type: "docx" as const },
  { label: "Compliance Reference Guide", file: "facility/compliance-templates/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx",  type: "docx" as const },
];

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}
function todayStr() { return new Date().toISOString().split("T")[0]; }

const inCls  = () => inputCls();
const selCls = `${inputCls()} appearance-none`;

export default function VirtuousPage() {
  const [tab, setTab]           = useState<Tab>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [newNote, setNewNote]   = useState("");
  const [form, setForm]         = useState({ ...EMPTY, date: todayStr() });

  useEffect(() => {
    try { const s = localStorage.getItem("virtuous_notes"); if (s) setNotes(JSON.parse(s)); } catch {}
  }, []);

  function saveNotes(n: Note[]) {
    setNotes(n);
    try { localStorage.setItem("virtuous_notes", JSON.stringify(n)); } catch {}
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(SHEET_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: "virtuous", ...form }) });
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
        icon={Shield}
        title="Virtuous Ethics Logger"
        sub="Ethical accountability · Safety observations · Compliance tracking"
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
            <StatCard label="Log Types"      value="10"    sub="Safety, ethics, policy, recognition" icon={Eye}           accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Severity Tiers" value="4"     sub="Low · Medium · High · Critical"       icon={AlertTriangle}  accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Anonymous"      value="Yes"   sub="Submit without a name"                icon={Shield}         accent={ACCENT} accentRgb={ACCENT_RGB} />
            <StatCard label="Dashboard"      value="Live"  sub="Entries feed Looker Studio"           icon={BarChart3}      accent={ACCENT} accentRgb={ACCENT_RGB} />
          </div>

          <Card className="mb-8" accent={ACCENT}>
            <CardContent className="pt-5 flex gap-3 items-start">
              <ThumbsUp size={18} style={{ color: ACCENT }} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: ACCENT }}>What is the Virtuous Logger?</p>
                <p className="text-sm text-[hsl(200_15%_55%)] leading-relaxed">
                  A structured way to document safety concerns, ethical issues, policy observations, and positive
                  recognitions. Entries feed directly into your Google Sheet and Looker Studio dashboard, giving
                  management full visibility without barriers to reporting.
                </p>
              </div>
            </CardContent>
          </Card>

          <SectionHeader title="Ethics & Compliance Dashboard" sub="Submit an entry in Log Entry to update" accent={ACCENT} />
          <Card className="overflow-hidden mb-2" accent={ACCENT}>
            <iframe src={LOOKER_URL} width="100%" height="620" className="block"
              allow="fullscreen" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Virtuous Ethics Looker Studio Dashboard" />
          </Card>
          <p className="text-xs text-[hsl(200_15%_45%)] mb-6">Data updates within minutes of a log entry.</p>
        </div>
      )}

      {/* ── Log Entry ── */}
      {tab === "log-data" && (
        <div className="max-w-2xl">
          <SectionHeader title="New Ethics Log Entry" sub="Reporter name is optional — leave blank to submit anonymously." accent={ACCENT} />

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Date *</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required className={inCls()} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                      Reporter Name <span className="text-[hsl(200_15%_40%)] font-normal">(blank = anonymous)</span>
                    </label>
                    <input type="text" name="reporter" value={form.reporter} onChange={handleChange}
                      placeholder="Anonymous if blank" className={inCls()} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Department *</label>
                    <select name="department" value={form.department} onChange={handleChange} required className={selCls}>
                      <option value="">Select department…</option>
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Log Type *</label>
                    <select name="logType" value={form.logType} onChange={handleChange} required className={selCls}>
                      <option value="">Select type…</option>
                      {LOG_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Severity *</label>
                    <select name="severity" value={form.severity} onChange={handleChange} required className={selCls}>
                      <option value="">Select severity…</option>
                      {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={selCls}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                    Equipment / System <span className="text-[hsl(200_15%_40%)] font-normal">(optional)</span>
                  </label>
                  <input type="text" name="equipmentSystem" value={form.equipmentSystem} onChange={handleChange}
                    placeholder="e.g. Boiler BLR-001, AHU-3" className={inCls()} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                    placeholder="Describe the concern, observation, or recognition in detail…"
                    className={`${inCls()} resize-none`} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[hsl(200_15%_55%)] mb-1">
                    Action Taken <span className="text-[hsl(200_15%_40%)] font-normal">(optional)</span>
                  </label>
                  <textarea name="actionTaken" value={form.actionTaken} onChange={handleChange} rows={3}
                    placeholder="Corrective action, follow-up steps, or resolution taken…"
                    className={`${inCls()} resize-none`} />
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
          <SectionHeader title="Virtuous Resources" sub="Download your workbook and compliance reference guides" accent={ACCENT} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {VIRTUOUS_DOCS.map((doc) => (
              <DocCard key={doc.file} label={doc.label} file={doc.file} type={doc.type} accent={ACCENT} accentRgb={ACCENT_RGB} />
            ))}
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {tab === "notes" && (
        <div className="max-w-2xl">
          <SectionHeader title="Virtuous Notes" sub="Private notes stored in your browser" accent={ACCENT} />
          <Card className="mb-6">
            <CardContent className="pt-5 space-y-3">
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4}
                placeholder="Add a private note about ethics, compliance, or observations…"
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
