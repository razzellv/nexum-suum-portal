"use client";

import { useState, useEffect } from "react";
import { Droplets } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { apiPost, apiGet } from "../lib/api";

const NUM_SKIDS = 10;
const COMPONENT_NAMES = [
  "Inlet Valve", "Outlet Valve", "Bypass Valve", "Blowdown Valve",
  "Pressure Gauge", "Flow Meter", "Sample Port", "Chemical Feed Port",
];
const READING_STATUSES = ["Normal", "High", "Low", "Critical"] as const;
type ReadingStatus = typeof READING_STATUSES[number];

interface ComponentReading {
  name: string;
  value: string;
  unit: string;
  status: ReadingStatus;
}

interface SkidLog {
  id: string;
  skidId: string;
  date: string;
  techName: string;
  readings: ComponentReading[];
  timestamp: number;
}

const STATUS_COLORS: Record<ReadingStatus, string> = {
  Normal: "#22c55e",
  High: "#f59e0b",
  Low: "#60a5fa",
  Critical: "#ef4444",
};

const ACCENT = "#60a5fa";

export default function BlowdownsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");
  const [selectedSkid, setSelectedSkid] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [techName, setTechName] = useState(user?.name || "");
  const [readings, setReadings] = useState<ComponentReading[]>(
    COMPONENT_NAMES.map((name) => ({ name, value: "", unit: "PSI", status: "Normal" as ReadingStatus }))
  );
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<SkidLog[]>([]);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const remote = await apiGet<SkidLog[]>("/blowdowns");
      if (Array.isArray(remote) && remote.length > 0) { setLogs(remote); return; }
    } catch { /* ignore */ }
    setLogs(JSON.parse(localStorage.getItem("fi_blowdowns") || "[]"));
  }

  function updateReading(index: number, field: keyof ComponentReading, value: string) {
    setReadings(readings.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const log: SkidLog = {
      id: crypto.randomUUID(),
      skidId: `SKID-${String(selectedSkid).padStart(2, "0")}`,
      date, techName, readings, timestamp: Date.now(),
    };
    try { await apiPost("/blowdowns", log); } catch { /* offline */ }
    const updated = [log, ...logs];
    setLogs(updated);
    localStorage.setItem("fi_blowdowns", JSON.stringify(updated));
    setReadings(COMPONENT_NAMES.map((name) => ({ name, value: "", unit: "PSI", status: "Normal" as ReadingStatus })));
    setSaving(false);
    setActiveTab("history");
  }

  const criticalReadings = logs.flatMap((l) =>
    l.readings.filter((r) => r.status === "Critical").map((r) => ({ ...r, skid: l.skidId, date: l.date }))
  );

  return (
    <div className="px-8 pt-8 pb-12 max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <Droplets size={18} style={{ color: ACCENT }} />
        <h1 className="text-xl font-bold text-white">Blowdown Logs</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">10 Skids × 8 Components — {user?.company || "—"}</p>

      <div className="flex gap-2 mb-6">
        {[{ id: "log" as const, label: "Log Reading" }, { id: "history" as const, label: "History" }].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === t.id ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.03)",
              color: activeTab === t.id ? ACCENT : "rgba(148,163,184,0.5)",
              border: activeTab === t.id ? "1px solid rgba(96,165,250,0.25)" : "1px solid rgba(255,255,255,0.06)",
            }}>{t.label}</button>
        ))}
      </div>

      {activeTab === "log" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl p-4 grid grid-cols-3 gap-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Skid</label>
              <select value={selectedSkid} onChange={(e) => setSelectedSkid(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {Array.from({ length: NUM_SKIDS }, (_, i) => (
                  <option key={i + 1} value={i + 1}>SKID-{String(i + 1).padStart(2, "0")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Technician</label>
              <input value={techName} onChange={(e) => setTechName(e.target.value)} required
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="grid grid-cols-4 px-4 py-2 text-xs text-gray-600" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span>Component</span><span>Value</span><span>Unit</span><span>Status</span>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {readings.map((r, i) => (
                <div key={i} className="grid grid-cols-4 px-4 py-2.5 items-center gap-2">
                  <div className="text-sm text-gray-300">{r.name}</div>
                  <input value={r.value} onChange={(e) => updateReading(i, "value", e.target.value)}
                    type="number" step="0.01" placeholder="0.00"
                    className="rounded px-2 py-1 text-sm text-white w-full"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <select value={r.unit} onChange={(e) => updateReading(i, "unit", e.target.value)}
                    className="rounded px-2 py-1 text-sm text-white"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {["PSI", "GPM", "°F", "pH", "ppm", "%", "gal"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <select value={r.status} onChange={(e) => updateReading(i, "status", e.target.value as ReadingStatus)}
                    className="rounded px-2 py-1 text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: STATUS_COLORS[r.status] }}>
                    {READING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(96,165,250,0.12)", color: ACCENT, border: "1px solid rgba(96,165,250,0.25)" }}>
            {saving ? "Submitting..." : `Submit SKID-${String(selectedSkid).padStart(2, "0")} — ${readings.length} readings`}
          </button>
        </form>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {criticalReadings.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="text-sm font-medium text-red-400 mb-2">Critical Readings</div>
              {criticalReadings.map((r, i) => (
                <div key={i} className="text-xs text-gray-400 mb-0.5">{r.skid} · {r.date} — {r.name}: {r.value} {r.unit}</div>
              ))}
            </div>
          )}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-2 text-xs text-gray-600" style={{ background: "rgba(255,255,255,0.02)" }}>{logs.length} log submissions</div>
            {logs.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-600">No logs yet — submit your first blowdown reading.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {logs.map((log) => {
                  const critCount = log.readings.filter((r) => r.status === "Critical").length;
                  return (
                    <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white/80">{log.skidId}</span>
                          <span className="text-xs text-gray-600">· {log.date} · {log.techName}</span>
                        </div>
                        {critCount > 0 ? (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            {critCount} Critical
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>All Normal</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
