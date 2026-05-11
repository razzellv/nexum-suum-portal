"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Wrench, Activity,
  TrendingUp, ExternalLink, RefreshCw, Plus, ChevronDown, ChevronRight,
  Flame, Snowflake, Building2, Zap,
} from "lucide-react";
import { loadLogs, BoilerLog, ChillerLog, FacilityLog } from "../app/lib/logData";

// ── Types ────────────────────────────────────────────────────────────────────

type MaintType = "work-order" | "pm" | "repair" | "peak" | "inspection";
type Priority  = "critical" | "high" | "medium" | "low";
type MaintStatus = "open" | "in-progress" | "completed";
type Severity  = "critical" | "high" | "medium" | "low";
type FindingCategory = "work-order" | "pm" | "metric" | "peak" | "repair";

export interface MaintenanceEntry {
  id: string;
  timestamp: string;
  date: string;
  type: MaintType;
  system: string;
  equipmentId: string;
  description: string;
  priority: Priority;
  status: MaintStatus;
  tech: string;
}

interface Finding {
  id: string;
  category: FindingCategory;
  system: string;
  title: string;
  probability: number;
  likelyCause: string;
  recommendation: string;
  severity: Severity;
  dataPoints: number;
  lastSeen: string;
}

const MAINT_KEY = "fi_lite_maintenance";

function loadMaintenance(): MaintenanceEntry[] {
  try { return JSON.parse(localStorage.getItem(MAINT_KEY) || "[]"); } catch { return []; }
}
function saveMaintenance(entries: MaintenanceEntry[]) {
  localStorage.setItem(MAINT_KEY, JSON.stringify(entries.slice(0, 200)));
}

// ── Rule Engine ──────────────────────────────────────────────────────────────

