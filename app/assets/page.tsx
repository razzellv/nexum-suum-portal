"use client";

import { useState, useEffect } from "react";
import { Database, Plus } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { apiPost, apiGet } from "../lib/api";

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  serial: string;
  installDate: string;
  lastPMDate: string;
  status: "operational" | "needs-pm" | "down";
  notes: string;
}

const STATUS_CONFIG = {
  operational: { label: "Operational", color: "#22c55e" },
  "needs-pm": { label: "Needs PM", color: "#f59e0b" },
  down: { label: "Down", color: "#ef4444" },
};

const ACCENT = "#00FFE1";

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<Asset, "id">>({
    name: "", type: "", location: "", manufacturer: "", model: "", serial: "",
    installDate: "", lastPMDate: "", status: "operational", notes: "",
  });

  useEffect(() => { loadAssets(); }, []);

  async function loadAssets() {
    try {
      const remote = await apiGet<Asset[]>("/assets");
      if (Array.isArray(remote) && remote.length > 0) { setAssets(remote); return; }
    } catch { /* ignore */ }
    setAssets(JSON.parse(localStorage.getItem("fi_assets") || "[]"));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const asset: Asset = { id: crypto.randomUUID(), ...form };
    try { await apiPost("/assets", asset); } catch { /* offline */ }
    const updated = [...assets, asset];
    setAssets(updated);
    localStorage.setItem("fi_assets", JSON.stringify(updated));
    setForm({ name: "", type: "", location: "", manufacturer: "", model: "", serial: "", installDate: "", lastPMDate: "", status: "operational", notes: "" });
    setShowForm(false);
    setSaving(false);
  }

  const operational = assets.filter((a) => a.status === "operational").length;
  const needsPM = assets.filter((a) => a.status === "needs-pm").length;
  const down = assets.filter((a) => a.status === "down").length;

  return (
    <div className="px-8 pt-8 pb-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database size={18} style={{ color: ACCENT }} />
            <h1 className="text-xl font-bold text-white">Asset Registry</h1>
          </div>
          <p className="text-sm text-gray-500">Equipment registry · {user?.company || "—"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "rgba(0,255,225,0.08)", color: ACCENT, border: "1px solid rgba(0,255,225,0.18)" }}>
          <Plus size={14} /> Add Asset
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Operational", value: operational, color: "#22c55e" },
          { label: "Needs PM", value: needsPM, color: "#f59e0b" },
          { label: "Down", value: down, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl p-5 mb-5 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,225,0.12)" }}>
          <div className="text-sm font-medium text-white/70">Add Asset</div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "name", label: "Equipment Name", required: true },
              { key: "type", label: "Equipment Type" },
              { key: "location", label: "Location / Room" },
              { key: "manufacturer", label: "Manufacturer" },
              { key: "model", label: "Model #" },
              { key: "serial", label: "Serial #" },
              { key: "installDate", label: "Install Date", type: "date" },
              { key: "lastPMDate", label: "Last PM Date", type: "date" },
              { key: "notes", label: "Notes" },
            ].map(({ key, label, required, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input type={type || "text"} value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required}
                  className="w-full rounded-lg px-3 py-2 text-sm text-white"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Asset["status"] })}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(0,255,225,0.12)", color: ACCENT, border: "1px solid rgba(0,255,225,0.25)" }}>
              {saving ? "Adding..." : "Add Asset"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm text-gray-500 hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-600" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span className="col-span-2">Equipment</span><span>Location</span><span>Last PM</span><span>Status</span>
        </div>
        {assets.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-600">No assets yet — add your first piece of equipment.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {assets.map((asset) => (
              <div key={asset.id} className="grid grid-cols-5 px-4 py-3 items-center">
                <div className="col-span-2">
                  <div className="text-sm text-white/80">{asset.name}</div>
                  <div className="text-xs text-gray-600">{[asset.manufacturer, asset.model, asset.serial].filter(Boolean).join(" · ")}</div>
                </div>
                <div className="text-sm text-gray-400">{asset.location || "—"}</div>
                <div className="text-xs text-gray-500">{asset.lastPMDate || "—"}</div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{
                    background: `${STATUS_CONFIG[asset.status].color}18`,
                    color: STATUS_CONFIG[asset.status].color,
                  }}>{STATUS_CONFIG[asset.status].label}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
