"use client";
import { useState, useEffect, useMemo } from "react";
import { Snowflake, Plus, ChevronDown, Lock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../components/AuthContext";
import { apiPost } from "../lib/api";
import { loadLogs, saveLogs } from "../lib/logData";
import { CHILLER_INTELLIGENCE } from "../lib/products";
import { isUnlocked } from "../lib/auth";
import PreviewBanner from "../../components/PreviewBanner";
import LockedInput from "../../components/LockedInput";

const GLASS = {
  background: 'rgba(2,10,18,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(56,189,248,0.1)',
  borderRadius: '16px',
} as React.CSSProperties;

const GLASS_TILE = {
  background: 'rgba(4,16,28,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(56,189,248,0.1)',
  borderRadius: '12px',
} as React.CSSProperties;

interface ChillerLog {
  id: string;
  employeeName: string;
  title: string;
  description: string;
  dateTime: string;
  cwSupplyTemp: string;
  cwReturnTemp: string;
  condSupplyTemp: string;
  condReturnTemp: string;
  supplyPSI: string;
  returnPSI: string;
  refSuctionTemp: string;
  refDischargeTemp: string;
  basinLevel: string;
  hardness: string;
  oilVolume: string;
  timestamp: number;
}

const TABS = ['Compliance Overview', 'Log Data', 'Calculator', 'Documents'] as const;
type Tab = typeof TABS[number];

const ACCENT = "#38bdf8";
const ACCENT_RGB = "56,189,248";

const EMPTY_FORM = {
  employeeName: '', title: '', description: '', dateTime: '',
  cwSupplyTemp: '', cwReturnTemp: '', condSupplyTemp: '', condReturnTemp: '',
  supplyPSI: '', returnPSI: '', refSuctionTemp: '', refDischargeTemp: '',
  basinLevel: '', hardness: '', oilVolume: '',
};

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(56,189,248,0.12)',
  borderRadius: '8px',
  color: '#e2e8f0',
  width: '100%',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'rgba(148,163,184,0.5)',
  marginBottom: '4px',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(now.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon.getTime(), end: sun.getTime() };
}

function avgNum(logs: ChillerLog[], key: keyof ChillerLog): number {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const DEMO_CHART = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 4, 16 + i);
  return {
    name: `${d.getMonth() + 1}/${d.getDate()}`,
    cwSupply: 44 + [1.2, 0.8, 1.5, 0.4, 1.1, 0.2, 1.8, 0.9, 0.5, 2.0, 1.3, 0.3, 1.6, 0.7][i],
    cwReturn: 56 + [0.9, 0.6, 1.2, 0.3, 0.8, 0.1, 1.4, 0.7, 0.4, 1.6, 1.0, 0.2, 1.3, 0.5][i],
    basinLevel: 72 + [3, 2, 5, 1, 4, 1, 6, 3, 2, 7, 4, 1, 5, 2][i],
  };
});

const DEMO_LOGS: ChillerLog[] = [
  { id: 'd1', employeeName: 'M. Rodriguez', title: 'Chiller Tech', description: 'Refrigerant temps checked — discharge nominal', dateTime: '2026-05-27T10:00', cwSupplyTemp: '44.8', cwReturnTemp: '56.2', condSupplyTemp: '82', condReturnTemp: '92', supplyPSI: '85', returnPSI: '80', refSuctionTemp: '38', refDischargeTemp: '118', basinLevel: '74', hardness: '180', oilVolume: '', timestamp: 1748340000000 },
  { id: 'd2', employeeName: 'T. Barnes', title: 'HVAC Tech', description: 'Basin water treatment — hardness in range', dateTime: '2026-05-26T09:30', cwSupplyTemp: '45.1', cwReturnTemp: '56.8', condSupplyTemp: '84', condReturnTemp: '94', supplyPSI: '84', returnPSI: '79', refSuctionTemp: '37', refDischargeTemp: '121', basinLevel: '71', hardness: '195', oilVolume: '', timestamp: 1748259000000 },
  { id: 'd3', employeeName: 'M. Rodriguez', title: 'Chiller Tech', description: 'COP calculated — 4.8, within target', dateTime: '2026-05-24T11:15', cwSupplyTemp: '44.5', cwReturnTemp: '55.9', condSupplyTemp: '81', condReturnTemp: '91', supplyPSI: '86', returnPSI: '81', refSuctionTemp: '39', refDischargeTemp: '116', basinLevel: '76', hardness: '170', oilVolume: '', timestamp: 1748084100000 },
  { id: 'd4', employeeName: 'L. Santos', title: 'Sr. Operator', description: 'PM — condenser tubes inspected and cleaned', dateTime: '2026-05-22T08:45', cwSupplyTemp: '45.3', cwReturnTemp: '57.1', condSupplyTemp: '85', condReturnTemp: '95', supplyPSI: '83', returnPSI: '78', refSuctionTemp: '36', refDischargeTemp: '123', basinLevel: '69', hardness: '210', oilVolume: '', timestamp: 1747909500000 },
  { id: 'd5', employeeName: 'T. Barnes', title: 'HVAC Tech', description: 'Weekly inspection — cooling tower drift check', dateTime: '2026-05-20T14:00', cwSupplyTemp: '44.9', cwReturnTemp: '56.4', condSupplyTemp: '83', condReturnTemp: '93', supplyPSI: '85', returnPSI: '80', refSuctionTemp: '38', refDischargeTemp: '119', basinLevel: '73', hardness: '185', oilVolume: '', timestamp: 1747742400000 },
];

