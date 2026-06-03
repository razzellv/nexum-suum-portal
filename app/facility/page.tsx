"use client";
import { useState, useEffect, useMemo } from "react";
import { Building2, Lock } from "lucide-react";
import { useAuth } from "../../components/AuthContext";
import { loadLogs, saveLogs } from "../lib/logData";
import { FACILITY_INTELLIGENCE_ADVANCED } from "../lib/products";
import { isUnlocked } from "../lib/auth";
import PreviewBanner from "../../components/PreviewBanner";
import LockedInput from "../../components/LockedInput";
import DownloadGate, { DownloadGateDoc } from "../../components/DownloadGate";

const GLASS = {
  background: 'rgba(2,10,18,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(251,191,36,0.1)',
  borderRadius: '16px',
} as React.CSSProperties;

const GLASS_TILE = {
  background: 'rgba(4,16,28,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(251,191,36,0.1)',
  borderRadius: '12px',
} as React.CSSProperties;

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(251,191,36,0.12)',
  borderRadius: '8px',
  color: '#e2e8f0',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'rgba(148,163,184,0.5)',
  marginBottom: '4px',
};

interface BoilerLog { id: string; employeeName: string; title: string; description: string; dateTime: string; supplyTemp: string; returnTemp: string; supplyPSI: string; returnPSI: string; mainPSI: string; waterLevel: string; conductivityPPM: string; pH: string; oilVolume: string; timestamp: number; }
interface ChillerLog { id: string; employeeName: string; title: string; description: string; dateTime: string; cwSupplyTemp: string; cwReturnTemp: string; condSupplyTemp: string; condReturnTemp: string; supplyPSI: string; returnPSI: string; refSuctionTemp: string; refDischargeTemp: string; basinLevel: string; hardness: string; oilVolume: string; timestamp: number; }
interface VirtuousEntry { id: string; inspectionType: string; finding: string; severity: 'low' | 'medium' | 'high' | 'critical'; status: 'open' | 'in-progress' | 'resolved'; timestamp: number; }

const TABS = ['Overview', 'Drift Analyzer', 'VirtuousBoard', 'Documents'] as const;
type Tab = typeof TABS[number];

const ACCENT = "#fbbf24";
const ACCENT_RGB = "251,191,36";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setHours(0,0,0,0); mon.setDate(now.getDate() + diff);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { start: mon.getTime(), end: sun.getTime() };
}

function numAvg(logs: { [k: string]: unknown }[], key: string): number {
  const vals = logs.map(l => parseFloat(l[key] as string)).filter(v => !isNaN(v) && v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}

function driftColor(diff: number) {
  const a = Math.abs(diff);
  return a <= 1 ? '#22c55e' : a <= 3 ? '#f59e0b' : '#ef4444';
}

function ChecklistItem({ label, status }: { label: string; status: 'current' | 'due-soon' | 'overdue' | 'preview' }) {
  const colors = { current: '#22c55e', 'due-soon': '#f59e0b', overdue: '#ef4444', preview: '#4b5563' };
  const statusLabels = { current: 'Current', 'due-soon': 'Due Soon', overdue: 'Overdue', preview: '—' };
  const color = colors[status];
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-2">
        <span style={{ color: status === 'current' ? '#22c55e' : '#4b5563', fontSize: 13 }}>{status === 'current' ? '☑' : '☐'}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}>{statusLabels[status]}</span>
    </div>
  );
}

const FACILITY_DOCS: { name: string; type: DownloadGateDoc['type']; fileUrl: string; description: string }[] = [
  { name: 'Compliance Calendar', type: 'Reference', fileUrl: '#', description: 'Annual regulatory inspection schedule' },
  { name: 'PM Schedule Template', type: 'Excel', fileUrl: '#', description: 'Preventive maintenance tracking spreadsheet' },
  { name: 'Multi-System Inspection Log', type: 'Checklist', fileUrl: '#', description: 'Combined boiler + chiller walk-through form' },
  { name: 'OSHA 300 Log Template', type: 'Excel', fileUrl: '#', description: 'Recordable injury/illness log template' },
  { name: 'Water Chemistry Baseline Guide', type: 'Reference', fileUrl: '#', description: 'Acceptable ranges for boiler and cooling water' },
  { name: 'Facility SOP Master Index', type: 'SOP', fileUrl: '#', description: 'Master list of all facility SOPs with revision dates' },
  ...FACILITY_INTELLIGENCE_ADVANCED.documents.map(d => ({ name: d.label, type: (d.type === 'pdf' ? 'PDF' : d.type === 'xlsx' ? 'Excel' : 'Reference') as DownloadGateDoc['type'], fileUrl: `/library/${d.file}`, description: d.label })),
];

