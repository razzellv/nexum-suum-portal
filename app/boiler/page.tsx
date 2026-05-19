"use client";
import { useState, useEffect, useMemo } from "react";
import { Thermometer, ClipboardList, Calculator, BookOpen, Plus, ChevronDown } from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../components/AuthContext";
import { apiPost } from "../lib/api";
import { loadLogs, saveLogs } from "../lib/logData";
import { BOILER_INTELLIGENCE } from "../lib/products";

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

const TABS = ['Overview', 'Log Data', 'Calculator', 'Resources'] as const;
type Tab = typeof TABS[number];

const ACCENT = "#00FFE1";
const ACCENT_RGB = "0,255,225";

const EMPTY_FORM = {
  employeeName: '', title: '', description: '', dateTime: '',
  supplyTemp: '', returnTemp: '', supplyPSI: '', returnPSI: '',
  mainPSI: '', waterLevel: '', conductivityPPM: '', pH: '', oilVolume: '',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // offset to Monday
  const mon = new Date(now);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(now.getDate() + diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon.getTime(), end: sun.getTime() };
}

function avg(logs: BoilerLog[], key: keyof BoilerLog): string {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

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

export default function BoilerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Overview');
  const [logs, setLogs] = useState<BoilerLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Calculator state
  const [bhpMode, setBhpMode] = useState(true);
  const [inputBHP, setInputBHP] = useState('');
  const [inputBTU, setInputBTU] = useState('');
  const [fuelType, setFuelType] = useState<'gas' | 'oil' | 'electric'>('gas');
  const [stackTemp, setStackTemp] = useState('');
  const [ambientTemp, setAmbientTemp] = useState('70');
  const [o2Pct, setO2Pct] = useState('');
  const [steamPSI, setSteamPSI] = useState('');
  const [feedwaterTemp, setFeedwaterTemp] = useState('');

  useEffect(() => {
    setLogs(loadLogs<BoilerLog>('boiler'));
  }, []);

  const { start: weekStart, end: weekEnd } = getWeekRange();

  const avgStackTemp = avg(logs, 'supplyTemp');
  const avgConductivity = avg(logs, 'conductivityPPM');
  const avgWaterLevel = avg(logs, 'waterLevel');
  const logsThisWeek = logs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  const chartData = useMemo(() => {
    return [...logs].reverse().slice(0, 20).map(l => ({
      name: l.dateTime ? l.dateTime.slice(0, 10) : '—',
      waterLevel: parseFloat(l.waterLevel) || null,
      conductivityPPM: parseFloat(l.conductivityPPM) || null,
      deltaTemp: (parseFloat(l.supplyTemp) - parseFloat(l.returnTemp)) || null,
      oilVolume: parseFloat(l.oilVolume) || null,
    }));
  }, [logs]);

  const hasOilData = logs.some(l => l.oilVolume && parseFloat(l.oilVolume) > 0);

  // Calculator computations
  const calc = useMemo(() => {
    const sT = parseFloat(stackTemp) || 0;
    const aT = parseFloat(ambientTemp) || 70;
    const bhp = bhpMode ? (parseFloat(inputBHP) || 0) : (parseFloat(inputBTU) || 0) / 33475;
    const fuelHeatValue = fuelType === 'gas' ? 1040 : fuelType === 'oil' ? 140 : 3412;
    const stackLoss = sT > 0 ? (0.24 * (sT - aT)) / fuelHeatValue * 100 : 0;
    const combEfficiency = Math.max(0, Math.min(100, 100 - stackLoss));
    const steamOutput = bhp * 34.5;
    const kwEquiv = bhp * 0.9811;
    const thermsPerHr = (bhp * 33475) / 100000;
    const rating = combEfficiency > 85 ? 'Excellent' : combEfficiency > 78 ? 'Good' : combEfficiency > 70 ? 'Fair' : 'Poor';
    const effColor = combEfficiency > 85 ? '#22c55e' : combEfficiency > 78 ? '#00FFE1' : combEfficiency > 70 ? '#f59e0b' : '#ef4444';
    const ratingColor = rating === 'Excellent' ? '#22c55e' : rating === 'Good' ? '#00FFE1' : rating === 'Fair' ? '#f59e0b' : '#ef4444';
    return { combEfficiency: combEfficiency.toFixed(1), bhp: bhp.toFixed(2), steamOutput: steamOutput.toFixed(1), kwEquiv: kwEquiv.toFixed(2), thermsPerHr: thermsPerHr.toFixed(3), rating, effColor, ratingColor };
  }, [bhpMode, inputBHP, inputBTU, fuelType, stackTemp, ambientTemp]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const entry: BoilerLog = {
      id: crypto.randomUUID(),
      ...form,
      timestamp: Date.now(),
    };
    const updated = [entry, ...logs];
    saveLogs('boiler', updated);
    try { await apiPost('/logs/boiler', entry); } catch { /* offline */ }
    setLogs(updated);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSubmitting(false);
  }

  function logsThisWeekByEmployee(name: string) {
    return logs.filter(l => l.employeeName === name && l.timestamp >= weekStart && l.timestamp <= weekEnd).length;
  }

  const canAccess = user && (user.tier === 'boiler' || user.tier === 'facility');

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-4 text-sm">Sign in to access Boiler Intelligence.</p>
    </div>
  );
  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-2 text-sm">Boiler Intelligence requires the Boiler or Facility tier.</p>
      <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
        className="px-4 py-2 rounded-xl text-sm font-bold mt-3" style={{ background: ACCENT, color: '#001923' }}>Upgrade Tier →</a>
    </div>
  );

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(0,255,225,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
            <Thermometer size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Boiler Intelligence</h1>
            <p className="text-gray-600 text-xs">Combustion · Safety · Log Data · Analytics</p>
          </div>
        </div>

        {/* 4 stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg Stack Temp', val: avgStackTemp, unit: '°F' },
            { label: 'Avg Conductivity', val: avgConductivity, unit: 'PPM' },
            { label: 'Avg Water Level', val: avgWaterLevel, unit: '%' },
            { label: 'Logs This Week', val: logsThisWeek.toString(), unit: '' },
          ].map(t => (
            <div key={t.label} className="p-4" style={GLASS_TILE}>
              <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{t.label}</p>
              <p className="text-2xl font-bold" style={{ color: ACCENT }}>{t.val}</p>
              {t.unit && <p className="text-[10px] text-gray-700 mt-0.5">{t.unit}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-7 border-b" style={{ borderColor: 'rgba(0,255,225,0.06)' }}>
        <div className="flex gap-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={tab === t ? { color: ACCENT, borderColor: ACCENT } : { color: 'rgba(148,163,184,0.45)', borderColor: 'transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-7 py-6">

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Chart 1: Water Level */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Water Level %</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(0,255,225,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <defs>
                      <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFE1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00FFE1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="waterLevel" stroke="#00FFE1" fill="url(#wlGrad)" strokeWidth={2} dot={false} connectNulls name="Water Level %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Conductivity */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Conductivity PPM</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="conductivityPPM" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls name="Conductivity PPM" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Delta Temp */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Delta Temp (Supply - Return) °F</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Bar dataKey="deltaTemp" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Delta Temp °F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 4: Oil Volume (conditional) */}
              {hasOilData && (
                <div className="p-4" style={GLASS}>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Oil Volume</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                      <defs>
                        <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="oilVolume" stroke="#a78bfa" fill="url(#oilGrad)" strokeWidth={2} dot={false} connectNulls name="Oil Volume" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOG DATA */}
        {tab === 'Log Data' && (
          <div>
            {/* Add Entry button */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{logs.length} entries logged</p>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(0,255,225,0.08)', color: ACCENT, border: '1px solid rgba(0,255,225,0.18)' }}>
                {showForm ? <ChevronDown size={14} /> : <Plus size={14} />}
                {showForm ? 'Hide Form' : 'Add Entry'}
              </button>
            </div>

            {/* Add log form */}
            {showForm && (
              <div className="mb-5 p-5" style={GLASS}>
                <h3 className="font-display text-base font-semibold text-white mb-4">New Boiler Log Entry</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {[
                      { key: 'employeeName', label: 'Employee Name', type: 'text' },
                      { key: 'title', label: 'Title', type: 'text' },
                      { key: 'dateTime', label: 'Date & Time', type: 'datetime-local' },
                      { key: 'supplyTemp', label: 'Supply Temp °F', type: 'number' },
                      { key: 'returnTemp', label: 'Return Temp °F', type: 'number' },
                      { key: 'supplyPSI', label: 'Supply PSI', type: 'number' },
                      { key: 'returnPSI', label: 'Return PSI', type: 'number' },
                      { key: 'mainPSI', label: 'Main PSI', type: 'number' },
                      { key: 'waterLevel', label: 'Water Level %', type: 'number' },
                      { key: 'conductivityPPM', label: 'Conductivity PPM', type: 'number' },
                      { key: 'pH', label: 'pH', type: 'number' },
                      { key: 'oilVolume', label: 'Oil Volume (opt.)', type: 'number' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label style={LABEL_STYLE}>{label}</label>
                        <input type={type} value={(form as Record<string, string>)[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          style={INPUT_STYLE} />
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
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.25)' }}>
                      {submitting ? 'Saving…' : 'Submit Entry →'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 rounded-xl text-sm text-gray-500"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Neon table */}
            {logs.length === 0 ? (
              <div className="p-10 text-center" style={GLASS}>
                <p className="text-gray-600 text-sm">No logs yet — add your first entry above.</p>
              </div>
            ) : (
              <div style={GLASS}>
                {/* Header */}
                <div className="grid px-4 py-2 border-b" style={{
                  gridTemplateColumns: '1fr 1fr 2fr 80px 80px 70px 70px 80px 80px 80px 50px 90px',
                  borderColor: 'rgba(0,255,225,0.12)',
                }}>
                  {['Employee', 'Title', 'Timestamp / Desc', 'Supply°F', 'Return°F', 'S PSI', 'R PSI', 'Main PSI', 'Water%', 'Cond.PPM', 'pH', 'This Week'].map(h => (
                    <span key={h} className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'rgba(0,255,225,0.5)' }}>{h}</span>
                  ))}
                </div>
                {logs.map(log => {
                  const weekCount = logsThisWeekByEmployee(log.employeeName);
                  return (
                    <div key={log.id} className="grid px-4 py-2 border-b transition-colors hover:bg-[rgba(0,255,225,0.025)] font-mono text-sm text-gray-300"
                      style={{
                        gridTemplateColumns: '1fr 1fr 2fr 80px 80px 70px 70px 80px 80px 80px 50px 90px',
                        borderColor: 'rgba(255,255,255,0.04)',
                      }}>
                      <span className="truncate">{log.employeeName || '—'}</span>
                      <span className="truncate">{log.title || '—'}</span>
                      <div className="truncate">
                        <div className="text-[10px] text-gray-600">{log.dateTime || '—'}</div>
                        <div className="truncate text-xs text-gray-500">{log.description}</div>
                      </div>
                      <span>{log.supplyTemp || '—'}</span>
                      <span>{log.returnTemp || '—'}</span>
                      <span>{log.supplyPSI || '—'}</span>
                      <span>{log.returnPSI || '—'}</span>
                      <span>{log.mainPSI || '—'}</span>
                      <span>{log.waterLevel || '—'}</span>
                      <span>{log.conductivityPPM || '—'}</span>
                      <span>{log.pH || '—'}</span>
                      <span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ border: '1px solid rgba(0,255,225,0.3)', color: ACCENT }}>
                          {weekCount}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CALCULATOR */}
        {tab === 'Calculator' && (
          <div className="max-w-3xl">
            <div className="p-6" style={GLASS}>
              <h2 className="font-display text-2xl font-bold text-white mb-6">Boiler Efficiency Calculator</h2>

              {/* Input mode toggle */}
              <div className="flex gap-3 mb-5">
                <button onClick={() => setBhpMode(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={bhpMode ? { background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                  BHP Input
                </button>
                <button onClick={() => setBhpMode(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={!bhpMode ? { background: 'rgba(0,255,225,0.12)', color: ACCENT, border: '1px solid rgba(0,255,225,0.3)' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                  BTU/hr Input
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label style={LABEL_STYLE}>{bhpMode ? 'Boiler HP (BHP)' : 'BTU/hr Input'}</label>
                  <input type="number" value={bhpMode ? inputBHP : inputBTU}
                    onChange={e => bhpMode ? setInputBHP(e.target.value) : setInputBTU(e.target.value)}
                    placeholder={bhpMode ? '150' : '5000000'} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Fuel Type</label>
                  <select value={fuelType} onChange={e => setFuelType(e.target.value as 'gas' | 'oil' | 'electric')}
                    style={INPUT_STYLE}>
                    <option value="gas">Natural Gas</option>
                    <option value="oil">Fuel Oil</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Stack Temp °F</label>
                  <input type="number" value={stackTemp} onChange={e => setStackTemp(e.target.value)} placeholder="400" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Ambient Temp °F</label>
                  <input type="number" value={ambientTemp} onChange={e => setAmbientTemp(e.target.value)} placeholder="70" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>O₂ % (optional)</label>
                  <input type="number" value={o2Pct} onChange={e => setO2Pct(e.target.value)} placeholder="3.5" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Steam PSI (optional)</label>
                  <input type="number" value={steamPSI} onChange={e => setSteamPSI(e.target.value)} placeholder="125" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Feedwater Temp °F (opt.)</label>
                  <input type="number" value={feedwaterTemp} onChange={e => setFeedwaterTemp(e.target.value)} placeholder="180" style={INPUT_STYLE} />
                </div>
              </div>

              {/* Output tiles 2x3 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-4 md:col-span-1" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Combustion Efficiency</p>
                  <p className="text-3xl font-bold" style={{ color: calc.effColor }}>{calc.combEfficiency}%</p>
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">BHP</p>
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{calc.bhp}</p>
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Steam Output lbs/hr</p>
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{calc.steamOutput}</p>
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">kW Equivalent</p>
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{calc.kwEquiv}</p>
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Therms/hr</p>
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{calc.thermsPerHr}</p>
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Rating</p>
                  <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${calc.ratingColor}18`, color: calc.ratingColor, border: `1px solid ${calc.ratingColor}40` }}>
                    {calc.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {tab === 'Resources' && (
          <div className="max-w-3xl">
            <div style={GLASS}>
              {BOILER_INTELLIGENCE.documents.map((doc, i, arr) => (
                <a key={doc.file} href={`/library/${doc.file}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-all group"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,255,225,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === 'pdf' ? '#fb923c' : doc.type === 'xlsx' ? '#34d399' : '#60a5fa', background: 'rgba(255,255,255,0.05)' }}>
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
