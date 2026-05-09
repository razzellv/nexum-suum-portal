"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../components/AuthContext";
import { submitLog, loadLogs, FacilityLog } from "../lib/logData";
import { PRODUCTS } from "../lib/products";
import BoilerCalculator from "../../components/BoilerCalculator";
import ChillerCalculator from "../../components/ChillerCalculator";

const ACCENT = "#fbbf24";
const ACCENT_RGB = "251,191,36";

const SYSTEMS = [
  { id: "FAC-BLR", name: "Boiler Systems",         docs: 9,  desc: "Combustion, safety, log sheets, SOPs",            tags: ["combustion", "safety"] },
  { id: "FAC-CHL", name: "Chiller Systems",         docs: 7,  desc: "Cooling tower, refrigerant, log sheets",           tags: ["refrigerant", "cooling"] },
  { id: "FAC-PMP", name: "Pump Systems",            docs: 3,  desc: "Circulator, condensate, feedwater pumps",          tags: ["hydronic"] },
  { id: "FAC-AHU", name: "AHU & Ventilation",       docs: 2,  desc: "Air handling, VAV, exhaust systems",               tags: ["ventilation"] },
  { id: "FAC-CTS", name: "Cooling Tower Systems",   docs: 4,  desc: "Water treatment, blowdown, inspection",            tags: ["water", "cooling"] },
  { id: "FAC-WTR", name: "Water Treatment",         docs: 2,  desc: "Chemistry, softener, biocide programs",            tags: ["chemistry"] },
  { id: "FAC-ELC", name: "Electrical & Controls",   docs: 2,  desc: "Panel inspection, safety lockout procedures",      tags: ["controls"] },
  { id: "FAC-AIR", name: "Air Compressor & Dryer",  docs: 2,  desc: "Compressor ops, dryer maintenance",                tags: ["compressed air"] },
  { id: "FAC-FW",  name: "Feedwater / DA / Tanks",  docs: 3,  desc: "DA, expansion tank, dump tank SOPs",               tags: ["feedwater"] },
];

const TABS = ["Overview", "Log Data", "Calculators", "Resources"] as const;
type Tab = typeof TABS[number];

const EMPTY: FacilityLog = {
  timestamp: "", date: "", systemType: "", equipmentId: "",
  location: "", readingValue: "", unit: "", status: "Normal",
  techName: "", notes: "",
};

