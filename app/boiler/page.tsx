"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAuth } from "../../components/AuthContext";
import { submitLog, loadLogs, BoilerLog } from "../lib/logData";
import { PRODUCTS } from "../lib/products";

const MODULES = [
  { id: "BLR-001", name: "Combustion & Stack Analysis", tags: ["Guide", "active"], model: "NS-BLR-PRM-COMB",  location: "Boiler Room", docs: ["Combustion Guide", "Combustion Readout", "Process Overview", "Risk Control"],    file: "boiler/guide/NS-BLR-PRM-COMB.pdf" },
  { id: "BLR-002", name: "Log Sheets & Checklists",     tags: ["Logs", "active", "baselined"], model: "NS-BLR-PRM-LOG", location: "Boiler Room", docs: ["Log Sheet 1–5", "Checklist 2–4", "Weekly Log"], file: "boiler/logs/NS-BLR-PRM-LOG001.pdf" },
  { id: "BLR-003", name: "Safety Protocol Modules",     tags: ["Safety", "active"], model: "NS-BLR-PRM-SAFE", location: "Boiler Room", docs: ["Safety Module 1–6"],                                          file: "boiler/safety/NS-BLR-PRM-SAFE-001.pdf" },
  { id: "BLR-004", name: "Operational Procedures",      tags: ["Ops", "active"], model: "NS-BLR-PRM-OPS",    location: "Boiler Room", docs: ["Blowdown", "LWFCO", "Purge", "Flame Safeguard"],              file: "boiler/ops/NS-BLR-PRM-BLWDWN001.pdf" },
];

const TABS = ["Overview", "Log Data", "Resources"] as const;
type Tab = typeof TABS[number];

const EMPTY: BoilerLog = {
  timestamp: "", date: "", equipmentId: "BLR-001", boilerName: "",
  stackTemp: "", supplyTemp: "", returnTemp: "", fuelInput: "",
  operatingPressure: "", kwAmps: "", hzSpeed: "", techName: "", notes: "",
};

const ACCENT = "#00FFE1";
const ACCENT_RGB = "0,255,225";

