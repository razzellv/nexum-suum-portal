"use client";
import { useState, useEffect, useMemo } from "react";
import { Snowflake, Plus, ChevronDown } from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "../../components/AuthContext";
import { apiPost } from "../lib/api";
import { loadLogs, saveLogs } from "../lib/logData";
import { CHILLER_INTELLIGENCE } from "../lib/products";

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

const TABS = ['Overview', 'Log Data', 'Calculator', 'Resources'] as const;
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

function avg(logs: ChillerLog[], key: keyof ChillerLog): string {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

function avgDelta(logs: ChillerLog[], keyA: keyof ChillerLog, keyB: keyof ChillerLog): string {
  const vals = logs.map(l => parseFloat(l[keyA] as string) - parseFloat(l[keyB] as string)).filter(v => !isNaN(v));
  if (!vals.length) return '—';
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}

export default function ChillerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Overview');
  const [logs, setLogs] = useState<ChillerLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  // Calculator state
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

  const avgCWDelta = avgDelta(logs, 'cwReturnTemp', 'cwSupplyTemp');
  const avgCondDelta = avgDelta(logs, 'condReturnTemp', 'condSupplyTemp');
  const avgBasinLevel = avg(logs, 'basinLevel');
  const logsThisWeek = logs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  const chartData = useMemo(() => {
    return [...logs].reverse().slice(0, 20).map(l => ({
      name: l.dateTime ? l.dateTime.slice(0, 10) : '—',
      cwSupplyTemp: parseFloat(l.cwSupplyTemp) || null,
      cwReturnTemp: parseFloat(l.cwReturnTemp) || null,
      condDelta: (parseFloat(l.condReturnTemp) - parseFloat(l.condSupplyTemp)) || null,
      basinLevel: parseFloat(l.basinLevel) || null,
      oilVolume: parseFloat(l.oilVolume) || null,
    }));
  }, [logs]);

  const hasOilData = logs.some(l => l.oilVolume && parseFloat(l.oilVolume) > 0);

  // Calculator
  const calc = useMemo(() => {
    const tons = parseFloat(coolingTons) || 0;
    const kw = parseFloat(compressorKW) || 0;
    const cws = parseFloat(cwSupply) || 0;
    const cwr = parseFloat(cwReturn) || 0;
    const gpm = parseFloat(flowRateGPM) || 0;
    const rate = parseFloat(electricityRate) || 0.12;

    const cop = kw > 0 && tons > 0 ? (tons * 3.517) / kw : 0;
    const eer = cop * 3.412;
    const kwPerTon = tons > 0 && kw > 0 ? kw / tons : 0;
    const btuPerHr = gpm > 0 ? gpm * 500 * (cwr - cws) : 0;
    const costPerHr = kw * rate;
    const costPerDay = costPerHr * 24;
    const rating = cop > 5.5 ? 'Excellent' : cop > 4 ? 'Good' : cop > 3 ? 'Fair' : 'Poor';
    const ratingColor = rating === 'Excellent' ? '#22c55e' : rating === 'Good' ? '#00FFE1' : rating === 'Fair' ? '#f59e0b' : '#ef4444';
    return {
      cop: cop.toFixed(2), eer: eer.toFixed(2), kwPerTon: kwPerTon.toFixed(3),
      btuPerHr: btuPerHr.toFixed(0), costPerHr: costPerHr.toFixed(2), costPerDay: costPerDay.toFixed(2),
      rating, ratingColor,
    };
  }, [coolingTons, compressorKW, cwSupply, cwReturn, flowRateGPM, condSupply, condReturn, electricityRate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const entry: ChillerLog = {
      id: crypto.randomUUID(),
      ...form,
      timestamp: Date.now(),
    };
    const updated = [entry, ...logs];
    saveLogs('chiller', updated);
    try { await apiPost('/logs/chiller', entry); } catch { /* offline */ }
    setLogs(updated);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setSubmitting(false);
  }

  function logsThisWeekByEmployee(name: string) {
    return logs.filter(l => l.employeeName === name && l.timestamp >= weekStart && l.timestamp <= weekEnd).length;
  }

  const canAccess = user && (user.tier === 'chiller' || user.tier === 'facility');

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-4 text-sm">Sign in to access Chiller Intelligence.</p>
    </div>
  );
  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-2 text-sm">Chiller Intelligence requires the Chiller or Facility tier.</p>
      <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
        className="px-4 py-2 rounded-xl text-sm font-bold mt-3" style={{ background: ACCENT, color: '#001923' }}>Upgrade Tier →</a>
    </div>
  );

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: `rgba(${ACCENT_RGB},0.06)` }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
            <Snowflake size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Chiller Intelligence</h1>
            <p className="text-gray-600 text-xs">Chilled Water · Cooling Tower · Refrigerant</p>
          </div>
        </div>

        {/* 4 stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Avg CW Delta', val: avgCWDelta, unit: '°F' },
            { label: 'Avg Cond. Delta', val: avgCondDelta, unit: '°F' },
            { label: 'Avg Basin Level', val: avgBasinLevel, unit: '%' },
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
      <div className="px-7 border-b" style={{ borderColor: `rgba(${ACCENT_RGB},0.06)` }}>
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
              {/* Chart 1: Dual CW temps */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">CW Supply / Return Temps °F</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#6b7280' }} />
                    <Line type="monotone" dataKey="cwSupplyTemp" stroke="#00FFE1" strokeWidth={2} dot={false} connectNulls name="CW Supply" />
                    <Line type="monotone" dataKey="cwReturnTemp" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls name="CW Return" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Condenser delta */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Condenser Delta °F</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <defs>
                      <linearGradient id="condGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="condDelta" stroke="#fbbf24" fill="url(#condGrad)" strokeWidth={2} dot={false} connectNulls name="Cond. Delta" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Basin Level */}
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Basin Level %</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Bar dataKey="basinLevel" fill="#34d399" radius={[4, 4, 0, 0]} name="Basin Level %" />
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
                        <linearGradient id="oilChGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="oilVolume" stroke="#a78bfa" fill="url(#oilChGrad)" strokeWidth={2} dot={false} connectNulls name="Oil Volume" />
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{logs.length} entries logged</p>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: `rgba(${ACCENT_RGB},0.08)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
                {showForm ? <ChevronDown size={14} /> : <Plus size={14} />}
                {showForm ? 'Hide Form' : 'Add Entry'}
              </button>
            </div>

            {showForm && (
              <div className="mb-5 p-5" style={GLASS}>
                <h3 className="font-display text-base font-semibold text-white mb-4">New Chiller Log Entry</h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {[
                      { key: 'employeeName', label: 'Employee Name', type: 'text' },
                      { key: 'title', label: 'Title', type: 'text' },
                      { key: 'dateTime', label: 'Date & Time', type: 'datetime-local' },
                      { key: 'cwSupplyTemp', label: 'CW Supply Temp °F', type: 'number' },
                      { key: 'cwReturnTemp', label: 'CW Return Temp °F', type: 'number' },
                      { key: 'condSupplyTemp', label: 'Cond. Supply Temp °F', type: 'number' },
                      { key: 'condReturnTemp', label: 'Cond. Return Temp °F', type: 'number' },
                      { key: 'supplyPSI', label: 'Supply PSI', type: 'number' },
                      { key: 'returnPSI', label: 'Return PSI', type: 'number' },
                      { key: 'refSuctionTemp', label: 'Ref. Suction Temp °F', type: 'number' },
                      { key: 'refDischargeTemp', label: 'Ref. Discharge Temp °F', type: 'number' },
                      { key: 'basinLevel', label: 'Basin Level %', type: 'number' },
                      { key: 'hardness', label: 'Hardness PPM (opt.)', type: 'number' },
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
                      style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.25)` }}>
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
                <div className="grid px-4 py-2 border-b" style={{
                  gridTemplateColumns: '1fr 1fr 2fr 80px 80px 70px 70px 120px 80px 90px 90px',
                  borderColor: `rgba(${ACCENT_RGB},0.12)`,
                }}>
                  {['Employee', 'Title', 'Timestamp / Desc', 'CW Supply', 'CW Return', 'S PSI', 'R PSI', 'Ref Temps', 'Basin%', 'Hardness', 'This Week'].map(h => (
                    <span key={h} className="text-[10px] uppercase tracking-[0.15em]" style={{ color: `rgba(${ACCENT_RGB},0.5)` }}>{h}</span>
                  ))}
                </div>
                {logs.map(log => {
                  const weekCount = logsThisWeekByEmployee(log.employeeName);
                  return (
                    <div key={log.id} className="grid px-4 py-2 border-b transition-colors font-mono text-sm text-gray-300"
                      style={{
                        gridTemplateColumns: '1fr 1fr 2fr 80px 80px 70px 70px 120px 80px 90px 90px',
                        borderColor: 'rgba(255,255,255,0.04)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `rgba(${ACCENT_RGB},0.025)`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}>
                      <span className="truncate">{log.employeeName || '—'}</span>
                      <span className="truncate">{log.title || '—'}</span>
                      <div className="truncate">
                        <div className="text-[10px] text-gray-600">{log.dateTime || '—'}</div>
                        <div className="truncate text-xs text-gray-500">{log.description}</div>
                      </div>
                      <span>{log.cwSupplyTemp || '—'}</span>
                      <span>{log.cwReturnTemp || '—'}</span>
                      <span>{log.supplyPSI || '—'}</span>
                      <span>{log.returnPSI || '—'}</span>
                      <span className="text-xs">{log.refSuctionTemp && log.refDischargeTemp ? `${log.refSuctionTemp}°F / ${log.refDischargeTemp}°F` : '—'}</span>
                      <span>{log.basinLevel || '—'}</span>
                      <span>{log.hardness || '—'}</span>
                      <span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ border: `1px solid rgba(${ACCENT_RGB},0.3)`, color: ACCENT }}>
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
              <h2 className="font-display text-2xl font-bold text-white mb-6">Chiller Efficiency Calculator</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Cooling Tons', val: coolingTons, set: setCoolingTons, ph: '500' },
                  { label: 'Compressor kW', val: compressorKW, set: setCompressorKW, ph: '300' },
                  { label: 'CW Supply °F', val: cwSupply, set: setCwSupply, ph: '44' },
                  { label: 'CW Return °F', val: cwReturn, set: setCwReturn, ph: '54' },
                  { label: 'Flow Rate GPM', val: flowRateGPM, set: setFlowRateGPM, ph: '1200' },
                  { label: 'Cond. Supply °F', val: condSupply, set: setCondSupply, ph: '85' },
                  { label: 'Cond. Return °F', val: condReturn, set: setCondReturn, ph: '95' },
                  { label: 'Electricity Rate $/kWh', val: electricityRate, set: setElectricityRate, ph: '0.12' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={LABEL_STYLE}>{label}</label>
                    <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph} style={INPUT_STYLE} />
                  </div>
                ))}
              </div>

              {/* Output tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'COP', val: calc.cop, color: ACCENT },
                  { label: 'EER', val: calc.eer, color: ACCENT },
                  { label: 'kW/Ton', val: calc.kwPerTon, color: ACCENT },
                  { label: 'BTU/hr', val: Number(calc.btuPerHr).toLocaleString(), color: ACCENT },
                  { label: 'Cost/hr', val: `$${calc.costPerHr}`, color: '#fbbf24' },
                  { label: 'Cost/day', val: `$${calc.costPerDay}`, color: '#fbbf24' },
                ].map(t => (
                  <div key={t.label} className="p-4" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{t.label}</p>
                    <p className="text-xl font-bold" style={{ color: t.color }}>{t.val}</p>
                  </div>
                ))}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Rating</p>
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
              {CHILLER_INTELLIGENCE.documents.map((doc, i, arr) => (
                <a key={doc.file} href={`/library/${doc.file}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-all group"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `rgba(${ACCENT_RGB},0.02)`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === 'pdf' ? '#fb923c' : doc.type === 'xlsx' ? '#34d399' : '#60a5fa', background: 'rgba(255,255,255,0.05)' }}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{doc.label}</span>
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-sky-400 transition-colors">↓</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