const DEMO_BOILER_LOGS: BoilerLog[] = [
  { id: 'db1', employeeName: 'J. Martinez', title: 'Boiler Tech', description: 'Routine check', dateTime: '2026-05-27T09:00', supplyTemp: '385', returnTemp: '165', supplyPSI: '110', returnPSI: '105', mainPSI: '120', waterLevel: '78', conductivityPPM: '2100', pH: '8.4', oilVolume: '', timestamp: 1748336400000 },
  { id: 'db2', employeeName: 'R. Thompson', title: 'Sr. Tech', description: 'Blowdown boiler 1', dateTime: '2026-05-26T14:00', supplyTemp: '392', returnTemp: '168', supplyPSI: '108', returnPSI: '104', mainPSI: '118', waterLevel: '75', conductivityPPM: '1850', pH: '8.2', oilVolume: '', timestamp: 1748264400000 },
];

const DEMO_CHILLER_LOGS: ChillerLog[] = [
  { id: 'dc1', employeeName: 'M. Rodriguez', title: 'Chiller Tech', description: 'Ref temps nominal', dateTime: '2026-05-27T10:00', cwSupplyTemp: '44.8', cwReturnTemp: '56.2', condSupplyTemp: '82', condReturnTemp: '92', supplyPSI: '85', returnPSI: '80', refSuctionTemp: '38', refDischargeTemp: '118', basinLevel: '74', hardness: '180', oilVolume: '', timestamp: 1748340000000 },
  { id: 'dc2', employeeName: 'T. Barnes', title: 'HVAC Tech', description: 'Basin check', dateTime: '2026-05-26T09:30', cwSupplyTemp: '45.1', cwReturnTemp: '56.8', condSupplyTemp: '84', condReturnTemp: '94', supplyPSI: '84', returnPSI: '79', refSuctionTemp: '37', refDischargeTemp: '121', basinLevel: '71', hardness: '195', oilVolume: '', timestamp: 1748259000000 },
];

