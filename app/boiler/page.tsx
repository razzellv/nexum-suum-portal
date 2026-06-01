"use client";
import { useState, useEffect, useMemo } from "react";
import { Thermometer, Plus, ChevronDown, Lock } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../components/AuthContext";
import { apiPost } from "../lib/api";
import { loadLogs, saveLogs } from "../lib/logData";
import { BOILER_INTELLIGENCE } from "../lib/products";
import { isUnlocked } from "../lib/auth";
import PreviewBanner from "../../components/PreviewBanner";
import LockedInput from "../../components/LockedInput";

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

interface BoilerLog {
  id: string;
  employeeName: string;
  title: string;
  description: string;
  dateTime: string;
  supplyTemp: string;
  returnTemp: string;
  supplyPSI: string;
  returnPSI: string;
  mainPSI: string;
  waterLevel: string;
  conductivityPPM: string;
  pH: string;
  oilVolume: string;
  timestamp: number;
}

const TABS = ['Compliance Overview', 'Log Data', 'Calculator', 'Documents'] as const;
type Tab = typeof TABS[number];

const ACCENT = "#00FFE1";
const ACCENT_RGB = "0,255,225";

const EMPTY_FORM = {
  employeeName: '', title: '', description: '', dateTime: '',
  supplyTemp: '', returnTemp: '', supplyPSI: '', returnPSI: '',
  mainPSI: '', waterLevel: '', conductivityPPM: '', pH: '', oilVolume: '',
};

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

function avgNum(logs: BoilerLog[], key: keyof BoilerLog): number {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const DEMO_CHART = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 4, 16 + i);
  return {
    name: `${d.getMonth() + 1}/${d.getDate()}`,
    stackTemp: 360 + [24, 18, 31, 12, 28, 9, 35, 22, 15, 40, 27, 8, 33, 19][i],
    conductivityPPM: 1800 + [120, 80, 210, 60, 180, 30, 250, 100, 70, 300, 150, 40, 220, 90][i],
  };
});

