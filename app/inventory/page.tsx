"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Filter } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { canAccessTier } from "../lib/auth";
import { apiPost, apiGet } from "../lib/api";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  purpose: 'Replacement' | 'Upgrade' | 'Maintenance' | 'Emergency Spare';
  notes: string;
  updatedAt: number;
}

function detectCategory(name: string): string {
  const n = name.toLowerCase();
  if (/filter|belt|gasket|seal|valve|pump/.test(n)) return 'Replacement Parts';
  if (/upgrade|vfd|drive|controller|sensor|meter/.test(n)) return 'Upgrade Components';
  if (/chemical|treatment|biocide|inhibitor/.test(n)) return 'Chemical Supplies';
  if (/tool|wrench|gauge|manifold/.test(n)) return 'Tools & Equipment';
  return 'General Storage';
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

const CAT_COLORS: Record<string, string> = {
  'Replacement Parts': '#60a5fa',
  'Upgrade Components': '#00FFE1',
  'Chemical Supplies': '#f59e0b',
  'Tools & Equipment': '#a78bfa',
  'General Storage': '#94a3b8',
};

const ACCENT = '#00FFE1';

const GLASS = {
  background: 'rgba(2,10,18,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(0,255,225,0.1)',
  borderRadius: '16px',
} as React.CSSProperties;

const GLASS_TILE = {
  background: 'rgba(4,16,28,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(0,255,225,0.1)',
  borderRadius: '12px',
} as React.CSSProperties;

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(0,255,225,0.1)',
  borderRadius: '8px',
  color: '#e2e8f0',
  width: '100%',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgradeQueueOnly, setUpgradeQueueOnly] = useState(false);
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'ea',
    location: '',
    purpose: 'Replacement' as InventoryItem['purpose'],
    priority: 'low' as InventoryItem['priority'],
    notes: '',
  });

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const remote = await apiGet<InventoryItem[]>('/inventory');
      if (Array.isArray(remote) && remote.length > 0) { setItems(remote); return; }
    } catch { /* ignore */ }
    setItems(JSON.parse(localStorage.getItem('fi_inventory') || '[]'));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      name: form.name,
      category: detectCategory(form.name),
      quantity: Number(form.quantity),
      unit: form.unit,
      location: form.location,
      priority: form.priority,
      purpose: form.purpose,
      notes: form.notes,
      updatedAt: Date.now(),
    };
    try { await apiPost('/inventory', item); } catch { /* offline */ }
    const updated = [...items, item];
    setItems(updated);
    localStorage.setItem('fi_inventory', JSON.stringify(updated));
    setForm({ name: '', quantity: '', unit: 'ea', location: '', purpose: 'Replacement', priority: 'low', notes: '' });
    setShowForm(false);
    setSaving(false);
  }

  if (!user || !canAccessTier(user.tier, 'facility')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-8">
        <div className="max-w-sm w-full text-center rounded-2xl p-8" style={GLASS}>
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="font-display text-lg font-semibold text-white mb-2">Facility Tier Required</h2>
          <p className="text-sm text-gray-500 mb-4">Inventory management requires the Facility Intelligence package.</p>
          <a href="https://portal.nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
            className="block w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.25)' }}>
            Upgrade to FI Platform
          </a>
        </div>
      </div>
    );
  }

  const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

  const displayItems = upgradeQueueOnly
    ? [...items].filter(i => i.category === 'Upgrade Components').sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    : items;

  return (
    <div className="px-8 pt-8 pb-12" style={{ position: 'relative', zIndex: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package size={18} style={{ color: ACCENT }} />
            <h1 className="font-display text-2xl font-bold text-white">Parts &amp; Upgrade Backlog</h1>
          </div>
          <p className="text-sm text-gray-500">
            Track replacement parts in storage and queued upgrade components · {items.length} items in storage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setUpgradeQueueOnly(!upgradeQueueOnly)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={upgradeQueueOnly
              ? { background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.3)' }
              : { background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Filter size={13} /> Upgrade Queue
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'rgba(0,255,225,0.08)', color: ACCENT, border: '1px solid rgba(0,255,225,0.18)' }}>
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl p-5 mb-5" style={GLASS}>
          <div className="font-display text-base font-semibold text-white mb-4">Add Item</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 block mb-1">Item Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                placeholder="e.g. 20x25x4 Filter, VFD Drive 15HP, Water Treatment Chemical..."
                style={INPUT_STYLE} />
              {form.name && (
                <div className="mt-1 text-xs text-gray-600">
                  Auto-category: <span style={{ color: CAT_COLORS[detectCategory(form.name)] }}>{detectCategory(form.name)}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="0"
                style={INPUT_STYLE} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={INPUT_STYLE}>
                {['ea', 'lbs', 'gal', 'case', 'box', 'roll', 'ft', 'L'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })
              } style={INPUT_STYLE} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Purpose</label>
              <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value as InventoryItem['purpose'] })} style={INPUT_STYLE}>
                {(['Replacement', 'Upgrade', 'Maintenance', 'Emergency Spare'] as const).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as InventoryItem['priority'] })} style={INPUT_STYLE}>
                {(['low', 'medium', 'high', 'critical'] as const).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={INPUT_STYLE} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.25)' }}>
              {saving ? 'Adding...' : 'Add Item'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm text-gray-500"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div style={GLASS}>
        {/* Table header */}
        <div className="grid px-4 py-2 border-b" style={{
          gridTemplateColumns: '2fr 1fr 70px 60px 1fr 1fr 80px 1fr',
          borderColor: 'rgba(0,255,225,0.12)',
        }}>
          {['Item', 'Category', 'Qty', 'Unit', 'Location', 'Purpose', 'Priority', 'Notes'].map(h => (
            <span key={h} className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(0,255,225,0.5)' }}>{h}</span>
          ))}
        </div>

        {displayItems.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-600">
            {upgradeQueueOnly ? 'No upgrade components found.' : 'No items yet — add your first inventory item.'}
          </div>
        ) : (
          <div>
            {displayItems.map(item => (
              <div key={item.id} className="grid px-4 py-3 border-b transition-colors text-sm text-gray-300"
                style={{
                  gridTemplateColumns: '2fr 1fr 70px 60px 1fr 1fr 80px 1fr',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,255,225,0.02)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                <div>
                  <div className="text-white/80">{item.name}</div>
                </div>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${CAT_COLORS[item.category]}18`, color: CAT_COLORS[item.category] }}>
                    {item.category}
                  </span>
                </div>
                <div className="text-gray-400">{item.quantity}</div>
                <div className="text-gray-500">{item.unit}</div>
                <div className="text-gray-500 text-xs">{item.location || '—'}</div>
                <div className="text-gray-500 text-xs">{item.purpose || '—'}</div>
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                    background: `${PRIORITY_COLORS[item.priority]}18`,
                    color: PRIORITY_COLORS[item.priority],
                    border: `1px solid ${PRIORITY_COLORS[item.priority]}40`,
                  }}>{item.priority}</span>
                </div>
                <div className="text-xs text-gray-600 truncate">{item.notes || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