export default function FacilityPage() {
  useAuth();
  const unlocked = isUnlocked('facility');
  const [tab, setTab] = useState<Tab>('Overview');

  const [boilerLogs, setBoilerLogs] = useState<BoilerLog[]>([]);
  const [chillerLogs, setChillerLogs] = useState<ChillerLog[]>([]);
  const [virtEntries, setVirtEntries] = useState<VirtuousEntry[]>([]);

  const [virtForm, setVirtForm] = useState<{ inspectionType: string; finding: string; severity: VirtuousEntry['severity']; status: VirtuousEntry['status'] }>({ inspectionType: '', finding: '', severity: 'medium', status: 'open' });
  const [gateDoc, setGateDoc] = useState<DownloadGateDoc | null>(null);

  const [oat, setOat] = useState('');
  const [boilerSupplyTarget, setBoilerSupplyTarget] = useState('');
  const [boilerReturnTarget, setBoilerReturnTarget] = useState('');
  const [chillerSupplyTarget, setChillerSupplyTarget] = useState('');
  const [chillerReturnTarget, setChillerReturnTarget] = useState('');

  useEffect(() => {
    setBoilerLogs(loadLogs<BoilerLog>('boiler'));
    setChillerLogs(loadLogs<ChillerLog>('chiller'));
    setVirtEntries(loadLogs<VirtuousEntry>('virtuous'));
  }, []);

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

  const effectiveBoiler = unlocked ? boilerLogs : DEMO_BOILER_LOGS;
  const effectiveChiller = unlocked ? chillerLogs : DEMO_CHILLER_LOGS;

  // Boiler KPIs
  const bCombScore = useMemo(() => {
    if (!unlocked) return { val: '94%', color: '#22c55e' };
    const temps = effectiveBoiler.map(l => parseFloat(l.supplyTemp)).filter(v => !isNaN(v) && v > 0);
    if (!temps.length) return { val: '—', color: '#4b5563' };
    const pct = Math.round((temps.filter(t => t < 600).length / temps.length) * 100);
    return { val: `${pct}%`, color: pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444' };
  }, [effectiveBoiler, unlocked]);

  const bCondStatus = useMemo(() => {
    if (!unlocked) return { label: 'Normal', sub: '1960 PPM', color: '#22c55e' };
    const ppm = numAvg(effectiveBoiler as unknown as { [k: string]: unknown }[], 'conductivityPPM');
    if (!ppm) return { label: '—', sub: 'No data', color: '#4b5563' };
    return ppm > 2500 ? { label: 'High', sub: `${ppm.toFixed(0)} PPM`, color: '#ef4444' } : ppm < 500 ? { label: 'Low', sub: `${ppm.toFixed(0)} PPM`, color: '#f59e0b' } : { label: 'Normal', sub: `${ppm.toFixed(0)} PPM`, color: '#22c55e' };
  }, [effectiveBoiler, unlocked]);

  const bDelta = useMemo(() => {
    if (!unlocked) return '218°F';
    const vals = effectiveBoiler.slice(0, 30).map(l => parseFloat(l.supplyTemp) - parseFloat(l.returnTemp)).filter(v => !isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}°F` : '—';
  }, [effectiveBoiler, unlocked]);

  const bWeekCount = effectiveBoiler.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  // Chiller KPIs
  const cRefStatus = useMemo(() => {
    if (!unlocked) return { label: 'Normal — 118°F', color: '#22c55e' };
    const vals = effectiveChiller.map(l => parseFloat(l.refDischargeTemp)).filter(v => !isNaN(v) && v > 0);
    if (!vals.length) return { label: '—', color: '#4b5563' };
    const a = vals.reduce((x, y) => x + y, 0) / vals.length;
    return a > 130 ? { label: `Flagged — ${a.toFixed(0)}°F`, color: '#ef4444' } : { label: `Normal — ${a.toFixed(0)}°F`, color: '#22c55e' };
  }, [effectiveChiller, unlocked]);

  const cBasin = useMemo(() => {
    if (!unlocked) return { label: 'Normal', sub: '72% avg', color: '#22c55e' };
    const a = numAvg(effectiveChiller as unknown as { [k: string]: unknown }[], 'basinLevel');
    if (!a) return { label: '—', sub: 'No data', color: '#4b5563' };
    return a < 50 ? { label: 'Low', sub: `${a.toFixed(0)}%`, color: '#ef4444' } : a > 90 ? { label: 'High', sub: `${a.toFixed(0)}%`, color: '#f59e0b' } : { label: 'Normal', sub: `${a.toFixed(0)}% avg`, color: '#22c55e' };
  }, [effectiveChiller, unlocked]);

  const cDelta = useMemo(() => {
    if (!unlocked) return '11.6°F';
    const vals = effectiveChiller.slice(0, 30).map(l => parseFloat(l.cwReturnTemp) - parseFloat(l.cwSupplyTemp)).filter(v => !isNaN(v) && v > 0);
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}°F` : '—';
  }, [effectiveChiller, unlocked]);

  const cWeekCount = effectiveChiller.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd).length;

  // Boiler checklist
  const boilerChecklist = useMemo(() => {
    if (!unlocked) return Array(6).fill('preview') as ('current' | 'due-soon' | 'overdue' | 'preview')[];
    const wk = effectiveBoiler.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    return [
      wk.some(l => /blowdown/i.test(l.description)) ? 'current' : 'overdue',
      wk.some(l => l.conductivityPPM && l.pH) ? 'current' : 'overdue',
      effectiveBoiler.some(l => parseFloat(l.supplyTemp) < 600) ? 'current' : 'overdue',
      wk.some(l => l.supplyPSI) ? 'current' : 'due-soon',
      wk.some(l => l.waterLevel) ? 'current' : 'due-soon',
      effectiveBoiler.some(l => l.timestamp >= monthStart.getTime() && /pm|preventive/i.test(l.description)) ? 'current' : 'due-soon',
    ] as ('current' | 'due-soon' | 'overdue' | 'preview')[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBoiler, unlocked, weekStart, weekEnd]);

  const chillerChecklist = useMemo(() => {
    if (!unlocked) return Array(6).fill('preview') as ('current' | 'due-soon' | 'overdue' | 'preview')[];
    const wk = effectiveChiller.filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    const mo = effectiveChiller.filter(l => l.timestamp >= monthStart.getTime());
    return [
      wk.some(l => l.refSuctionTemp && l.refDischargeTemp) ? 'current' : 'overdue',
      wk.some(l => l.basinLevel) ? 'current' : 'overdue',
      wk.some(l => l.condSupplyTemp && l.condReturnTemp) ? 'current' : 'due-soon',
      mo.some(l => l.hardness) ? 'current' : 'due-soon',
      wk.some(l => l.cwSupplyTemp && l.cwReturnTemp) ? 'current' : 'due-soon',
      effectiveChiller.some(l => l.timestamp >= monthStart.getTime() && /pm|preventive/i.test(l.description)) ? 'current' : 'due-soon',
    ] as ('current' | 'due-soon' | 'overdue' | 'preview')[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveChiller, unlocked, weekStart, weekEnd]);

  // Drift analyzer
  const drift = useMemo(() => {
    const latestBoiler = effectiveBoiler[0];
    const latestChiller = effectiveChiller[0];
    const bSupplyActual = latestBoiler ? parseFloat(latestBoiler.supplyTemp) : null;
    const bReturnActual = latestBoiler ? parseFloat(latestBoiler.returnTemp) : null;
    const cDeltaActual = latestChiller ? parseFloat(latestChiller.cwReturnTemp) - parseFloat(latestChiller.cwSupplyTemp) : null;
    const cCondDeltaActual = latestChiller ? parseFloat(latestChiller.condReturnTemp) - parseFloat(latestChiller.condSupplyTemp) : null;
    const bSTarget = parseFloat(boilerSupplyTarget) || null;
    const bRTarget = parseFloat(boilerReturnTarget) || null;
    const cSTarget = parseFloat(chillerSupplyTarget) || 12;
    const cCTarget = parseFloat(chillerReturnTarget) || 10;
    return {
      bSupplyDiff: bSupplyActual !== null && bSTarget !== null ? bSupplyActual - bSTarget : null,
      bSupplyActual, bSTarget,
      bReturnDiff: bReturnActual !== null && bRTarget !== null ? bReturnActual - bRTarget : null,
      bReturnActual, bRTarget,
      cDeltaDiff: cDeltaActual !== null ? cDeltaActual - cSTarget : null,
      cDeltaActual, cSTarget,
      cCondDiff: cCondDeltaActual !== null ? cCondDeltaActual - cCTarget : null,
      cCondDeltaActual, cCTarget,
    };
  }, [effectiveBoiler, effectiveChiller, boilerSupplyTarget, boilerReturnTarget, chillerSupplyTarget, chillerReturnTarget]);

  // VirtuousBoard
  const virtWeekLogs = useMemo(() => {
    const bWk = (unlocked ? boilerLogs : []).filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    const cWk = (unlocked ? chillerLogs : []).filter(l => l.timestamp >= weekStart && l.timestamp <= weekEnd);
    const allWk = [...bWk, ...cWk] as { description: string; timestamp: number; conductivityPPM?: string; pH?: string; hardness?: string; }[];
    const pmCount = allWk.filter(l => /pm|preventive/i.test(l.description)).length;
    const waterOk = bWk.some(l => l.conductivityPPM && l.pH) || cWk.some(l => l.hardness);
    const openItems = allWk.filter(l => /drift|critical|high|flag/i.test(l.description)).length;
    return { bCount: bWk.length, cCount: cWk.length, pmCount, waterOk, openItems };
  }, [boilerLogs, chillerLogs, unlocked, weekStart, weekEnd]);

  function addVirtEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!unlocked) return;
    const entry: VirtuousEntry = { id: crypto.randomUUID(), ...virtForm, timestamp: Date.now() };
    const updated = [entry, ...virtEntries];
    setVirtEntries(updated);
    saveLogs('virtuous', updated);
    setVirtForm({ inspectionType: '', finding: '', severity: 'medium', status: 'open' });
  }

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      {gateDoc && <DownloadGate document={gateDoc} onClose={() => setGateDoc(null)} />}
      {!unlocked && <PreviewBanner tier="facility" />}

      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(251,191,36,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.18)` }}>
            <Building2 size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Facility Intelligence Lite</h1>
            <p className="text-gray-600 text-xs">Both Systems · VirtuousBoard · Drift Analyzer · Compliance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="p-3" style={GLASS_TILE}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Boiler Compliance</p>
            <p className="text-xl font-bold" style={{ color: bCombScore.color }}>{bCombScore.val}</p>
            <p className="text-[9px] text-gray-700 mt-0.5">combustion score</p>
          </div>
          <div className="p-3" style={GLASS_TILE}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Boiler Water Chem</p>
            <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: bCondStatus.color, background: `${bCondStatus.color}18`, border: `1px solid ${bCondStatus.color}40` }}>{bCondStatus.label}</span>
            <p className="text-[9px] text-gray-700 mt-1">{bCondStatus.sub}</p>
          </div>
          <div className="p-3" style={GLASS_TILE}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Boiler Delta Temp</p>
            <p className="text-lg font-bold" style={{ color: '#00FFE1' }}>{bDelta}</p>
            <p className="text-[9px] text-gray-700 mt-0.5">{unlocked ? bWeekCount : '—'}/5 logs this week</p>
          </div>
          <div className="p-3" style={GLASS_TILE}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Boiler Logs/Week</p>
            <p className="text-xl font-bold" style={{ color: bWeekCount >= 5 ? '#22c55e' : '#f59e0b' }}>{unlocked ? bWeekCount : '—'}<span className="text-xs text-gray-600">/5</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3" style={{ ...GLASS_TILE, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Refrigerant Status</p>
            <p className="text-xs font-semibold truncate" style={{ color: cRefStatus.color }}>{cRefStatus.label}</p>
          </div>
          <div className="p-3" style={{ ...GLASS_TILE, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Chiller Basin</p>
            <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: cBasin.color, background: `${cBasin.color}18`, border: `1px solid ${cBasin.color}40` }}>{cBasin.label}</span>
            <p className="text-[9px] text-gray-700 mt-1">{cBasin.sub}</p>
          </div>
          <div className="p-3" style={{ ...GLASS_TILE, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">CW Delta Temp</p>
            <p className="text-lg font-bold" style={{ color: '#38bdf8' }}>{cDelta}</p>
            <p className="text-[9px] text-gray-700 mt-0.5">target: 10–14°F</p>
          </div>
          <div className="p-3" style={{ ...GLASS_TILE, border: '1px solid rgba(56,189,248,0.1)' }}>
            <p className="text-[9px] uppercase tracking-wide text-gray-600 mb-1">Chiller Logs/Week</p>
            <p className="text-xl font-bold" style={{ color: cWeekCount >= 5 ? '#22c55e' : '#f59e0b' }}>{unlocked ? cWeekCount : '—'}<span className="text-xs text-gray-600">/5</span></p>
          </div>
        </div>
      </div>

      <div className="px-7 border-b" style={{ borderColor: 'rgba(251,191,36,0.06)' }}>
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

        {tab === 'Overview' && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-5" style={GLASS}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-sm font-semibold text-white">Boiler Compliance Checklist</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,255,225,0.1)', color: '#00FFE1', border: '1px solid rgba(0,255,225,0.2)' }}>
                  {unlocked ? `${boilerChecklist.filter(s => s === 'current').length}/6` : '6 items'}
                </span>
              </div>
              {['Blowdown logged this week', 'Water chemistry tested', 'Stack temp within range', 'Pressure readings logged', 'Water level logged', 'PM entry this month'].map((l, i) => (
                <ChecklistItem key={l} label={l} status={boilerChecklist[i]} />
              ))}
            </div>
            <div className="p-5" style={{ ...GLASS, border: '1px solid rgba(56,189,248,0.1)' }}>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-sm font-semibold text-white">Chiller Compliance Checklist</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
                  {unlocked ? `${chillerChecklist.filter(s => s === 'current').length}/6` : '6 items'}
                </span>
              </div>
              {['Refrigerant temps logged', 'Basin water level checked', 'Condenser water temps logged', 'Water hardness tested', 'COP calculated this week', 'PM entry this month'].map((l, i) => (
                <ChecklistItem key={l} label={l} status={chillerChecklist[i]} />
              ))}
            </div>
            {!unlocked && (
              <div className="md:col-span-2 text-center py-3">
                <span className="text-xs text-gray-600 flex items-center justify-center gap-1.5"><Lock size={10} /> Demo data — purchase Facility Intelligence Lite to track real compliance</span>
              </div>
            )}
          </div>
        )}

        {tab === 'Drift Analyzer' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-white mb-1">System Drift Analyzer</h2>
            <p className="text-gray-500 text-sm mb-5">Enter OAT and target setpoints — see where your systems are drifting</p>

            <div className="p-5 mb-5" style={GLASS}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label style={LABEL_STYLE}>OAT (°F)</label>
                  <input type="number" value={oat} onChange={e => setOat(e.target.value)} placeholder="75" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Boiler Supply Target °F</label>
                  <LockedInput locked={!unlocked} tier="facility">
                    <input type="number" value={boilerSupplyTarget} onChange={e => unlocked && setBoilerSupplyTarget(e.target.value)} placeholder="385" style={INPUT_STYLE} disabled={!unlocked} />
                  </LockedInput>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Boiler Return Target °F</label>
                  <LockedInput locked={!unlocked} tier="facility">
                    <input type="number" value={boilerReturnTarget} onChange={e => unlocked && setBoilerReturnTarget(e.target.value)} placeholder="160" style={INPUT_STYLE} disabled={!unlocked} />
                  </LockedInput>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Chiller CW Delta Target °F</label>
                  <LockedInput locked={!unlocked} tier="facility">
                    <input type="number" value={chillerSupplyTarget} onChange={e => unlocked && setChillerSupplyTarget(e.target.value)} placeholder="12" style={INPUT_STYLE} disabled={!unlocked} />
                  </LockedInput>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Chiller Condenser Delta Target °F</label>
                  <LockedInput locked={!unlocked} tier="facility">
                    <input type="number" value={chillerReturnTarget} onChange={e => unlocked && setChillerReturnTarget(e.target.value)} placeholder="10" style={INPUT_STYLE} disabled={!unlocked} />
                  </LockedInput>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: 'Boiler Supply Drift', diff: drift.bSupplyDiff, actual: drift.bSupplyActual, target: drift.bSTarget, unit: '°F' },
                { label: 'Boiler Return Drift', diff: drift.bReturnDiff, actual: drift.bReturnActual, target: drift.bRTarget, unit: '°F' },
                { label: 'Chiller CW Delta Drift', diff: drift.cDeltaDiff, actual: drift.cDeltaActual, target: drift.cSTarget, unit: '°F' },
                { label: 'Chiller Condenser Drift', diff: drift.cCondDiff, actual: drift.cCondDeltaActual, target: drift.cCTarget, unit: '°F' },
              ].map(card => {
                const color = card.diff !== null ? driftColor(card.diff) : '#4b5563';
                return (
                  <div key={card.label} className="p-4" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">{card.label}</p>
                    {card.diff !== null ? (
                      <>
                        <p className="text-2xl font-bold" style={{ color }}>{card.diff > 0 ? '+' : ''}{card.diff.toFixed(1)}{card.unit}</p>
                        <p className="text-[10px] text-gray-600 mt-1">Actual: {card.actual?.toFixed(1)}{card.unit} · Target: {card.target}{card.unit}</p>
                        <p className="text-[10px] font-medium mt-1" style={{ color }}>{Math.abs(card.diff) <= 1 ? 'On target' : Math.abs(card.diff) <= 3 ? 'Slight drift' : 'Needs attention'}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">Enter targets + log data to calculate</p>
                    )}
                  </div>
                );
              })}
            </div>

            {oat && (
              <p className="text-xs text-gray-600 italic">
                OAT {oat}°F — every 10°F change in OAT typically shifts return temps 2–4°F
              </p>
            )}
          </div>
        )}

        {tab === 'VirtuousBoard' && (
          <div className="max-w-3xl">
            <h2 className="font-display text-xl font-bold text-white mb-5">Weekly Compliance Scorecard</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Log Threshold', val: unlocked ? `Boiler ${virtWeekLogs.bCount}/5 · Chiller ${virtWeekLogs.cCount}/5` : 'Purchase to view', color: (virtWeekLogs.bCount >= 5 && virtWeekLogs.cCount >= 5) ? '#22c55e' : '#f59e0b' },
                { label: 'PM Compliance', val: unlocked ? `${virtWeekLogs.pmCount}/5 PMs logged` : 'Purchase to view', color: virtWeekLogs.pmCount >= 5 ? '#22c55e' : '#f59e0b' },
                { label: 'Water Chemistry', val: unlocked ? (virtWeekLogs.waterOk ? 'Chemistry logged' : 'Not logged this week') : 'Purchase to view', color: virtWeekLogs.waterOk ? '#22c55e' : '#ef4444' },
                { label: 'Open Items', val: unlocked ? `${virtWeekLogs.openItems} flagged this week` : 'Purchase to view', color: virtWeekLogs.openItems === 0 ? '#22c55e' : virtWeekLogs.openItems < 3 ? '#f59e0b' : '#ef4444' },
              ].map(card => (
                <div key={card.label} className="p-4" style={GLASS_TILE}>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">{card.label}</p>
                  <p className="text-sm font-semibold" style={{ color: unlocked ? card.color : '#4b5563' }}>{card.val}</p>
                </div>
              ))}
            </div>

            <div className="p-5" style={GLASS}>
              <h3 className="font-display text-sm font-semibold text-white mb-4">Log Weekly Entry</h3>
              <form onSubmit={addVirtEntry}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <LockedInput locked={!unlocked} tier="facility">
                    <div>
                      <label style={LABEL_STYLE}>Inspection Type</label>
                      <input type="text" value={virtForm.inspectionType}
                        onChange={e => unlocked && setVirtForm(f => ({ ...f, inspectionType: e.target.value }))}
                        placeholder="Boiler PM, Water Test, etc." style={INPUT_STYLE} disabled={!unlocked} />
                    </div>
                  </LockedInput>
                  <LockedInput locked={!unlocked} tier="facility">
                    <div>
                      <label style={LABEL_STYLE}>Severity</label>
                      <select value={virtForm.severity}
                        onChange={e => unlocked && setVirtForm(f => ({ ...f, severity: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                        style={INPUT_STYLE} disabled={!unlocked}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </LockedInput>
                  <div className="md:col-span-2">
                    <LockedInput locked={!unlocked} tier="facility">
                      <div>
                        <label style={LABEL_STYLE}>Finding</label>
                        <textarea value={virtForm.finding} rows={3}
                          onChange={e => unlocked && setVirtForm(f => ({ ...f, finding: e.target.value }))}
                          style={{ ...INPUT_STYLE, resize: 'none' }} disabled={!unlocked} />
                      </div>
                    </LockedInput>
                  </div>
                </div>
                <LockedInput locked={!unlocked} tier="facility">
                  <button type="submit" disabled={!unlocked}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: `rgba(${ACCENT_RGB},0.1)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.25)` }}>
                    Log Entry →
                  </button>
                </LockedInput>
              </form>
            </div>

            {unlocked && virtEntries.length > 0 && (
              <div className="mt-4" style={GLASS}>
                {virtEntries.slice(0, 10).map((e, i, arr) => (
                  <div key={e.id} className="px-4 py-3 flex items-start gap-3"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                      style={{ color: e.severity === 'critical' ? '#ef4444' : e.severity === 'high' ? '#f59e0b' : e.severity === 'medium' ? '#38bdf8' : '#22c55e', background: 'rgba(255,255,255,0.05)' }}>
                      {e.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{e.inspectionType}</p>
                      <p className="text-xs text-gray-600 truncate">{e.finding}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: e.status === 'resolved' ? '#22c55e' : '#f59e0b', background: 'rgba(255,255,255,0.04)' }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'Documents' && (
          <div className="max-w-3xl">
            <div style={GLASS}>
              {FACILITY_DOCS.map((doc, i, arr) => (
                <div key={doc.name} className="flex items-center justify-between px-5 py-3.5 group"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: doc.type === 'EOP' ? '#ef4444' : doc.type === 'Excel' ? '#34d399' : doc.type === 'SOP' ? '#38bdf8' : doc.type === 'Safety' ? '#f59e0b' : '#fb923c', background: 'rgba(255,255,255,0.05)' }}>
                      {doc.type}
                    </span>
                    <div>
                      <p className="text-sm text-gray-300">{doc.name}</p>
                      <p className="text-xs text-gray-600">{doc.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGateDoc({ name: doc.name, type: doc.type, fileUrl: doc.fileUrl, package: 'facility' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,191,36,0.08)')}
                  >
                    ↓ Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
