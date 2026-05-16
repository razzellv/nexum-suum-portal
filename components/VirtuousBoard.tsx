"use client";

import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../app/lib/api";

interface VScore {
  id: string;
  type: string;
  finding: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  timestamp: number;
}

const INSPECTION_TYPES = [
  "Daily Walk",
  "Equipment Check",
  "Safety Audit",
  "PM Inspection",
  "Compliance Review",
];

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function ScoreCard({ label, value, suffix = "%", color }: { label: string; value: number; suffix?: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}{suffix}
      </div>
    </div>
  );
}

interface Props {
  userName: string;
}

export default function VirtuousBoard({ userName }: Props) {
  const [entries, setEntries] = useState<VScore[]>([]);
  const [form, setForm] = useState({
    type: INSPECTION_TYPES[0],
    finding: "",
    severity: "low" as VScore["severity"],
    status: "open" as VScore["status"],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    try {
      const remote = await apiGet<VScore[]>("/virtuous/scores");
      if (Array.isArray(remote) && remote.length > 0) { setEntries(remote); return; }
    } catch { /* ignore */ }
    setEntries(JSON.parse(localStorage.getItem("fi_virtuous") || "[]"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const entry: VScore = { id: crypto.randomUUID(), ...form, timestamp: Date.now() };
    try { await apiPost("/virtuous/scores", entry); } catch { /* offline */ }
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem("fi_virtuous", JSON.stringify(updated));
    setForm({ type: INSPECTION_TYPES[0], finding: "", severity: "low", status: "open" });
    setSaving(false);
  }

  const now = Date.now();
  const last24h = entries.filter((e) => now - e.timestamp < 86_400_000);
  const target = 4;
  const inspCount = last24h.length;
  const normalCount = last24h.filter((e) => e.severity === "low").length;
  const avgCompliance = pct(normalCount, Math.max(1, last24h.length));
  const onTime = pct(last24h.filter((e) => now - e.timestamp < 21_600_000).length, Math.max(1, inspCount));
  const openItems = entries.filter((e) => e.status !== "resolved").length;

  function scoreColor(v: number) {
    if (v >= 80) return "#22c55e";
    if (v >= 60) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Compliance Scorecard — VirtuousBoard™</h3>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{userName} · Last 24h</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreCard label="Inspections (24h)" value={inspCount} suffix={`/${target}`} color={inspCount >= target ? "#22c55e" : "#f59e0b"} />
        <ScoreCard label="Avg Compliance" value={avgCompliance} color={scoreColor(avgCompliance)} />
        <ScoreCard label="On-Time Rate" value={onTime} color={scoreColor(onTime)} />
        <ScoreCard label="Open Items" value={openItems} suffix="" color={openItems === 0 ? "#22c55e" : openItems < 5 ? "#f59e0b" : "#ef4444"} />
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Log Inspection Entry</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {INSPECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Severity</label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as VScore["severity"] })}
              className="w-full rounded-lg px-3 py-2 text-sm text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {["low", "medium", "high", "critical"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Finding / Note</label>
          <input value={form.finding} onChange={(e) => setForm({ ...form, finding: e.target.value })}
            placeholder="Describe what you found..." required
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VScore["status"] })}
            className="rounded-lg px-3 py-2 text-sm text-white"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {["open", "in-progress", "resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "rgba(0,255,225,0.15)", color: "#00FFE1", border: "1px solid rgba(0,255,225,0.3)" }}>
            {saving ? "Saving..." : "Log Entry"}
          </button>
        </div>
      </form>

      {entries.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-2 text-xs" style={{ background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)" }}>Recent Entries</div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {entries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[entry.severity] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.7)" }}>{entry.type} — {entry.finding}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  background: entry.status === "resolved" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                  color: entry.status === "resolved" ? "#22c55e" : "#f59e0b",
                }}>{entry.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