function runDiagnostics(
  boiler: BoilerLog[],
  chiller: ChillerLog[],
  facility: FacilityLog[],
  maint: MaintenanceEntry[],
): Finding[] {
  const findings: Finding[] = [];
  const now = new Date();
  const cutoff7  = new Date(now.getTime() - 7  * 86_400_000);
  const cutoff30 = new Date(now.getTime() - 30 * 86_400_000);
  const daysSince = (d: string) => Math.floor((now.getTime() - new Date(d).getTime()) / 86_400_000);

  // ── BOILER ─────────────────────────────────────────────────────────────────
  const blrRecent = boiler.filter(l => new Date(l.date) >= cutoff7);

  const highStack = blrRecent.filter(l => parseFloat(l.stackTemp) > 450);
  if (highStack.length) findings.push({
    id: "blr-stack-high", category: "metric", system: "Boiler",
    title: "High Stack Temperature",
    probability: Math.min(96, 52 + highStack.length * 14),
    likelyCause: "Excess combustion air, fouled heat exchanger surfaces, or burner misalignment reducing heat transfer",
    recommendation: "Run combustion analysis — verify O₂%, check for scale or soot on heat exchanger, inspect burner nozzle",
    severity: highStack.some(l => parseFloat(l.stackTemp) > 550) ? "critical" : "high",
    dataPoints: highStack.length, lastSeen: highStack[0].date,
  });

  const highPressure = blrRecent.filter(l => parseFloat(l.operatingPressure) > 150);
  if (highPressure.length) findings.push({
    id: "blr-pressure-high", category: "repair", system: "Boiler",
    title: "Elevated Operating Pressure",
    probability: Math.min(90, 60 + highPressure.length * 10),
    likelyCause: "Pressure control drift, PRV not seating properly, or scale reducing effective volume",
    recommendation: "Test PRV operation, verify pressure control setpoints, inspect for scale buildup",
    severity: "high", dataPoints: highPressure.length, lastSeen: highPressure[0].date,
  });

  // boiler supply–return delta
  const bigDelta = blrRecent.filter(l => {
    const d = parseFloat(l.supplyTemp) - parseFloat(l.returnTemp);
    return d > 40 && parseFloat(l.supplyTemp) > 0;
  });
  if (bigDelta.length) findings.push({
    id: "blr-delta-high", category: "metric", system: "Boiler",
    title: "High Supply / Return ΔT",
    probability: Math.min(80, 45 + bigDelta.length * 12),
    likelyCause: "Low system flow, partially closed zone valves, or undersized distribution piping",
    recommendation: "Check circulator pump operation, verify zone valve positions, review flow balance",
    severity: "medium", dataPoints: bigDelta.length, lastSeen: bigDelta[0].date,
  });

  if (boiler.length > 0) {
    const ds = daysSince(boiler[0].date);
    if (ds > 30) findings.push({
      id: "blr-pm-overdue", category: "pm", system: "Boiler",
      title: "Boiler PM Interval Exceeded",
      probability: Math.min(85, 40 + ds),
      likelyCause: `No boiler readings in ${ds} days — combustion efficiency may have degraded`,
      recommendation: "Schedule combustion analysis, clean burner, test low-water cutoff and safety controls",
      severity: "medium", dataPoints: 1, lastSeen: boiler[0].date,
    });
  }

  // ── CHILLER ────────────────────────────────────────────────────────────────
  const chlRecent = chiller.filter(l => new Date(l.date) >= cutoff7);

  const highSupply = chlRecent.filter(l => parseFloat(l.supplyTemp) > 48);
  if (highSupply.length) findings.push({
    id: "chl-supply-high", category: "metric", system: "Chiller",
    title: "Elevated Chilled Water Supply Temp",
    probability: Math.min(92, 55 + highSupply.length * 12),
    likelyCause: "Refrigerant undercharge, fouled condenser tubes, high condenser water temp, or compressor wear",
    recommendation: "Check refrigerant charge and pressures, clean condenser, verify cooling tower operation",
    severity: "high", dataPoints: highSupply.length, lastSeen: highSupply[0].date,
  });

  const highAmps = chlRecent.filter(l => parseFloat(l.compressorAmps) > 100);
  if (highAmps.length) findings.push({
    id: "chl-amps-high", category: "repair", system: "Chiller",
    title: "High Compressor Amp Draw",
    probability: Math.min(88, 58 + highAmps.length * 10),
    likelyCause: "Non-condensables in refrigerant circuit, refrigerant overcharge, or motor insulation degradation",
    recommendation: "Purge non-condensables, verify refrigerant charge, log motor insulation resistance",
    severity: "high", dataPoints: highAmps.length, lastSeen: highAmps[0].date,
  });

  const highCondenser = chlRecent.filter(l => parseFloat(l.condenserTemp) > 95);
  if (highCondenser.length) findings.push({
    id: "chl-condenser-high", category: "metric", system: "Chiller",
    title: "High Condenser Temperature",
    probability: Math.min(82, 48 + highCondenser.length * 11),
    likelyCause: "Fouled condenser tubes, inadequate condenser water flow, or cooling tower performance degradation",
    recommendation: "Brush condenser tubes, check condenser water flow rate, inspect cooling tower fill and distribution",
    severity: "medium", dataPoints: highCondenser.length, lastSeen: highCondenser[0].date,
  });

  if (chiller.length > 0) {
    const ds = daysSince(chiller[0].date);
    if (ds > 30) findings.push({
      id: "chl-pm-overdue", category: "pm", system: "Chiller",
      title: "Chiller PM Interval Exceeded",
      probability: Math.min(82, 38 + ds),
      likelyCause: `No chiller readings in ${ds} days — refrigerant leaks or tube fouling may be developing undetected`,
      recommendation: "Schedule chiller PM — check refrigerant, clean tubes, test vibration, log bearing temps",
      severity: "medium", dataPoints: 1, lastSeen: chiller[0].date,
    });
  }

  // ── FACILITY LOGS ──────────────────────────────────────────────────────────
  const facRecent = facility.filter(l => new Date(l.date) >= cutoff7);

  // Active alerts by system
  const alerts = facRecent.filter(l => l.status === "Alert");
  const alertSystems = [...new Set(alerts.map(l => l.systemType))];
  alertSystems.forEach(sys => {
    const sa = alerts.filter(l => l.systemType === sys);
    findings.push({
      id: `fac-alert-${sys.replace(/\W/g, "-").toLowerCase()}`,
      category: "work-order", system: sys || "Facility",
      title: `Active Alert — ${sys || "Facility System"}`,
      probability: Math.min(97, 72 + sa.length * 8),
      likelyCause: "Equipment reading outside safe operating range — potential fault, component failure, or process deviation",
      recommendation: "Inspect equipment immediately, check safety controls, isolate if required, log corrective action",
      severity: "critical", dataPoints: sa.length, lastSeen: sa[0].date,
    });
  });

  // Recurring caution → PM signal
  const cautions = facRecent.filter(l => l.status === "Caution");
  const cautionSystems = [...new Set(cautions.map(l => l.systemType))];
  cautionSystems.forEach(sys => {
    const sc = cautions.filter(l => l.systemType === sys);
    if (sc.length >= 2) findings.push({
      id: `fac-caution-${sys.replace(/\W/g, "-").toLowerCase()}`,
      category: "pm", system: sys || "Facility",
      title: `Recurring Caution — ${sys}`,
      probability: Math.min(78, 38 + sc.length * 14),
      likelyCause: "Repeated caution readings indicate a developing fault or maintenance interval lapse",
      recommendation: "Schedule PM for this system — inspect filters, seals, belts, and control setpoints",
      severity: "medium", dataPoints: sc.length, lastSeen: sc[0].date,
    });
  });

  // Rising reading trend (peak detection)
  const numeric = facility.filter(l => !isNaN(parseFloat(l.readingValue)) && parseFloat(l.readingValue) > 0).slice(0, 12);
  if (numeric.length >= 6) {
    const vals = numeric.map(l => parseFloat(l.readingValue));
    const newAvg = vals.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const oldAvg = vals.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
    if (oldAvg > 0 && newAvg > oldAvg * 1.18) {
      const pct = Math.round(((newAvg - oldAvg) / oldAvg) * 100);
      findings.push({
        id: "fac-peak-trend", category: "peak",
        system: numeric[0].systemType || "Facility",
        title: `Rising Reading Trend (+${pct}%)`,
        probability: Math.min(76, 35 + pct),
        likelyCause: "Values trending upward — possible load increase, efficiency loss, or early-stage equipment fault",
        recommendation: "Cross-reference with occupancy/weather data, check load profile, monitor for continued increase",
        severity: "medium", dataPoints: numeric.length, lastSeen: numeric[0].date,
      });
    }
  }

  // ── MAINTENANCE LOG ────────────────────────────────────────────────────────
  const openWOs = maint.filter(l => l.type === "work-order" && l.status === "open");
  if (openWOs.length) findings.push({
    id: "maint-open-wo", category: "work-order", system: "Multi-System",
    title: `${openWOs.length} Open Work Order${openWOs.length > 1 ? "s" : ""}`,
    probability: 100,
    likelyCause: "Tracked work orders not yet resolved or assigned",
    recommendation: `Review and close or escalate: ${openWOs.map(w => w.equipmentId || w.system).slice(0, 3).join(", ")}`,
    severity: openWOs.length >= 3 ? "high" : "medium",
    dataPoints: openWOs.length, lastSeen: openWOs[0].date,
  });

  // Repeat repairs on same equipment (2+ in 30 days)
  const repairs = maint.filter(l => l.type === "repair" && new Date(l.date) >= cutoff30);
  const repairEq = [...new Set(repairs.map(l => l.equipmentId).filter(Boolean))];
  repairEq.forEach(eq => {
    const er = repairs.filter(l => l.equipmentId === eq);
    if (er.length >= 2) findings.push({
      id: `maint-repeat-${eq}`,
      category: "repair", system: er[0].system,
      title: `Recurring Repairs — ${eq}`,
      probability: Math.min(88, 55 + er.length * 11),
      likelyCause: "Multiple repairs on same unit within 30 days suggests root cause not addressed",
      recommendation: "Conduct root cause analysis, consider component replacement vs. continued repairs",
      severity: "high", dataPoints: er.length, lastSeen: er[0].date,
    });
  });

  // PM overdue from maintenance log
  const pmEntries = maint.filter(l => l.type === "pm").sort((a, b) => b.date.localeCompare(a.date));
  const lastPM = pmEntries[0];
  if (!lastPM || daysSince(lastPM.date) > 30) {
    const ds = lastPM ? daysSince(lastPM.date) : null;
    findings.push({
      id: "maint-pm-due", category: "pm", system: "All Systems",
      title: lastPM ? `PM Overdue — Last logged ${ds} days ago` : "No PMs Logged Yet",
      probability: lastPM ? Math.min(84, 40 + (ds ?? 0) * 1.5) : 68,
      likelyCause: lastPM
        ? `PM interval exceeded — equipment may be accumulating wear since last round`
        : "No preventive maintenance activities have been recorded in this portal",
      recommendation: "Schedule PM rounds: boiler combustion, chiller tube cleaning, AHU filters, pump alignment",
      severity: "medium", dataPoints: pmEntries.length, lastSeen: lastPM?.date ?? "—",
    });
  }

  // Sort: critical → high → medium → low, then by probability desc
  const sev: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return findings.sort((a, b) => sev[a.severity] - sev[b.severity] || b.probability - a.probability);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEV_STYLES: Record<Severity, { border: string; badge: string; text: string; bar: string }> = {
  critical: { border: "#f87171", badge: "rgba(248,113,113,0.12)", text: "#f87171", bar: "#f87171" },
  high:     { border: "#fb923c", badge: "rgba(251,146,60,0.12)",  text: "#fb923c", bar: "#fb923c" },
  medium:   { border: "#fbbf24", badge: "rgba(251,191,36,0.12)",  text: "#fbbf24", bar: "#fbbf24" },
  low:      { border: "#34d399", badge: "rgba(52,211,153,0.12)",  text: "#34d399", bar: "#34d399" },
};

const CAT_LABELS: Record<FindingCategory, string> = {
  "work-order": "Work Order", pm: "PM", metric: "Metric", peak: "Peak", repair: "Repair",
};

const SYS_ICON: Record<string, React.ElementType> = {
  Boiler: Flame, Chiller: Snowflake, "Multi-System": Zap, "All Systems": Zap,
};

const EMPTY_MAINT: Omit<MaintenanceEntry, "id" | "timestamp"> = {
  date: "", type: "work-order", system: "", equipmentId: "", description: "",
  priority: "medium", status: "open", tech: "",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ProbabilityFeed({ userName }: { userName?: string }) {
  const [findings, setFindings]       = useState<Finding[]>([]);
  const [maint, setMaint]             = useState<MaintenanceEntry[]>([]);
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ ...EMPTY_MAINT, date: new Date().toISOString().slice(0, 10), tech: userName ?? "" });
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    const b = loadLogs<BoilerLog>("boiler");
    const c = loadLogs<ChillerLog>("chiller");
    const f = loadLogs<FacilityLog>("facility");
    const m = loadMaintenance();
    setMaint(m);
    setFindings(runDiagnostics(b, c, f, m));
    setRefreshedAt(new Date());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const submitMaint = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MaintenanceEntry = {
      ...form, id: Date.now().toString(), timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...maint];
    saveMaintenance(updated);
    setMaint(updated);
    setForm({ ...EMPTY_MAINT, date: new Date().toISOString().slice(0, 10), tech: userName ?? "" });
    setShowForm(false);
    refresh();
  };

  const setF = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const noData = findings.length === 0;

  return (
    <div className="max-w-4xl space-y-5">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-0.5">AI-Driven Probability Feed</p>
          <p className="text-white font-semibold text-sm">Daily Diagnostics & Suggestions</p>
          {refreshedAt && (
            <p className="text-[10px] text-gray-700 mt-0.5">
              Last analyzed: {refreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
            <Plus size={12} /> Log Activity
          </button>
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(148,163,184,0.6)" }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Log activity form */}
      {showForm && (
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(251,191,36,0.12)" }}>
          <p className="text-sm font-semibold text-white mb-4">Log Maintenance Activity</p>
          <form onSubmit={submitMaint} className="grid grid-cols-2 gap-3">
            {([
              ["date", "Date", "date"],
              ["equipmentId", "Equipment ID", "text", "e.g. BLR-001"],
            ] as [keyof typeof form, string, string, string?][]).map(([k, label, type, ph]) => (
              <div key={k}>
                <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                <input type={type} placeholder={ph} value={form[k]} onChange={e => setF(k, e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
            ))}
            {([
              ["type", "Type", ["work-order","pm","repair","peak","inspection"]],
              ["system", "System", ["Boiler","Chiller","HVAC/AHU","Cooling Tower","Pump","Electrical","Air Compressor","Water Treatment","Feedwater/DA","General"]],
              ["priority", "Priority", ["critical","high","medium","low"]],
              ["status", "Status", ["open","in-progress","completed"]],
            ] as [keyof typeof form, string, string[]][]).map(([k, label, opts]) => (
              <div key={k}>
                <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                <select value={form[k]} onChange={e => setF(k, e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 outline-none transition-all appearance-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {opts.map(o => <option key={o} value={o}>{o.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Tech</label>
              <input type="text" placeholder={userName ?? "Tech name"} value={form.tech} onChange={e => setF("tech", e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Description</label>
              <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={2}
                placeholder="What was observed, done, or scheduled…"
                className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all resize-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-400 transition-colors">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                Save & Re-analyze →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Findings */}
      {noData ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: "#34d399" }} />
          <p className="text-white font-semibold mb-1">No issues detected</p>
          <p className="text-gray-600 text-sm">Submit equipment readings and log maintenance activities to start generating diagnostics.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map(f => {
            const s = SEV_STYLES[f.severity];
            const Icon = SYS_ICON[f.system] ?? Building2;
            const open = expanded.has(f.id);
            return (
              <div key={f.id} className="rounded-xl overflow-hidden transition-all"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${s.border}` }}>

                {/* Top row — always visible */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => toggleExpand(f.id)}>
                  <Icon size={14} className="shrink-0" style={{ color: s.text }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <p className="font-semibold text-sm text-white truncate">{f.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                        style={{ background: s.badge, color: s.text }}>
                        {f.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full text-gray-600"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        {CAT_LABELS[f.category]}
                      </span>
                      <span className="text-[10px] text-gray-700">{f.system}</span>
                    </div>

                    {/* Probability bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1 rounded-full transition-all"
                          style={{ width: `${f.probability}%`, background: s.bar }} />
                      </div>
                      <span className="text-[11px] font-bold shrink-0" style={{ color: s.text }}>
                        {f.probability}%
                      </span>
                      <span className="text-[10px] text-gray-700 shrink-0">
                        {f.dataPoints} data pt{f.dataPoints !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {open ? <ChevronDown size={13} className="text-gray-600 shrink-0" /> : <ChevronRight size={13} className="text-gray-600 shrink-0" />}
                </div>

                {/* Expanded detail */}
                {open && (
                  <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <AlertTriangle size={10} /> Likely Cause
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">{f.likelyCause}</p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                          <Wrench size={10} /> Recommendation
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">{f.recommendation}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-[10px] text-gray-700">
                        <span className="flex items-center gap-1"><Clock size={9} /> Last seen: {f.lastSeen || "—"}</span>
                        <span className="flex items-center gap-1"><Activity size={9} /> {f.dataPoints} reading{f.dataPoints !== 1 ? "s" : ""}</span>
                      </div>
                      <a href="https://nexumsuum-facilityintelligence.com" target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                        style={{ background: "rgba(0,255,225,0.06)", border: "1px solid rgba(0,255,225,0.18)", color: "#00FFE1" }}>
                        <TrendingUp size={10} /> Diagnose in VVFI
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary + VVFI CTA */}
      {findings.length > 0 && (
        <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: "rgba(0,255,225,0.02)", border: "1px solid rgba(0,255,225,0.08)", borderLeft: "3px solid rgba(0,255,225,0.4)" }}>
          <div>
            <p className="text-sm font-semibold text-white">
              {findings.filter(f => f.severity === "critical").length} critical ·{" "}
              {findings.filter(f => f.severity === "high").length} high ·{" "}
              {findings.filter(f => f.severity === "medium").length} medium
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Submit more readings to sharpen probability scores.
              Full root-cause workflows available in VVFI.
            </p>
          </div>
          <a href="https://nexumsuum-facilityintelligence.com" target="_blank" rel="noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.25)", color: "#00FFE1" }}>
            Open VVFI <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Maintenance log history */}
      {maint.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Maintenance Activity Log</p>
          </div>
          {maint.slice(0, 10).map((m, i) => {
            const priorityColor = m.priority === "critical" ? "#f87171" : m.priority === "high" ? "#fb923c" : m.priority === "medium" ? "#fbbf24" : "#34d399";
            const statusColor = m.status === "completed" ? "#34d399" : m.status === "in-progress" ? "#fbbf24" : "#fb923c";
            return (
              <div key={m.id} className="flex items-center justify-between px-5 py-3 text-xs"
                style={{ borderBottom: i < Math.min(9, maint.length - 1) ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-gray-700 shrink-0">{m.date}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.05)", color: priorityColor }}>
                    {m.priority}
                  </span>
                  <span className="text-gray-400 truncate">{m.type.replace("-", " ").toUpperCase()} — {m.system} {m.equipmentId && `· ${m.equipmentId}`}</span>
                </div>
                <span className="text-[10px] font-semibold shrink-0 ml-3" style={{ color: statusColor }}>
                  {m.status.replace("-", " ")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