const DEMO_LOGS: BoilerLog[] = [
  { id: 'd1', employeeName: 'J. Martinez', title: 'Boiler Tech', description: 'Routine blowdown boiler 1 — conductivity elevated', dateTime: '2026-05-27T09:15', supplyTemp: '385', returnTemp: '165', supplyPSI: '110', returnPSI: '105', mainPSI: '120', waterLevel: '78', conductivityPPM: '2100', pH: '8.4', oilVolume: '', timestamp: 1748336100000 },
  { id: 'd2', employeeName: 'R. Thompson', title: 'Sr. Tech', description: 'Water chemistry test — conductivity normal', dateTime: '2026-05-26T14:30', supplyTemp: '392', returnTemp: '168', supplyPSI: '108', returnPSI: '104', mainPSI: '118', waterLevel: '75', conductivityPPM: '1850', pH: '8.2', oilVolume: '', timestamp: 1748263800000 },
  { id: 'd3', employeeName: 'K. Williams', title: 'Boiler Op', description: 'Stack inspection, purge routine complete', dateTime: '2026-05-24T08:00', supplyTemp: '378', returnTemp: '162', supplyPSI: '112', returnPSI: '107', mainPSI: '122', waterLevel: '80', conductivityPPM: '2250', pH: '8.5', oilVolume: '', timestamp: 1748080800000 },
  { id: 'd4', employeeName: 'J. Martinez', title: 'Boiler Tech', description: 'PM — Checked LWFCO and pressure relief valve', dateTime: '2026-05-22T11:00', supplyTemp: '395', returnTemp: '170', supplyPSI: '115', returnPSI: '110', mainPSI: '125', waterLevel: '77', conductivityPPM: '1950', pH: '8.3', oilVolume: '', timestamp: 1747908000000 },
  { id: 'd5', employeeName: 'D. Chen', title: 'Facility Mgr', description: 'Weekly inspection — all systems nominal', dateTime: '2026-05-20T13:00', supplyTemp: '380', returnTemp: '160', supplyPSI: '109', returnPSI: '103', mainPSI: '119', waterLevel: '76', conductivityPPM: '2050', pH: '8.1', oilVolume: '', timestamp: 1747735200000 },
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

export default function BoilerPage() {
  useAuth();
  const unlocked = isUnlocked('boiler');
  const [tab, setTab] = useState<Tab>('Compliance Overview');
  const [logs, setLogs] = useState<BoilerLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  const [bhpMode, setBhpMode] = useState(true);
  const [inputBHP, setInputBHP] = useState('');
  const [inputBTU, setInputBTU] = useState('');
  const [fuelType, setFuelType] = useState<'gas' | 'oil' | 'electric'>('gas');
  const [stackTempCalc, setStackTempCalc] = useState('');
  const [ambientTemp, setAmbientTemp] = useState('70');
  const [o2Pct, setO2Pct] = useState('');
  const [steamPSI, setSteamPSI] = useState('');
  const [feedwaterTemp, setFeedwaterTemp] = useState('');

  useEffect(() => {
    setLogs(loadLogs<BoilerLog>('boiler'));
  }, []);

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const displayLogs = useMemo(() => unlocked ? logs : [], [unlocked, logs]);
  const logsThisWeek = displayLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  const combustionScore = useMemo(() => {
    if (!unlocked) return { val: '94', color: '#22c55e' };
    const temps = displayLogs.map(l => parseFloat(l.supplyTemp)).filter(v => !isNaN(v) && v > 0);
    if (!temps.length) return { val: '—', color: '#4b5563' };
    const pct = Math.round((temps.filter(t => t < 600).length / temps.length) * 100);
    return { val: `${pct}`, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' };
  }, [displayLogs, unlocked]);

  const conductivityStatus = useMemo(() => {
    if (!unlocked) return { label: 'Normal', sub: '1960 PPM (demo)', color: '#22c55e' };
    const ppm = avgNum(displayLogs, 'conductivityPPM');
    if (!ppm) return { label: '—', sub: 'No data', color: '#4b5563' };
    if (ppm > 2500) return { label: 'High', sub: `${ppm.toFixed(0)} PPM`, color: '#ef4444' };
    if (ppm < 500) return { label: 'Low', sub: `${ppm.toFixed(0)} PPM`, color: '#f59e0b' };
    return { label: 'Normal', sub: `${ppm.toFixed(0)} PPM`, color: '#22c55e' };
  }, [displayLogs, unlocked]);

  const avgDelta = useMemo(() => {
    if (!unlocked) return '218.4°F (demo)';
    const vals = displayLogs.slice(0, 30).map(l => parseFloat(l.supplyTemp) - parseFloat(l.returnTemp)).filter(v => !isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}°F` : '—';
  }, [displayLogs, unlocked]);

  const chartData = useMemo(() => {
    if (!unlocked) return DEMO_CHART;
    return [...logs].reverse().slice(0, 14).map(l => ({
      name: l.dateTime ? l.dateTime.slice(5, 10) : '—',
      stackTemp: parseFloat(l.supplyTemp) || null,
      conductivityPPM: parseFloat(l.conductivityPPM) || null,
    }));
  }, [logs, unlocked]);

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const checklist = useMemo(() => {
    if (!unlocked) return Array(6).fill('preview') as ('current' | 'due-soon' | 'overdue' | 'preview')[];
    const wk = displayLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    return [
      wk.some(l => /blowdown/i.test(l.description)) ? 'current' : 'overdue',
      wk.some(l => l.conductivityPPM && l.pH) ? 'current' : 'overdue',
      displayLogs.some(l => parseFloat(l.supplyTemp) < 600) ? 'current' : 'overdue',
      wk.some(l => l.supplyPSI) ? 'current' : 'due-soon',
      wk.some(l => l.waterLevel) ? 'current' : 'due-soon',
      displayLogs.some(l => l.timestamp >= monthStart.getTime() && /pm|preventive/i.test(l.description)) ? 'current' : 'due-soon',
    ] as ('current' | 'due-soon' | 'overdue' | 'preview')[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLogs, unlocked, weekStart, weekEnd]);

  const calc = useMemo(() => {
    const sT = parseFloat(stackTempCalc) || 0;
    const aT = parseFloat(ambientTemp) || 70;
    const bhp = bhpMode ? (parseFloat(inputBHP) || 0) : (parseFloat(inputBTU) || 0) / 33475;
    const fuelHeatValue = fuelType === 'gas' ? 1040 : fuelType === 'oil' ? 140 : 3412;
    const stackLoss = sT > 0 ? (0.24 * (sT - aT)) / fuelHeatValue * 100 : 0;
    const eff = Math.max(0, Math.min(100, 100 - stackLoss));
    const rating = eff > 85 ? 'Excellent' : eff > 78 ? 'Good' : eff > 70 ? 'Fair' : 'Poor';
    const rc = rating === 'Excellent' ? '#22c55e' : rating === 'Good' ? '#00FFE1' : rating === 'Fair' ? '#f59e0b' : '#ef4444';
    return { eff: eff.toFixed(1), effColor: rc, bhp: bhp.toFixed(2), steam: (bhp * 34.5).toFixed(1), kw: (bhp * 0.9811).toFixed(2), therms: ((bhp * 33475) / 100000).toFixed(3), rating, rc };
  }, [bhpMode, inputBHP, inputBTU, fuelType, stackTempCalc, ambientTemp]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unlocked) return;
    setSubmitting(true);
    const entry: BoilerLog = { id: crypto.randomUUID(), ...form, timestamp: Date.now() };
    const updated = [entry, ...logs];
    saveLogs('boiler', updated);
    try { await apiPost('/logs/boiler', entry); } catch { /* offline */ }
    setLogs(updated);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSubmitting(false);
  }

  const tableRows = unlocked ? logs : DEMO_LOGS;

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {!unlocked && <PreviewBanner tier="boiler" />}

      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(0,255,225,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
            <Thermometer size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Boiler Intelligence</h1>
            <p className="text-gray-600 text-xs">Combustion · Safety · Log Data · Analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Combustion Compliance</p>
            <p className="text-2xl font-bold" style={{ color: combustionScore.color }}>{combustionScore.val}{combustionScore.val !== '—' && combustionScore.val !== '94' ? '%' : combustionScore.val === '94' ? '%' : ''}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">stack temp in range</p>
          </div>
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Water Chemistry</p>
            <span className="inline-block text-sm font-bold px-2 py-0.5 rounded-full" style={{ color: conductivityStatus.color, background: `${conductivityStatus.color}18`, border: `1px solid ${conductivityStatus.color}40` }}>
              {conductivityStatus.label}
            </span>
            <p className="text-[10px] text-gray-700 mt-1.5">{conductivityStatus.sub}</p>
          </div>
          <div className="p-4" style={GLASS_TILE}>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Avg Delta Temp</p>
            <p className="text-lg font-bold truncate" style={{ color: ACCENT }}>{avgDelta}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">supply − return</p>
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

      <div className="px-7 border-b" style={{ borderColor: 'rgba(0,255,225,0.06)' }}>
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
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Stack Temp Trend °F {!unlocked && <span className="text-gray-700">(demo)</span>}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(0,255,225,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="stackTemp" stroke={ACCENT} strokeWidth={2} dot={false} connectNulls name="Stack Temp °F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Conductivity PPM {!unlocked && <span className="text-gray-700">(demo)</span>}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={45} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <defs>
                      <linearGradient id="condGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="conductivityPPM" stroke="#38bdf8" fill="url(#condGrad)" strokeWidth={2} dot={false} connectNulls name="Conductivity PPM" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-5 max-w-2xl" style={GLASS}>
              <div className="flex items-center gap-2.5 mb-4">
                <h3 className="font-display text-base font-semibold text-white">Boiler Compliance Checklist</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,225,0.1)', color: ACCENT, border: '1px solid rgba(0,255,225,0.25)' }}>
                  {unlocked ? `${checklist.filter(s => s === 'current').length}/6` : '6 items'}
                </span>
                {!unlocked && <span className="text-[10px] text-gray-600 italic">Purchase to track real status</span>}
              </div>
              {[
                'Blowdown logged this week',
                'Water chemistry tested (conductivity + pH logged)',
                'Stack temp within range',
                'Pressure readings logged',
                'Water level logged',
                'At least 1 PM entry this month',
              ].map((label, i) => <ChecklistItem key={label} label={label} status={checklist[i]} />)}
            </div>
          </div>
        )}

        {tab === 'Log Data' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{unlocked ? `${logs.length} entries logged` : 'Preview — 5 demo rows'}</p>
              <LockedInput locked={!unlocked} tier="boiler">
                <button onClick={() => unlocked && setShowForm(!showForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(0,255,225,0.08)', color: ACCENT, border: '1px solid rgba(0,255,225,0.18)' }}>
                  {showForm ? <ChevronDown size={14} /> : <Plus size={14} />}
                  {showForm ? 'Hide Form' : 'Add Entry'}
                </button>
              </LockedInput>
            </div>

            {showForm && unlocked && (
              <div className="mb-5 p-5" style={GLASS}>
                <h3 className="font-display text-base font-semibold text-white mb-4">New Boiler Log Entry</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {([
                      ['employeeName', 'Employee Name', 'text'],
                      ['title', 'Title', 'text'],
                      ['dateTime', 'Date & Time', 'datetime-local'],
                      ['supplyTemp', 'Supply Temp °F', 'number'],
                      ['returnTemp', 'Return Temp °F', 'number'],
                      ['supplyPSI', 'Supply PSI', 'number'],
                      ['returnPSI', 'Return PSI', 'number'],
                      ['mainPSI', 'Main PSI', 'number'],
                      ['waterLevel', 'Water Level %', 'number'],
                      ['conductivityPPM', 'Conductivity PPM', 'number'],
                      ['pH', 'pH', 'number'],
                      ['oilVolume', 'Oil Vol. (opt.)', 'number'],
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
                        placeholder="Blowdown boiler 1 routine — noticed drift in conductivity"
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        style={{ ...INPUT_STYLE, resize: 'none' }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.25)' }}>
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
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(0,255,225,0.12)' }}>
                      {['Employee', 'Title', 'Date / Desc', 'Supply°F', 'Return°F', 'S-PSI', 'R-PSI', 'Main PSI', 'Water%', 'Cond.PPM', 'pH', 'Week'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.15em] font-normal" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr><td colSpan={12} className="px-4 py-10 text-center text-gray-600 text-sm">No logs yet — add your first entry above.</td></tr>
                    ) : tableRows.map((log, idx) => (
                      <tr key={log.id} className="border-b font-mono text-sm text-gray-300 hover:bg-[rgba(0,255,225,0.02)] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-2 max-w-[100px] truncate">{log.employeeName || '—'}</td>
                        <td className="px-3 py-2 max-w-[80px] truncate">{log.title || '—'}</td>
                        <td className="px-3 py-2 max-w-[160px]">
                          <div className="text-[10px] text-gray-600">{log.dateTime || '—'}</div>
                          <div className="truncate text-xs text-gray-500">{log.description}</div>
                        </td>
                        <td className="px-3 py-2">{log.supplyTemp || '—'}</td>
                        <td className="px-3 py-2">{log.returnTemp || '—'}</td>
                        <td className="px-3 py-2">{log.supplyPSI || '—'}</td>
                        <td className="px-3 py-2">{log.returnPSI || '—'}</td>
                        <td className="px-3 py-2">{log.mainPSI || '—'}</td>
                        <td className="px-3 py-2">{log.waterLevel || '—'}</td>
                        <td className="px-3 py-2">{log.conductivityPPM || '—'}</td>
                        <td className="px-3 py-2">{log.pH || '—'}</td>
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
                    <Lock size={10} /> Demo data — purchase Boiler Intelligence to log real data
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'Calculator' && (
          <div className="max-w-3xl">
            <div className="p-6" style={GLASS}>
              <h2 className="font-display text-2xl font-bold text-white mb-1">Boiler Efficiency Calculator</h2>
              <p className="text-gray-600 text-xs mb-6">Free to calculate — no purchase required</p>
              <div className="flex gap-3 mb-5">
                {[{ label: 'BHP Input', val: true }, { label: 'BTU/hr Input', val: false }].map(({ label, val }) => (
                  <button key={label} onClick={() => setBhpMode(val)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={bhpMode === val ? { background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.3)' } : { background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label style={LABEL_STYLE}>{bhpMode ? 'Boiler HP (BHP)' : 'BTU/hr'}</label>
                  <input type="number" value={bhpMode ? inputBHP : inputBTU} onChange={e => bhpMode ? setInputBHP(e.target.value) : setInputBTU(e.target.value)} placeholder={bhpMode ? '150' : '5000000'} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Fuel Type</label>
                  <select value={fuelType} onChange={e => setFuelType(e.target.value as 'gas' | 'oil' | 'electric')} style={INPUT_STYLE}>
                    <option value="gas">Natural Gas</option>
                    <option value="oil">#2 Oil / #6 Oil</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Stack Temp °F</label>
                  <input type="number" value={stackTempCalc} onChange={e => setStackTempCalc(e.target.value)} placeholder="400" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Ambient Temp °F</label>
                  <input type="number" value={ambientTemp} onChange={e => setAmbientTemp(e.target.value)} placeholder="70" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>O₂ % in Flue Gas</label>
                  <input type="number" value={o2Pct} onChange={e => setO2Pct(e.target.value)} placeholder="3.5" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Steam Pressure PSI</label>
                  <input type="number" value={steamPSI} onChange={e => setSteamPSI(e.target.value)} placeholder="125" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Feedwater Temp °F</label>
                  <input type="number" value={feedwaterTemp} onChange={e => setFeedwaterTemp(e.target.value)} placeholder="180" style={INPUT_STYLE} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Combustion Efficiency', val: `${calc.eff}%`, color: calc.effColor, large: true },
                  { label: 'BHP', val: calc.bhp, color: ACCENT, large: false },
                  { label: 'Steam Output lbs/hr', val: calc.steam, color: ACCENT, large: false },
                  { label: 'kW Equivalent', val: calc.kw, color: ACCENT, large: false },
                  { label: 'Therms/hr', val: calc.therms, color: ACCENT, large: false },
                ].map(m => (
                  <div key={m.label} className="p-4" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{m.label}</p>
                    <p className={`${m.large ? 'text-3xl' : 'text-2xl'} font-bold`} style={{ color: m.color }}>{m.val}</p>
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
              {BOILER_INTELLIGENCE.documents.map((doc, i, arr) => (
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
                    ? <a href={`/library/${doc.file}`} target="_blank" rel="noreferrer" className="text-xs text-gray-700 hover:text-[#00FFE1] transition-colors">↓</a>
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