export default function BoilerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const now = new Date();
  const [form, setForm] = useState<BoilerLog>({ ...EMPTY, timestamp: now.toISOString().slice(0, 16), date: now.toISOString().slice(0, 10) });
  const [logs, setLogs] = useState<BoilerLog[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLogs(loadLogs<BoilerLog>("boiler")); }, []);

  const canAccess = user && (user.tier === "boiler" || user.tier === "facility");

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-4 text-sm">Sign in to access Boiler Intelligence.</p>
      <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl text-sm font-semibold"
        style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.25)`, color: ACCENT }}>← Back to Overview</button>
    </div>
  );
  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-2 text-sm">Boiler Intelligence requires the Boiler or Facility tier.</p>
      <p className="text-gray-700 text-xs mb-4">Your tier: <span style={{ color: ACCENT }}>{user.tier}</span></p>
      <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
        className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: ACCENT, color: "#001923" }}>Upgrade Tier →</a>
    </div>
  );

  const filtered = MODULES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitLog("boiler", { ...form, techName: form.techName || user.name });
    const updated = loadLogs<BoilerLog>("boiler");
    setLogs(updated);
    const n = new Date();
    setForm({ ...EMPTY, timestamp: n.toISOString().slice(0, 16), date: n.toISOString().slice(0, 10) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSubmitting(false);
  };
  const setF = (k: keyof BoilerLog, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const chartData = [...logs].reverse().slice(-20).map((l, i) => ({
    name: l.date || `#${i + 1}`,
    "Stack Temp": parseFloat(l.stackTemp) || null,
    "Supply Temp": parseFloat(l.supplyTemp) || null,
    "Return Temp": parseFloat(l.returnTemp) || null,
  }));

  const last = logs[0];

  return (
    <div style={{ background: "#030d14", minHeight: "100%" }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: "rgba(0,255,225,0.06)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>🔥</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: ACCENT }}>Boiler Intelligence</h1>
            <p className="text-gray-600 text-xs">Combustion · Safety · Log Data · Analytics</p>
          </div>
        </div>
        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Stack Temp",  val: last?.stackTemp,         unit: "°F"  },
            { label: "Supply Temp", val: last?.supplyTemp,         unit: "°F"  },
            { label: "Pressure",    val: last?.operatingPressure,  unit: "PSI" },
            { label: "Fuel Input",  val: last?.fuelInput,          unit: ""    },
          ].map((t) => (
            <div key={t.label} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-1">{t.label}</p>
              <p className="text-2xl font-bold" style={{ color: ACCENT }}>{t.val || "—"}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{t.unit || (logs.length > 0 ? "last reading" : "no data yet")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-7 border-b" style={{ borderColor: "rgba(0,255,225,0.06)" }}>
        <div className="flex gap-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={tab === t ? { color: ACCENT, borderColor: ACCENT } : { color: "rgba(148,163,184,0.45)", borderColor: "transparent" }}>
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
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search modules…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl pl-9 pr-4 py-2 text-sm text-gray-400 placeholder-gray-700 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
              </div>
              <span className="text-xs text-gray-700">{filtered.length} modules</span>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              {filtered.map((m, i) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `rgba(${ACCENT_RGB},0.02)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-white">{m.name}</h3>
                      {m.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: t === "active" ? "rgba(52,211,153,0.1)" : t === "baselined" ? `rgba(${ACCENT_RGB},0.08)` : "rgba(255,255,255,0.05)",
                            color: t === "active" ? "#34d399" : t === "baselined" ? ACCENT : "#94a3b8",
                            border: `1px solid ${t === "active" ? "rgba(52,211,153,0.2)" : t === "baselined" ? `rgba(${ACCENT_RGB},0.15)` : "rgba(255,255,255,0.08)"}`,
                          }}>{t}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-700 font-mono">{m.id} · {m.location}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1">
                      {m.docs.map((d) => <span key={d} className="text-[10px] text-gray-700">▸ {d}</span>)}
                    </div>
                  </div>
                  <a href={`/library/${m.file}`} target="_blank" rel="noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: `rgba(${ACCENT_RGB},0.07)`, border: `1px solid rgba(${ACCENT_RGB},0.2)`, color: ACCENT }}>
                    Open →
                  </a>
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
              <h2 className="font-bold text-white mb-1 text-sm">Submit Boiler Reading</h2>
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
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Equipment ID</label>
                    <input type="text" value={form.equipmentId} onChange={(e) => setF("equipmentId", e.target.value)} placeholder="BLR-001"
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Boiler Name / Location</label>
                    <input type="text" value={form.boilerName} onChange={(e) => setF("boilerName", e.target.value)} placeholder="Main Boiler — Mech. Room B"
                      className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  {([
                    ["stackTemp", "Stack Temp (°F)", "420"],
                    ["supplyTemp", "Supply Temp (°F)", "180"],
                    ["returnTemp", "Return Temp (°F)", "160"],
                    ["fuelInput", "Fuel Input (MCF)", "2.4"],
                    ["operatingPressure", "Pressure (PSI)", "125"],
                    ["kwAmps", "kW / Amps", "48"],
                    ["hzSpeed", "Hz / Speed", "60"],
                    ["techName", "Tech Name", user.name],
                  ] as [keyof BoilerLog, string, string][]).map(([field, label, placeholder]) => (
                    <div key={field}>
                      <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                      <input type="text" placeholder={placeholder} value={form[field]} onChange={(e) => setF(field, e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-600 uppercase tracking-wide mb-1">Notes</label>
                    <textarea value={form.notes} onChange={(e) => setF("notes", e.target.value)} rows={2} placeholder="Observations…"
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
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Temperature Trend</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip contentStyle={{ background: "#0a1929", border: "1px solid rgba(0,255,225,0.15)", borderRadius: 8, color: "#e2e8f0", fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                      <Line type="monotone" dataKey="Stack Temp"  stroke="#00FFE1" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="Supply Temp" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="Return Temp" stroke="#fbbf24" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
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
                      <div className="flex gap-4 text-gray-600">
                        {log.stackTemp && <span><span style={{ color: ACCENT }}>{log.stackTemp}°F</span> stack</span>}
                        {log.operatingPressure && <span>{log.operatingPressure} PSI</span>}
                        {log.fuelInput && <span>{log.fuelInput} MCF</span>}
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

        {/* RESOURCES */}
        {tab === "Resources" && (
          <div className="max-w-3xl">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              {PRODUCTS.boiler_intelligence_looker.documents.map((doc, i, arr) => (
                <a key={doc.file} href={`/library/${doc.file}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-all group"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${ACCENT_RGB},0.02)`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === "pdf" ? "#fb923c" : doc.type === "xlsx" ? "#34d399" : "#60a5fa", background: "rgba(255,255,255,0.05)" }}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{doc.label}</span>
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-[#00FFE1] transition-colors">↓</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