function ChecklistItem({ label, status }: { label: string; status: 'current' | 'due-soon' | 'overdue' | 'preview' }) {
  const colors = { current: '#22c55e', 'due-soon': '#f59e0b', overdue: '#ef4444', preview: '#4b5563' };
  const statusLabels = { current: 'Current', 'due-soon': 'Due Soon', overdue: 'Overdue', preview: '—' };
  const color = colors[status];
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2.5">
        <span style={{ color: status === 'current' ? '#22c55e' : '#4b5563', fontSize: 14 }}>{status === 'current' ? '☑' : '☐'}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>
        {statusLabels[status]}
      </span>
    </div>
  );
}

export default function ChillerPage() {
  useAuth();
  const unlocked = isUnlocked('chiller');
  const [tab, setTab] = useState<Tab>('Compliance Overview');
  const [logs, setLogs] = useState<ChillerLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  const [coolingTons, setCoolingTons] = useState('');
  const [compressorKW, setCompressorKW] = useState('');
  const [cwSupply, setCwSupply] = useState('');
  const [cwReturn, setCwReturn] = useState('');
  const [flowRateGPM, setFlowRateGPM] = useState('');
  const [condSupply, setCondSupply] = useState('');
  const [condReturn, setCondReturn] = useState('');
  const [electricityRate, setElectricityRate] = useState('0.12');

  useEffect(() => {
    setLogs(loadLogs<ChillerLog>('chiller'));
  }, []);

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const displayLogs = useMemo(() => unlocked ? logs : [], [unlocked, logs]);
  const logsThisWeek = displayLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  const coolingScore = useMemo(() => {
    if (!unlocked) return { label: 'Normal — 118°F discharge (demo)', color: '#22c55e' };
    const vals = displayLogs.map(l => parseFloat(l.refDischargeTemp)).filter(v => !isNaN(v) && v > 0);
    if (!vals.length) return { label: '—', color: '#4b5563' };
    const a = vals.reduce((x, y) => x + y, 0) / vals.length;
    return a > 130 ? { label: `Flagged — ${a.toFixed(0)}°F discharge`, color: '#ef4444' } : { label: `Normal — ${a.toFixed(0)}°F discharge`, color: '#22c55e' };
  }, [displayLogs, unlocked]);

  const avgCWDelta = useMemo(() => {
    if (!unlocked) return '11.6°F (demo)';
    const vals = displayLogs.slice(0, 30).map(l => parseFloat(l.cwReturnTemp) - parseFloat(l.cwSupplyTemp)).filter(v => !isNaN(v) && v > 0);
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}°F` : '—';
  }, [displayLogs, unlocked]);

  const basinStatus = useMemo(() => {
    if (!unlocked) return { label: 'Normal', sub: '72% avg (demo)', color: '#22c55e' };
    const a = avgNum(displayLogs, 'basinLevel');
    if (!a) return { label: '—', sub: 'No data', color: '#4b5563' };
    return a < 50 ? { label: 'Low', sub: `${a.toFixed(0)}%`, color: '#ef4444' } : a > 90 ? { label: 'High', sub: `${a.toFixed(0)}%`, color: '#f59e0b' } : { label: 'Normal', sub: `${a.toFixed(0)}% avg`, color: '#22c55e' };
  }, [displayLogs, unlocked]);

  const chartData = useMemo(() => {
    if (!unlocked) return DEMO_CHART;
    return [...logs].reverse().slice(0, 14).map(l => ({
      name: l.dateTime ? l.dateTime.slice(5, 10) : '—',
      cwSupply: parseFloat(l.cwSupplyTemp) || null,
      cwReturn: parseFloat(l.cwReturnTemp) || null,
      basinLevel: parseFloat(l.basinLevel) || null,
    }));
  }, [logs, unlocked]);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const checklist = useMemo(() => {
    if (!unlocked) return Array(6).fill('preview') as ('current' | 'due-soon' | 'overdue' | 'preview')[];
    const wk = displayLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    const mo = displayLogs.filter(l => l.timestamp >= monthStart.getTime());
    return [
      wk.some(l => l.refSuctionTemp && l.refDischargeTemp) ? 'current' : 'overdue',
      wk.some(l => l.basinLevel) ? 'current' : 'overdue',
      wk.some(l => l.condSupplyTemp && l.condReturnTemp) ? 'current' : 'due-soon',
      mo.some(l => l.hardness) ? 'current' : 'due-soon',
      wk.some(l => l.cwSupplyTemp && l.cwReturnTemp) ? 'current' : 'due-soon',
      displayLogs.some(l => l.timestamp >= monthStart.getTime() && /pm|preventive/i.test(l.description)) ? 'current' : 'due-soon',
    ] as ('current' | 'due-soon' | 'overdue' | 'preview')[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLogs, unlocked, weekStart, weekEnd]);

  const calc = useMemo(() => {
    const tons = parseFloat(coolingTons) || 0;
    const kw = parseFloat(compressorKW) || 0;
    const sup = parseFloat(cwSupply) || 0;
    const ret = parseFloat(cwReturn) || 0;
    const gpm = parseFloat(flowRateGPM) || 0;
    const rate = parseFloat(electricityRate) || 0.12;
    const btuHr = gpm > 0 && ret > sup ? gpm * 500 * (ret - sup) : tons * 12000;
    const cop = kw > 0 ? (btuHr / 3412) / kw : 0;
    const eer = kw > 0 ? btuHr / (kw * 1000) : 0;
    const kwPerTon = tons > 0 && kw > 0 ? kw / tons : 0;
    const hrCost = kw * rate;
    const rating = cop > 5.5 ? 'Excellent' : cop > 4.5 ? 'Good' : cop > 3.5 ? 'Fair' : cop > 0 ? 'Poor' : '—';
    const rc = rating === 'Excellent' ? '#22c55e' : rating === 'Good' ? '#38bdf8' : rating === 'Fair' ? '#f59e0b' : '#ef4444';
    return { cop: cop.toFixed(2), eer: eer.toFixed(1), kwPerTon: kwPerTon.toFixed(3), btuHr: (btuHr / 1000).toFixed(1), hrCost: hrCost.toFixed(2), dayCost: (hrCost * 24).toFixed(2), rating, rc };
  }, [coolingTons, compressorKW, cwSupply, cwReturn, flowRateGPM, electricityRate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unlocked) return;
    setSubmitting(true);
    const entry: ChillerLog = { id: crypto.randomUUID(), ...form, timestamp: Date.now() };
    const updated = [entry, ...logs];
    saveLogs('chiller', updated);
    try { await apiPost('/logs/chiller', entry); } catch { /* offline */ }
    setLogs(updated);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSubmitting(false);
  }

  const tableRows = unlocked ? logs : DEMO_LOGS;

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {!unlocked && <PreviewBanner tier="chiller" />}

      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(56,189,248,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
            <Snowflake size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Chiller Intelligence</h1>
            <p className="text-gray-600 text-xs">Refrigerant · Cooling Water · Basin · COP/EER</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Refrigerant Status</p>
            <p className="text-xs font-semibold truncate" style={{ color: coolingScore.color }}>{coolingScore.label}</p>
          </div>
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Basin Water</p>
            <span className="inline-block text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: basinStatus.color, background: `${basinStatus.color}18`, border: `1px solid ${basinStatus.color}40` }}>{basinStatus.label}</span>
            <p className="text-[10px] text-gray-700 mt-1.5">{basinStatus.sub}</p>
          </div>
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Avg CW Delta</p>
            <p className="text-lg font-bold truncate" style={{ color: ACCENT }}>{avgCWDelta}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">target: 10–14°F</p>
          </div>
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Weekly Log Count</p>
            <p className="text-2xl font-bold" style={{ color: logsThisWeek >= 5 ? '#22c55e' : '#f59e0b' }}>
              {unlocked ? logsThisWeek : '—'}<span className="text-sm text-gray-600">/5</span>
            </p>
            <p className="text-[10px] text-gray-700 mt-0.5">target: 5/week</p>
          </div>
        </div>
      </div>

      <div className="px-7 border-b" style={{ borderColor: 'rgba(56,189,248,0.06)' }}>
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap"
              style={tab === t ? { color: ACCENT, borderColor: ACCENT } : { color: 'rgba(148,163,184,0.45)', borderColor: 'transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-7 py-6">

        {tab === 'Compliance Overview' && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Chilled Water Supply + Return °F {!unlocked && <span className="text-gray-700">(demo)</span>}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="cwSupply" stroke={ACCENT} strokeWidth={2} dot={false} connectNulls name="CW Supply °F" />
                    <Line type="monotone" dataKey="cwReturn" stroke="#a78bfa" strokeWidth={2} dot={false} connectNulls name="CW Return °F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Basin Water Level % {!unlocked && <span className="text-gray-700">(demo)</span>}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={35} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <defs>
                      <linearGradient id="basinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="basinLevel" stroke={ACCENT} fill="url(#basinGrad)" strokeWidth={2} dot={false} connectNulls name="Basin Level %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-5 max-w-2xl" style={GLASS}>
              <div className="flex items-center gap-2.5 mb-4">
                <h3 className="font-display text-base font-semibold text-white">Chiller Compliance Checklist</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `rgba(${ACCENT_RGB},0.1)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.25)` }}>
                  {unlocked ? `${checklist.filter(s => s === 'current').length}/6` : '6 items'}
                </span>
                {!unlocked && <span className="text-[10px] text-gray-600 italic">Purchase to track real status</span>}
              </div>
              {[
                'Refrigerant temps logged this week',
                'Basin water level checked',
                'Condenser water temps logged',
                'Water hardness tested this month',
                'COP calculated this week',
                'At least 1 PM entry this month',
              ].map((label, i) => <ChecklistItem key={label} label={label} status={checklist[i]} />)}
            </div>
          </div>
        )}

        {tab === 'Log Data' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{unlocked ? `${logs.length} entries logged` : 'Preview — 5 demo rows'}</p>
              <LockedInput locked={!unlocked} tier="chiller">
                <button onClick={() => unlocked && setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: `rgba(${ACCENT_RGB},0.08)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
                  {showForm ? <ChevronDown size={14} /> : <Plus size={14} />}
                  {showForm ? 'Hide Form' : 'Add Entry'}
                </button>
              </LockedInput>
            </div>

            {showForm && unlocked && (
              <div className="mb-5 p-5" style={GLASS}>
                <h3 className="font-display text-base font-semibold text-white mb-4">New Chiller Log Entry</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {([
                      ['employeeName', 'Employee Name', 'text'],
                      ['title', 'Title', 'text'],
                      ['dateTime', 'Date & Time', 'datetime-local'],
                      ['cwSupplyTemp', 'CW Supply Temp °F', 'number'],
                      ['cwReturnTemp', 'CW Return Temp °F', 'number'],
                      ['condSupplyTemp', 'Condenser Supply °F', 'number'],
                      ['condReturnTemp', 'Condenser Return °F', 'number'],
                      ['supplyPSI', 'Supply PSI', 'number'],
                      ['returnPSI', 'Return PSI', 'number'],
                      ['refSuctionTemp', 'Ref Suction Temp °F', 'number'],
                      ['refDischargeTemp', 'Ref Discharge Temp °F', 'number'],
                      ['basinLevel', 'Basin Water Level %', 'number'],
                      ['hardness', 'Water Hardness PPM (opt.)', 'number'],
                      ['oilVolume', 'Oil Vol. gal (opt.)', 'number'],
                    ] as [string, string, string][]).map(([key, label, type]) => (
                      <div key={key}>
                        <label style={LABEL_STYLE}>{label}</label>
                        <input type={type} value={(form as Record<string, string>)[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={INPUT_STYLE} />
                      </div>
                    ))}
                    <div className="md:col-span-3">
                      <label style={LABEL_STYLE}>Description</label>
                      <textarea value={form.description} rows={3}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        style={{ ...INPUT_STYLE, resize: 'none' }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.25)` }}>
                      {submitting ? 'Saving…' : 'Submit Entry →'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 rounded-xl text-sm text-gray-500" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ ...GLASS, opacity: unlocked ? 1 : 0.7 }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: `rgba(${ACCENT_RGB},0.12)` }}>
                      {['Employee', 'Title', 'Date / Desc', 'CW Sup°F', 'CW Ret°F', 'S-PSI', 'R-PSI', 'Ref Suc°F', 'Ref Dis°F', 'Basin%', 'Hardness', 'Week'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.15em] font-normal" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr><td colSpan={12} className="px-4 py-10 text-center text-gray-600 text-sm">No logs yet — add your first entry above.</td></tr>
                    ) : tableRows.map((log, idx) => (
                      <tr key={log.id} className="border-b font-mono text-sm text-gray-300 hover:bg-[rgba(56,189,248,0.02)] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-2 max-w-[100px] truncate">{log.employeeName || '—'}</td>
                        <td className="px-3 py-2 max-w-[80px] truncate">{log.title || '—'}</td>
                        <td className="px-3 py-2 max-w-[150px]">
                          <div className="text-[10px] text-gray-600">{log.dateTime || '—'}</div>
                          <div className="truncate text-xs text-gray-500">{log.description}</div>
                        </td>
                        <td className="px-3 py-2">{log.cwSupplyTemp || '—'}</td>
                        <td className="px-3 py-2">{log.cwReturnTemp || '—'}</td>
                        <td className="px-3 py-2">{log.supplyPSI || '—'}</td>
                        <td className="px-3 py-2">{log.returnPSI || '—'}</td>
                        <td className="px-3 py-2">{log.refSuctionTemp || '—'}</td>
                        <td className="px-3 py-2">{log.refDischargeTemp || '—'}</td>
                        <td className="px-3 py-2">{log.basinLevel || '—'}</td>
                        <td className="px-3 py-2">{log.hardness || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ border: `1px solid rgba(${ACCENT_RGB},0.3)`, color: ACCENT }}>
                            {unlocked ? logs.filter(l => l.employeeName === log.employeeName && l.timestamp >= weekStart && l.timestamp <= weekEnd).length : idx + 1}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!unlocked && (
                <div className="px-5 py-3 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-xs text-gray-600 flex items-center justify-center gap-1.5">
                    <Lock size={10} /> Demo data — purchase Chiller Intelligence to log real data
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'Calculator' && (
          <div className="max-w-3xl">
            <div className="p-6" style={GLASS}>
              <h2 className="font-display text-2xl font-bold text-white mb-1">Chiller Efficiency Calculator</h2>
              <p className="text-gray-600 text-xs mb-6">Free to calculate — no purchase required</p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {([
                  ['coolingTons', 'Cooling Tons', coolingTons, setCoolingTons, '200'],
                  ['compressorKW', 'Compressor kW', compressorKW, setCompressorKW, '150'],
                  ['cwSupplyVal', 'CW Supply Temp °F', cwSupply, setCwSupply, '44'],
                  ['cwReturnVal', 'CW Return Temp °F', cwReturn, setCwReturn, '54'],
                  ['flowRateGPM', 'CW Flow GPM', flowRateGPM, setFlowRateGPM, '600'],
                  ['condSupplyVal', 'Condenser Supply °F', condSupply, setCondSupply, '85'],
                  ['condReturnVal', 'Condenser Return °F', condReturn, setCondReturn, '95'],
                  ['electricityRate', 'Electricity Rate $/kWh', electricityRate, setElectricityRate, '0.12'],
                ] as [string, string, string, (v: string) => void, string][]).map(([key, label, val, setter, ph]) => (
                  <div key={key}>
                    <label style={LABEL_STYLE}>{label}</label>
                    <input type="number" value={val} onChange={e => setter(e.target.value)} placeholder={ph} style={INPUT_STYLE} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'COP', val: calc.cop },
                  { label: 'EER', val: calc.eer },
                  { label: 'kW/Ton', val: calc.kwPerTon },
                  { label: 'Chilled Water BTU/hr (k)', val: `${calc.btuHr}k` },
                  { label: '$/hr', val: `$${calc.hrCost}`, color: '#fbbf24' },
                  { label: '$/day', val: `$${calc.dayCost}`, color: '#fbbf24' },
                ].map(m => (
                  <div key={m.label} className="p-4" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{m.label}</p>
                    <p className="text-2xl font-bold" style={{ color: m.color ?? ACCENT }}>{m.val}</p>
                  </div>
                ))}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Rating</p>
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${calc.rc}18`, color: calc.rc, border: `1px solid ${calc.rc}40` }}>{calc.rating}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Documents' && (
          <div className="max-w-3xl">
            <div style={GLASS}>
              {CHILLER_INTELLIGENCE.documents.map((doc, i, arr) => (
                <div key={doc.file} className="flex items-center justify-between px-5 py-3.5 group"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === 'pdf' ? '#fb923c' : doc.type === 'xlsx' ? '#34d399' : '#60a5fa', background: 'rgba(255,255,255,0.05)' }}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{doc.label}</span>
                  </div>
                  {unlocked
                    ? <a href={`/library/${doc.file}`} target="_blank" rel="noreferrer" className="text-xs text-gray-700 hover:text-[#38bdf8] transition-colors">↓</a>
                    : <span title="Purchase to download" className="cursor-not-allowed"><Lock size={11} className="text-gray-700" /></span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
