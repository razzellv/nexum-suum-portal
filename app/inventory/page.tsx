"use client";

import { useState, useEffect } from "react";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { canAccessTier } from "../lib/auth";
import { apiPost, apiGet } from "../lib/api";

const MAX_ITEMS = 30;
const WARN_THRESHOLD = 25;

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  notes: string;
  updatedAt: number;
}

function detectCategory(name: string): string {
  const n = name.toLowerCase();
  if (/filter|belt|gasket|seal/.test(n)) return "Maintenance Parts";
  if (/chemical|treatment|biocide/.test(n)) return "Chemicals";
  if (/gauge|meter|sensor/.test(n)) return "Instruments";
  if (/pump|motor|valve/.test(n)) return "Equipment";
  return "General Supplies";
}

const CAT_COLORS: Record<string, string> = {
  "Maintenance Parts": "#60a5fa",
  "Chemicals": "#f59e0b",
  "Instruments": "#a78bfa",
  "Equipment": "#00FFE1",
  "General Supplies": "#94a3b8",
};

const ACCENT = "#00FFE1";

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "ea", location: "", notes: "" });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const remote = await apiGet<InventoryItem[]>("/inventory");
      if (Array.isArray(remote) && remote.length > 0) { setItems(remote); return; }
    } catch { /* ignore */ }
    setItems(JSON.parse(localStorage.getItem("fi_inventory") || "[]"));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (items.length >= MAX_ITEMS) return;
    setSaving(true);
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: form.name,
      category: detectCategory(form.name),
      quantity: Number(form.quantity),
      unit: form.unit,
      location: form.location,
      notes: form.notes,
      updatedAt: Date.now(),
    };
    try { await apiPost("/inventory", item); } catch { /* offline */ }
    const updated = [...items, item];
    setItems(updated);
    localStorage.setItem("fi_inventory", JSON.stringify(updated));
    setForm({ name: "", quantity: "", unit: "ea", location: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  }

  if (!user || !canAccessTier(user.tier, "facility")) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-8">
        <div className="max-w-sm w-full text-center rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-lg font-semibold text-white mb-2">Facility Tier Required</h2>
          <p className="text-sm text-gray-500 mb-4">Inventory management requires the Facility Intelligence package.</p>
          <a href="https://portal.nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
            className="block w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(0,255,225,0.12)", color: ACCENT, border: "1px solid rgba(0,255,225,0.25)" }}>
            Upgrade to FI Platform
          </a>
        </div>
      </div>
    );
  }

  const atHardLimit = items.length >= MAX_ITEMS;
  const atWarnLimit = items.length >= WARN_THRESHOLD;

  return (
    <div className="px-8 pt-8 pb-12 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} style={{ color: ACCENT }} />
            <h1 className="text-xl font-bold text-white">Inventory</h1>
          </div>
          <p className="text-sm text-gray-500">{items.length} / {MAX_ITEMS} items · {user.company}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} disabled={atHardLimit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
          style={{ background: "rgba(0,255,225,0.08)", color: ACCENT, border: "1px solid rgba(0,255,225,0.18)" }}>
          <Plus size={14} /> Add Item
        </button>
      </div>

      {atWarnLimit && !atHardLimit && (
        <div className="flex items-center gap-2 mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
          <AlertTriangle size={14} /> {MAX_ITEMS - items.length} slots remaining — upgrade to FI Platform for unlimited inventory
        </div>
      )}
      {atHardLimit && (
        <div className="flex items-center gap-2 mb-4 rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          <AlertTriangle size={14} /> 30-item limit reached —{" "}
          <a href="https://portal.nexumsuum-facilityintelligence.com/pricing" className="underline" target="_blank" rel="noreferrer">upgrade to FI Platform</a> for unlimited items
        </div>
      )}

      {showForm && !atHardLimit && (
        <form onSubmit={handleAdd} className="rounded-xl p-5 mb-5 space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,225,0.12)" }}>
          <div className="text-sm font-medium text-white/70">Add Item</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Item Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                placeholder="e.g. 20x25x4 Filter, Water Treatment Chemical..."
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
              {form.name && (
                <div className="mt-1 text-xs text-gray-600">
                  Auto-category: <span style={{ color: CAT_COLORS[detectCategory(form.name)] }}>{detectCategory(form.name)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required min="0"
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {["ea", "lbs", "gal", "case", "box", "roll", "ft", "L"].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full rounded-lg px-3 py-2 text-sm text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(0,255,225,0.12)", color: ACCENT, border: "1px solid rgba(0,255,225,0.25)" }}>
              {saving ? "Adding..." : "Add Item"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm text-gray-500"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="grid grid-cols-5 px-4 py-2 text-xs text-gray-600" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span className="col-span-2">Item</span><span>Category</span><span>Qty</span><span>Location</span>
        </div>
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-600">No items yet — add your first inventory item.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-5 px-4 py-3 items-center">
                <div className="col-span-2">
                  <div className="text-sm text-white/80">{item.name}</div>
                  {item.notes && <div className="text-xs text-gray-600">{item.notes}</div>}
                </div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${CAT_COLORS[item.category]}18`, color: CAT_COLORS[item.category] }}>
                    {item.category}
                  </span>
                </div>
                <div className="text-sm text-gray-400">{item.quantity} {item.unit}</div>
                <div className="text-xs text-gray-500">{item.location || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
