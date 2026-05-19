"use client";
import { useState, useEffect, useMemo } from "react";
import { Building2, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../components/AuthContext";
import { loadLogs, saveLogs } from "../lib/logData";
import { FACILITY_INTELLIGENCE } from "../lib/products";
import ProbabilityFeed from "../../components/ProbabilityFeed";

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

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'rgba(148,163,184,0.5)',
  marginBottom: '4px',
};

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

interface VirtuousEntry {
  id: string;
  inspectionType: string;
  finding: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  timestamp: number;
}

const TABS = ['Overview', 'VirtuousBoard', 'Diagnostics', 'Resources'] as const;
type Tab = typeof TABS[number];

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

function numAvg(logs: { [key: string]: string | number }[], key: string): number {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function fmtAvg(val: number): string {
  return val > 0 ? val.toFixed(1) : '—';
}

function colorDrift(diff: number): string {
  const abs = Math.abs(diff);
  if (abs <= 1) return '#22c55e';
  if (abs <= 3) return '#f59e0b';
  return '#ef4444';
}

export default function FacilityPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Overview');
  const [boilerLogs, setBoilerLogs] = useState<BoilerLog[]>([]);
  const [chillerLogs, setChillerLogs] = useState<ChillerLog[]>([]);
  const [virtEntries, setVirtEntries] = useState<VirtuousEntry[]>([]);

  // Drift analyzer state
  const [oat, setOat] = useState('');
  const [boilerSupplyTarget, setBoilerSupplyTarget] = useState('180');
  const [boilerReturnTarget, setBoilerReturnTarget] = useState('160');
  const [chillerSupplyTarget, setChillerSupplyTarget] = useState('44');
  const [chillerReturnTarget, setChillerReturnTarget] = useState('54');

  // Weekly compliance state
  const [logThreshold] = useState(5);

  // VirtuousBoard form
  const [vForm, setVForm] = useState({ inspectionType: 'Boiler Log', finding: '', severity: 'low', status: 'open' });
  const [vSubmitting, setVSubmitting] = useState(false);

  useEffect(() => {
    setBoilerLogs(loadLogs<BoilerLog>('boiler'));
    setChillerLogs(loadLogs<ChillerLog>('chiller'));
    try {
      const raw = localStorage.getItem('fi_virtuous');
      if (raw) setVirtEntries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const { start: weekStart, end: weekEnd } = getWeekRange();

  // Boiler averages
  const bAvgCondPPM = fmtAvg(numAvg(boilerLogs as unknown as { [key: string]: string | number }[], 'conductivityPPM'));
  const bAvgWaterLevel = fmtAvg(numAvg(boilerLogs as unknown as { [key: string]: string | number }[], 'waterLevel'));
  const bAvgDelta = useMemo(() => {
    const vals = boilerLogs.map(l => parseFloat(l.supplyTemp) - parseFloat(l.returnTemp)).filter(v => !isNaN(v));
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [boilerLogs]);
  const bLogsWeek = boilerLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  // Chiller averages
  const cAvgCWDelta = useMemo(() => {
    const vals = chillerLogs.map(l => parseFloat(l.cwReturnTemp) - parseFloat(l.cwSupplyTemp)).filter(v => !isNaN(v));
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [chillerLogs]);
  const cAvgCondDelta = useMemo(() => {
    const vals = chillerLogs.map(l => parseFloat(l.condReturnTemp) - parseFloat(l.condSupplyTemp)).filter(v => !isNaN(v));
    if (!vals.length) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [chillerLogs]);
  const cAvgBasin = fmtAvg(numAvg(chillerLogs as unknown as { [key: string]: string | number }[], 'basinLevel'));
  const cLogsWeek = chillerLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  // Chart data
  const boilerChartData = useMemo(() => {
    return [...boilerLogs].reverse().slice(0, 20).map(l => ({
      name: l.dateTime ? l.dateTime.slice(0, 10) : '—',
      conductivity: parseFloat(l.conductivityPPM) || null,
    }));
  }, [boilerLogs]);

  const chillerChartData = useMemo(() => {
    return [...chillerLogs].reverse().slice(0, 20).map(l => ({
      name: l.dateTime ? l.dateTime.slice(0, 10) : '—',
      cwDelta: (parseFloat(l.cwReturnTemp) - parseFloat(l.cwSupplyTemp)) || null,
    }));
  }, [chillerLogs]);

  // Drift analyzer
  const lastBoiler = boilerLogs[0];
  const lastChiller = chillerLogs[0];

  const actualBoilerDelta = lastBoiler ? parseFloat(lastBoiler.supplyTemp) - parseFloat(lastBoiler.returnTemp) : null;
  const targetBoilerDelta = parseFloat(boilerSupplyTarget) - parseFloat(boilerReturnTarget);
  const actualChillerCWDelta = lastChiller ? parseFloat(lastChiller.cwReturnTemp) - parseFloat(lastChiller.cwSupplyTemp) : null;
  const targetChillerDelta = parseFloat(chillerReturnTarget) - parseFloat(chillerSupplyTarget);
  const actualCondDelta = lastChiller ? parseFloat(lastChiller.condReturnTemp) - parseFloat(lastChiller.condSupplyTemp) : null;

  // Weekly compliance
  const boilerLogsWeek = boilerLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
  const chillerLogsWeek = chillerLogs.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
  const allLogsWeek = [...boilerLogsWeek, ...chillerLogsWeek];

  const pmCount = allLogsWeek.filter(l =>
    /pm|preventive|maintenance/i.test((l as { description: string }).description || '')
  ).length;

  const lastBoilerCond = lastBoiler ? parseFloat(lastBoiler.conductivityPPM) : null;
  const lastBoilerPH = lastBoiler ? parseFloat(lastBoiler.pH) : null;
  const lastChillerHardness = lastChiller ? parseFloat((lastChiller as { hardness: string }).hardness || '0') : null;

  const openItems = allLogsWeek.filter(l =>
    /drift|critical|high|low|flag/i.test((l as { description: string }).description || '')
  ).length;

  const oatVal = parseFloat(oat);
  const oatEstimate = !isNaN(oatVal) ? (Math.abs(oatVal - 65) * 0.1).toFixed(1) : null;

  async function handleVirtuousSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVSubmitting(true);
    const entry: VirtuousEntry = {
      id: crypto.randomUUID(),
      inspectionType: vForm.inspectionType,
      finding: vForm.finding,
      severity: vForm.severity as VirtuousEntry['severity'],
      status: vForm.status as VirtuousEntry['status'],
      timestamp: Date.now(),
    };
    const updated = [entry, ...virtEntries];
    setVirtEntries(updated);
    localStorage.setItem('fi_virtuous', JSON.stringify(updated));
    setVForm({ inspectionType: 'Boiler Log', finding: '', severity: 'low', status: 'open' });
    setVSubmitting(false);
  }

  const canAccess = user && user.tier === 'facility';

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-4 text-sm">Sign in to access Facility Intelligence.</p>
    </div>
  );
  if (!canAccess) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <p className="text-gray-500 mb-2 text-sm">Facility Intelligence requires the Facility tier.</p>
      <a href="https://nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
        className="px-4 py-2 rounded-xl text-sm font-bold mt-3" style={{ background: '#fbbf24', color: '#001923' }}>Upgrade to Facility Tier →</a>
    </div>
  );

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(251,191,36,0.06)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}>
            <Building2 size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Facility Intelligence Lite</h1>
            <p className="text-gray-500 text-sm mt-0.5">Combined boiler &amp; chiller oversight — weekly compliance, drift analysis, water chemistry</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-7 border-b" style={{ borderColor: 'rgba(251,191,36,0.06)' }}>
        <div className="flex gap-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px"
              style={tab === t ? { color: '#fbbf24', borderColor: '#fbbf24' } : { color: 'rgba(148,163,184,0.45)', borderColor: 'transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-7 py-6">

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div>
            {/* 8 stat tiles — 2 rows of 4 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {/* Row 1: Boiler (teal) */}
              {[
                { label: 'Boiler Avg Cond. PPM', val: bAvgCondPPM, color: '#00FFE1' },
                { label: 'Boiler Avg Water Level %', val: bAvgWaterLevel, color: '#00FFE1' },
                { label: 'Boiler Avg Delta Temp °F', val: bAvgDelta, color: '#00FFE1' },
                { label: 'Boiler Logs This Week', val: bLogsWeek.toString(), color: '#00FFE1' },
                { label: 'Chiller Avg CW Delta °F', val: cAvgCWDelta, color: '#38bdf8' },
                { label: 'Chiller Avg Cond. Delta °F', val: cAvgCondDelta, color: '#38bdf8' },
                { label: 'Chiller Basin Level %', val: cAvgBasin, color: '#38bdf8' },
                { label: 'Chiller Logs This Week', val: cLogsWeek.toString(), color: '#38bdf8' },
              ].map(t => (
                <div key={t.label} className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{t.label}</p>
                  <p className="text-2xl font-bold" style={{ color: t.color }}>{t.val}</p>
                </div>
              ))}
            </div>

            {/* 2 charts side by side */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Boiler Conductivity Trend</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={boilerChartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(0,255,225,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="conductivity" stroke="#00FFE1" strokeWidth={2} dot={false} connectNulls name="Conductivity PPM" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4" style={GLASS}>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Chiller CW Delta Trend</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chillerChartData}>
                    <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ background: '#0a1929', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 8, color: '#e2e8f0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="cwDelta" stroke="#38bdf8" strokeWidth={2} dot={false} connectNulls name="CW Delta °F" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* VIRTUOUSBOARD */}
        {tab === 'VirtuousBoard' && (
          <div>
            {/* Drift Analyzer */}
            <div className="p-6 mb-6" style={GLASS}>
              <h2 className="font-display text-xl font-semibold text-white mb-4">System Drift Analyzer</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                <div>
                  <label style={LABEL_STYLE}>OAT °F (outside air)</label>
                  <input type="number" value={oat} onChange={e => setOat(e.target.value)} placeholder="65" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Boiler Supply Target °F</label>
                  <input type="number" value={boilerSupplyTarget} onChange={e => setBoilerSupplyTarget(e.target.value)} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Boiler Return Target °F</label>
                  <input type="number" value={boilerReturnTarget} onChange={e => setBoilerReturnTarget(e.target.value)} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Chiller Supply Target °F</label>
                  <input type="number" value={chillerSupplyTarget} onChange={e => setChillerSupplyTarget(e.target.value)} style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Chiller Return Target °F</label>
                  <input type="number" value={chillerReturnTarget} onChange={e => setChillerReturnTarget(e.target.value)} style={INPUT_STYLE} />
                </div>
              </div>

              {/* Drift result cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Boiler Supply Delta</p>
                  {actualBoilerDelta !== null && !isNaN(actualBoilerDelta) ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: colorDrift(actualBoilerDelta - targetBoilerDelta) }}>
                        {actualBoilerDelta.toFixed(1)}°F
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Target: {targetBoilerDelta}°F delta · Drift: {(actualBoilerDelta - targetBoilerDelta).toFixed(1)}°F</p>
                    </>
                  ) : <p className="text-gray-600 text-sm">No boiler data</p>}
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Boiler Return Delta</p>
                  {lastBoiler && parseFloat(lastBoiler.returnTemp) > 0 ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: colorDrift(parseFloat(lastBoiler.returnTemp) - parseFloat(boilerReturnTarget)) }}>
                        {parseFloat(lastBoiler.returnTemp).toFixed(1)}°F
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Target: {boilerReturnTarget}°F · Diff: {(parseFloat(lastBoiler.returnTemp) - parseFloat(boilerReturnTarget)).toFixed(1)}°F</p>
                    </>
                  ) : <p className="text-gray-600 text-sm">No boiler data</p>}
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Chiller CW Delta</p>
                  {actualChillerCWDelta !== null && !isNaN(actualChillerCWDelta) ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: colorDrift(actualChillerCWDelta - targetChillerDelta) }}>
                        {actualChillerCWDelta.toFixed(1)}°F
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Target: {targetChillerDelta}°F delta · Drift: {(actualChillerCWDelta - targetChillerDelta).toFixed(1)}°F</p>
                    </>
                  ) : <p className="text-gray-600 text-sm">No chiller data</p>}
                </div>
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Chiller Condenser Delta</p>
                  {actualCondDelta !== null && !isNaN(actualCondDelta) ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: colorDrift(actualCondDelta - 10) }}>
                        {actualCondDelta.toFixed(1)}°F
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Target: 10°F delta · Drift: {(actualCondDelta - 10).toFixed(1)}°F</p>
                    </>
                  ) : <p className="text-gray-600 text-sm">No chiller data</p>}
                </div>
              </div>

              {oatEstimate && oat && (
                <p className="text-xs text-gray-500 italic">
                  OAT {oat}°F — outdoor conditions may affect return temps by ±{oatEstimate}°F
                </p>
              )}
            </div>

            {/* Weekly Compliance Scorecard */}
            <div className="p-6 mb-6" style={GLASS}>
              <h2 className="font-display text-xl font-semibold text-white mb-4">Weekly Compliance</h2>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Log Threshold */}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Log Threshold (target: {logThreshold} each)</p>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Boiler: </span>
                      <span className="font-bold" style={{ color: boilerLogsWeek.length >= logThreshold ? '#22c55e' : '#ef4444' }}>
                        {boilerLogsWeek.length}/{logThreshold}
                      </span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: boilerLogsWeek.length >= logThreshold ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: boilerLogsWeek.length >= logThreshold ? '#22c55e' : '#ef4444',
                        border: `1px solid ${boilerLogsWeek.length >= logThreshold ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>{boilerLogsWeek.length >= logThreshold ? 'Met' : 'Behind'}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <div>
                      <span className="text-xs text-gray-500">Chiller: </span>
                      <span className="font-bold" style={{ color: chillerLogsWeek.length >= logThreshold ? '#22c55e' : '#ef4444' }}>
                        {chillerLogsWeek.length}/{logThreshold}
                      </span>
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                        background: chillerLogsWeek.length >= logThreshold ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: chillerLogsWeek.length >= logThreshold ? '#22c55e' : '#ef4444',
                        border: `1px solid ${chillerLogsWeek.length >= logThreshold ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>{chillerLogsWeek.length >= logThreshold ? 'Met' : 'Behind'}</span>
                    </div>
                  </div>
                </div>

                {/* PM Compliance */}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">PM Compliance (target: 5 PMs)</p>
                  <p className="text-xl font-bold mb-2" style={{ color: pmCount >= 5 ? '#22c55e' : '#fbbf24' }}>{pmCount}/5</p>
                  <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-1.5 rounded-full transition-all" style={{
                      width: `${Math.min(100, (pmCount / 5) * 100)}%`,
                      background: pmCount >= 5 ? '#22c55e' : '#00FFE1',
                    }} />
                  </div>
                </div>

                {/* Water Chemistry */}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Water Chemistry</p>
                  {lastBoilerCond !== null && !isNaN(lastBoilerCond) && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: lastBoilerCond > 2500 ? '#ef4444' : lastBoilerCond < 500 ? '#f59e0b' : '#22c55e' }} />
                      <span className="text-xs text-gray-400">Conductivity: {lastBoilerCond} PPM</span>
                    </div>
                  )}
                  {lastBoilerPH !== null && !isNaN(lastBoilerPH) && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: lastBoilerPH >= 8.3 && lastBoilerPH <= 9.5 ? '#22c55e' : '#f59e0b' }} />
                      <span className="text-xs text-gray-400">pH: {lastBoilerPH} (target 8.3–9.5)</span>
                    </div>
                  )}
                  {lastChillerHardness !== null && !isNaN(lastChillerHardness) && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: lastChillerHardness >= 200 ? '#ef4444' : '#22c55e' }} />
                      <span className="text-xs text-gray-400">Hardness: {lastChillerHardness} PPM</span>
                    </div>
                  )}
                  {lastBoilerCond === null && lastChillerHardness === null && (
                    <p className="text-xs text-gray-600">No chemistry data yet</p>
                  )}
                </div>

                {/* Open Items */}
                <div className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">Open Items This Week</p>
                  {openItems > 0 ? (
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                      {openItems} item{openItems > 1 ? 's' : ''} need attention
                    </span>
                  ) : (
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                      All clear
                    </span>
                  )}
                </div>
              </div>

              {/* Weekly entry form */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,255,225,0.08)' }}>
                <h3 className="font-display text-base font-semibold text-white mb-3">Weekly Entry Log</h3>
                <form onSubmit={handleVirtuousSubmit}>
                  <div className="grid md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label style={LABEL_STYLE}>Inspection Type</label>
                      <select value={vForm.inspectionType} onChange={e => setVForm(f => ({ ...f, inspectionType: e.target.value }))} style={INPUT_STYLE}>
                        {['Boiler Log', 'Chiller Log', 'PM', 'Inspection', 'Water Test'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Severity</label>
                      <select value={vForm.severity} onChange={e => setVForm(f => ({ ...f, severity: e.target.value }))} style={INPUT_STYLE}>
                        {['low', 'medium', 'high', 'critical'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Status</label>
                      <select value={vForm.status} onChange={e => setVForm(f => ({ ...f, status: e.target.value }))} style={INPUT_STYLE}>
                        {['open', 'in-progress', 'resolved'].map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Finding</label>
                      <input type="text" value={vForm.finding} onChange={e => setVForm(f => ({ ...f, finding: e.target.value }))}
                        placeholder="Describe finding…" style={INPUT_STYLE} required />
                    </div>
                  </div>
                  <button type="submit" disabled={vSubmitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'rgba(0,255,225,0.1)', color: '#00FFE1', border: '1px solid rgba(0,255,225,0.22)' }}>
                    <Plus size={13} className="inline mr-1" />
                    {vSubmitting ? 'Saving…' : 'Log Entry'}
                  </button>
                </form>
              </div>
            </div>

            {/* Recent virtuous entries */}
            {virtEntries.length > 0 && (
              <div className="mt-4" style={GLASS}>
                <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(0,255,225,0.08)' }}>
                  <p className="text-xs uppercase tracking-widest text-gray-500">Recent Entries</p>
                </div>
                {virtEntries.slice(0, 10).map(e => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-3 border-b text-sm text-gray-400"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                      background: e.severity === 'critical' ? 'rgba(239,68,68,0.1)' : e.severity === 'high' ? 'rgba(249,115,22,0.1)' : e.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                      color: e.severity === 'critical' ? '#ef4444' : e.severity === 'high' ? '#f97316' : e.severity === 'medium' ? '#f59e0b' : '#22c55e',
                    }}>{e.severity}</span>
                    <span className="text-gray-500 text-xs">{e.inspectionType}</span>
                    <span className="flex-1">{e.finding}</span>
                    <span className="text-[10px] text-gray-600">{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DIAGNOSTICS */}
        {tab === 'Diagnostics' && (
          <ProbabilityFeed userName={user.name} />
        )}

        {/* RESOURCES */}
        {tab === 'Resources' && (
          <div className="max-w-3xl">
            <div style={GLASS}>
              {FACILITY_INTELLIGENCE.documents.map((doc, i, arr) => (
                <a key={doc.file} href={`/library/${doc.file}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-all group"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(251,191,36,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === 'pdf' ? '#fb923c' : doc.type === 'xlsx' ? '#34d399' : '#60a5fa', background: 'rgba(255,255,255,0.05)' }}>
                      {doc.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{doc.label}</span>
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-amber-400 transition-colors">↓</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