export default function FacilityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const now = new Date();
  const [form, setForm] = useState<FacilityLog>({
    ...EMPTY,
    timestamp: now.toISOString().slice(0, 16),
    date: now.toISOString().slice(0, 10),
  });
  const [logs, setLogs] = useState<FacilityLog[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLogs(loadLogs<FacilityLog>("facility")); }, []);

  const canAccess = user && user.tier === "facility";

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-4 text-sm">Sign in to access Facility Intelligence.</p>
      <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl text-sm font-semibold"
        style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.25)`, color: ACCENT }}>
        ← Back to Overview
      </button>
    </div>
  );

  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-2 text-sm">Facility Intelligence requires the Facility tier.</p>
      <p className="text-gray-700 text-xs mb-4">Your tier: <span style={{ color: ACCENT }}>{user.tier}</span></p>
      <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
        className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: ACCENT, color: "#001923" }}>
        Upgrade to Facility Tier →
      </a>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitLog("facility", { ...form, techName: form.techName || user.name });
    const updated = loadLogs<FacilityLog>("facility");
    setLogs(updated);
    const n = new Date();
    setForm({ ...EMPTY, timestamp: n.toISOString().slice(0, 16), date: n.toISOString().slice(0, 10) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSubmitting(false);
  };

  const setF = (k: keyof FacilityLog, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const chartData = [...logs].reverse().slice(-20).map((l, i) => ({
    name: l.date || `#${i + 1}`,
    Reading: parseFloat(l.readingValue) || 0,
  }));

  const last = logs[0];
  const filtered = SYSTEMS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#030d14", minHeight: "100%" }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: `rgba(${ACCENT_RGB},0.06)` }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>🏢</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: ACCENT }}>Facility Intelligence</h1>
            <p className="text-gray-600 text-xs">9 Systems · SOPs · Calculators · Compliance</p>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "System",    val: last?.systemType   },
            { label: "Reading",   val: last?.readingValue ? `${last.readingValue} ${last.unit}` : undefined },
            { label: "Location",  val: last?.location     },
            { label: "Status",    val: last?.status       },
          ].map((t) => (
            <div key={t.label} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-1">{t.label}</p>
              <p className="text-xl font-bold truncate" style={{ color: ACCENT }}>{t.val || "—"}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{logs.length > 0 ? "last reading" : "no data yet"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-7 border-b" style={{ borderColor: `rgba(${ACCENT_RGB},0.06)` }}>
        <div className="flex gap-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={tab === t
                ? { color: ACCENT, borderColor: ACCENT }
                : { color: "rgba(148,163,184,0.45)", borderColor: "transparent" }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-7 py-6">

        {/* OVERVIEW */}
        {tab === "Overview" && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" width="14" height="14"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search systems…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-gray-400 placeholder-gray-700 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
              </div>
              <span className="text-xs text-gray-700">{filtered.length} systems</span>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              {filtered.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `rgba(${ACCENT_RGB},0.02)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-white">{s.name}</h3>
                      {s.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: `rgba(${ACCENT_RGB},0.08)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.15)` }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-700 font-mono">{s.id} · {s.docs} documents</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{s.desc}</p>
                  </div>
                  <button onClick={() => setTab("Resources")}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: `rgba(${ACCENT_RGB},0.07)`, border: `1px solid rgba(${ACCENT_RGB},0.2)`, color: ACCENT }}>
                    Docs →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LOG DATA */}
        {tab === "Log Data" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Form */}
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(${ACCENT_RGB},0.1)` }}>
              <h2 className="font-bold text-white mb-1 text-sm">Submit Facility Reading</h2>
              <p className="text-xs text-gray-600 mb-5">Logged locally and synced to Nexum Suum.</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setF("date", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">System Type</label>
                    <select value={form.systemType} onChange={(e) => setF("systemType", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <option value="">Select…</option>
                      {["Boiler","Chiller","HVAC/AHU","Cooling Tower","Pump","Electrical","Air Compressor","Water Treatment","Feedwater/DA","General"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Equipment ID</label>
                    <input type="text" placeholder="FAC-001" value={form.equipmentId} onChange={(e) => setF("equipmentId", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Location</label>
                    <input type="text" placeholder="Mechanical Room B" value={form.location} onChange={(e) => setF("location", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Reading Value</label>
                    <input type="text" placeholder="12500" value={form.readingValue} onChange={(e) => setF("readingValue", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Unit</label>
                    <input type="text" placeholder="kWh · PSI · °F · GPM" value={form.unit} onChange={(e) => setF("unit", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setF("status", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {["Normal","Caution","Alert","Offline","Maintenance"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Tech Name</label>
                    <input type="text" placeholder={user.name} value={form.techName} onChange={(e) => setF("techName", e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Notes</label>
                    <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={2}
                      placeholder="Observations, work orders, events…"
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: saved ? "rgba(52,211,153,0.1)" : `rgba(${ACCENT_RGB},0.1)`,
                    border: `1px solid ${saved ? "rgba(52,211,153,0.35)" : `rgba(${ACCENT_RGB},0.3)`}`,
                    color: saved ? "#34d399" : ACCENT,
                  }}>
                  {saved ? "✓ Saved" : submitting ? "Saving…" : "Submit Reading →"}
                </button>
              </form>
            </div>

            {/* Chart + History */}
            <div className="space-y-4">
              {chartData.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Reading History</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        contentStyle={{ background: "#0a1929", border: `1px solid rgba(${ACCENT_RGB},0.15)`, borderRadius: 8, color: "#e2e8f0", fontSize: 11 }}
                      />
                      <Bar dataKey="Reading" fill={`rgba(${ACCENT_RGB},0.7)`} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {logs.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Readings</p>
                  </div>
                  {logs.slice(0, 8).map((log, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 text-xs"
                      style={{ borderBottom: i < 7 && i < logs.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                      <span className="font-mono text-gray-700">{log.date || "—"}</span>
                      <div className="flex gap-3 text-gray-600">
                        {log.systemType && <span className="text-gray-500">{log.systemType}</span>}
                        {log.readingValue && (
                          <span><span style={{ color: ACCENT }}>{log.readingValue}</span> {log.unit}</span>
                        )}
                        {log.status && (
                          <span style={{
                            color: log.status === "Alert" ? "#f87171"
                              : log.status === "Caution" ? "#fbbf24"
                              : log.status === "Maintenance" ? "#fb923c"
                              : "#6b7280",
                          }}>{log.status}</span>
                        )}
                      </div>
                      <span className="text-gray-700">{log.techName}</span>
                    </div>
                  ))}
                </div>
              )}

              {logs.length === 0 && (
                <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <p className="text-gray-700 text-sm">No readings yet — submit your first log entry.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALCULATORS */}
        {tab === "Calculators" && (
          <div className="max-w-5xl">
            <p className="text-[11px] uppercase tracking-widest text-gray-600 mb-4">Efficiency Analysis Tools</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BoilerCalculator />
              <ChillerCalculator />
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {tab === "Resources" && (
          <div className="max-w-3xl">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              {PRODUCTS.facility_intelligence_advanced.documents.map((doc, i, arr) => (
                <a key={doc.file} href={`/library/${doc.file}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-all group"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${ACCENT_RGB},0.02)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        color: doc.type === "pdf" ? "#fb923c" : doc.type === "xlsx" ? "#34d399" : "#60a5fa",
                        background: "rgba(255,255,255,0.05)",
                      }}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{doc.label}</span>
                  </div>
                  <span className="text-xs text-gray-700 group-hover:transition-colors" style={{ color: undefined }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = ACCENT; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = ""; }}>↓</span>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
