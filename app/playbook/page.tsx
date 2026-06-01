"use client";
import { useState, useMemo } from "react";
import { BookMarked } from "lucide-react";

const GLASS = {
  background: 'rgba(2,10,18,0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(167,139,250,0.12)',
  borderRadius: '16px',
} as React.CSSProperties;

const GLASS_TILE = {
  background: 'rgba(4,16,28,0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(167,139,250,0.12)',
  borderRadius: '12px',
} as React.CSSProperties;

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(167,139,250,0.15)',
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

const ACCENT = "#a78bfa";
const ACCENT_RGB = "167,139,250";

const TABS = ['Calculator', 'Playbook Preview'] as const;
type Tab = typeof TABS[number];

export default function PlaybookPage() {
  const [tab, setTab] = useState<Tab>('Calculator');

  // Calculator state
  const [deptName, setDeptName] = useState('');
  const [urgency, setUrgency] = useState(80);
  const [actualDoc, setActualDoc] = useState(30);
  const [period, setPeriod] = useState(30);
  const [pmCost, setPmCost] = useState('');
  const [invCost, setInvCost] = useState('');
  const [numDepts, setNumDepts] = useState('');
  const [turnover, setTurnover] = useState('');
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => {
    const u = urgency / 100;
    const a = actualDoc / 100;
    const p = period;
    const perfScore = u * a * p;
    const perfRating = perfScore > 15 ? 'Strong' : perfScore >= 8 ? 'Developing' : perfScore >= 4 ? 'Early Stage' : 'Critical Gap';
    const perfColor = perfScore > 15 ? '#22c55e' : perfScore >= 8 ? '#38bdf8' : perfScore >= 4 ? '#f59e0b' : '#ef4444';

    const pm = parseFloat(pmCost) || 0;
    const inv = parseFloat(invCost) || 0;
    const netCost = pm - inv;

    const docGap = (1 - a) * 100;
    const daysToFull = u > 0 ? Math.round(docGap / (u * 100) * p) : null;

    const depts = parseFloat(numDepts) || 0;
    const tv = parseFloat(turnover) / 100 || 0;
    const continuityRisk = depts > 0 && tv > 0 ? tv * (1 - a) * depts : null;
    const contRating = continuityRisk === null ? null : continuityRisk < 0.5 ? 'Low' : continuityRisk < 1.5 ? 'Medium' : continuityRisk < 3 ? 'High' : 'Critical';
    const contColor = contRating === 'Low' ? '#22c55e' : contRating === 'Medium' ? '#f59e0b' : '#ef4444';

    return { perfScore, perfRating, perfColor, netCost, docGap, daysToFull, continuityRisk, contRating, contColor };
  }, [urgency, actualDoc, period, pmCost, invCost, numDepts, turnover]);

  return (
    <div style={{ background: '#030d14', minHeight: '100%', position: 'relative', zIndex: 1 }}>
      <div className="px-7 pt-7 pb-5 border-b" style={{ borderColor: 'rgba(167,139,250,0.06)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `rgba(${ACCENT_RGB},0.08)`, border: `1px solid rgba(${ACCENT_RGB},0.2)` }}>
            <BookMarked size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">FI PMO Playbook</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.3)` }}>FREE PREVIEW</span>
            </div>
            <p className="text-gray-600 text-xs">Operational visibility · Continuity scoring · PM cost analysis</p>
          </div>
        </div>
      </div>

      <div className="px-7 border-b" style={{ borderColor: 'rgba(167,139,250,0.06)' }}>
        <div className="flex gap-5">
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

        {tab === 'Calculator' && (
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-white mb-1">FIPMO Visibility Calculator</h2>
            <p className="text-gray-500 text-sm mb-6">Measure operational visibility and continuity across your facility departments</p>

            <div className="p-6 mb-5" style={GLASS}>
              <h3 className="font-display text-sm font-semibold text-white mb-4" style={{ color: ACCENT }}>Department Demand</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={LABEL_STYLE}>Department Name</label>
                  <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)}
                    placeholder="Boiler Room" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Period (days)</label>
                  <input type="number" value={period} onChange={e => setPeriod(parseInt(e.target.value) || 30)}
                    placeholder="30" style={INPUT_STYLE} />
                </div>
                <div className="md:col-span-2">
                  <label style={LABEL_STYLE}>Urgency % — How urgent is documentation for this department?</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="100" value={urgency} onChange={e => setUrgency(parseInt(e.target.value))}
                      className="flex-1" style={{ accentColor: ACCENT }} />
                    <span className="text-sm font-bold w-10 text-right" style={{ color: ACCENT }}>{urgency}%</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label style={LABEL_STYLE}>Actual Documentation % — What % of processes are currently documented?</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="100" value={actualDoc} onChange={e => setActualDoc(parseInt(e.target.value))}
                      className="flex-1" style={{ accentColor: ACCENT }} />
                    <span className="text-sm font-bold w-10 text-right" style={{ color: ACCENT }}>{actualDoc}%</span>
                  </div>
                </div>
              </div>

              <h3 className="font-display text-sm font-semibold mb-4 mt-2" style={{ color: ACCENT }}>Operational Cost</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={LABEL_STYLE}>Monthly PM Cost ($)</label>
                  <input type="number" value={pmCost} onChange={e => setPmCost(e.target.value)} placeholder="5000" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Monthly Inventory Cost ($)</label>
                  <input type="number" value={invCost} onChange={e => setInvCost(e.target.value)} placeholder="1200" style={INPUT_STYLE} />
                </div>
              </div>

              <h3 className="font-display text-sm font-semibold mb-4" style={{ color: ACCENT }}>Continuity (optional)</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label style={LABEL_STYLE}>Number of Departments / Systems</label>
                  <input type="number" value={numDepts} onChange={e => setNumDepts(e.target.value)} placeholder="4" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Avg Staff Turnover Rate (%)</label>
                  <input type="number" value={turnover} onChange={e => setTurnover(e.target.value)} placeholder="20" style={INPUT_STYLE} />
                </div>
              </div>

              <button onClick={() => setCalculated(true)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.3)` }}>
                Calculate →
              </button>
            </div>

            {calculated && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-4 md:col-span-2" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Visibility Performance Score</p>
                    <p className="text-4xl font-bold" style={{ color: results.perfColor }}>{results.perfScore.toFixed(1)}</p>
                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-2" style={{ color: results.perfColor, background: `${results.perfColor}18`, border: `1px solid ${results.perfColor}40` }}>
                      {results.perfRating}
                    </span>
                    <p className="text-[10px] text-gray-600 mt-1">= (Urgency {urgency}% × Doc {actualDoc}%) × {period} days</p>
                  </div>
                  <div className="p-4" style={GLASS_TILE}>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Documentation Gap</p>
                    <p className="text-3xl font-bold" style={{ color: results.docGap > 50 ? '#ef4444' : '#f59e0b' }}>{results.docGap.toFixed(0)}%</p>
                    <p className="text-[10px] text-gray-600 mt-1">processes undocumented</p>
                    {results.daysToFull !== null && (
                      <p className="text-[10px] text-gray-600 mt-1">~{results.daysToFull} days to full doc at current pace</p>
                    )}
                  </div>
                  {(parseFloat(pmCost) > 0 || parseFloat(invCost) > 0) && (
                    <div className="p-4" style={GLASS_TILE}>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">{results.netCost >= 0 ? 'Net PM Spend' : 'Inventory Offset'}</p>
                      <p className="text-2xl font-bold" style={{ color: results.netCost >= 0 ? '#fbbf24' : '#22c55e' }}>
                        ${Math.abs(results.netCost).toLocaleString()}<span className="text-xs text-gray-600">/mo</span>
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">{results.netCost >= 0 ? 'PM cost above inventory' : 'Inventory offsets PM spend'}</p>
                    </div>
                  )}
                  {results.continuityRisk !== null && (
                    <div className="p-4" style={GLASS_TILE}>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Continuity Risk Score</p>
                      <p className="text-2xl font-bold" style={{ color: results.contColor }}>{results.continuityRisk.toFixed(2)}</p>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1" style={{ color: results.contColor, background: `${results.contColor}18`, border: `1px solid ${results.contColor}40` }}>
                        {results.contRating}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5" style={{ ...GLASS, borderColor: 'rgba(167,139,250,0.18)' }}>
                  <p className="font-display text-sm italic leading-relaxed" style={{ color: 'rgba(167,139,250,0.8)' }}>
                    &quot;A visibility score below 8 indicates your facility is operating on tribal knowledge. Every undocumented process is a compliance liability and a retention risk.&quot;
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'Playbook Preview' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-white mb-1">FI PMO Playbook</h2>
            <p className="text-gray-500 text-sm mb-6">A framework for facility teams building documentation discipline</p>

            {/* Section 1 — fully visible */}
            <div className="p-5 mb-4" style={GLASS}>
              <h3 className="font-display text-lg font-semibold text-white mb-3">Why Visibility Matters</h3>
              <ul className="space-y-2">
                {[
                  'Facilities with documented processes see 40% fewer compliance incidents during audits.',
                  'Every undocumented SOP is an implicit dependency on a single employee — a retention risk you can price.',
                  'Documentation discipline compounds: the first 30 days are hardest, but each subsequent month accelerates.',
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span style={{ color: ACCENT, flexShrink: 0 }}>→</span> {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2 — fully visible */}
            <div className="p-5 mb-4" style={GLASS}>
              <h3 className="font-display text-lg font-semibold text-white mb-3">The First 30 Days</h3>
              <ol className="space-y-2">
                {[
                  'Inventory every critical system — boilers, chillers, pumps, AHU, cooling towers.',
                  'Identify which processes exist only in someone\'s head (tribal knowledge audit).',
                  'Establish a weekly log cadence — even informal notes build the paper trail.',
                  'Draft one SOP per week, starting with highest-risk systems.',
                  'Review and score documentation gaps monthly using the FIPMO Visibility Calculator.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5" style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.25)` }}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Sections 3-5 — blurred */}
            {['Building Your PM Schedule', 'Water Chemistry Baselines', 'Compliance Calendar'].map(title => (
              <div key={title} className="mb-4 rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(167,139,250,0.12)' }}>
                <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', background: 'rgba(2,10,18,0.75)', padding: '20px' }}>
                  <h3 className="font-display text-lg font-semibold text-white mb-3">{title}</h3>
                  <p className="text-sm text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
                  <p className="text-sm text-gray-400 mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(3,13,20,0.6)', backdropFilter: 'blur(2px)' }}>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full mb-2" style={{ background: `rgba(${ACCENT_RGB},0.12)`, color: ACCENT, border: `1px solid rgba(${ACCENT_RGB},0.3)` }}>
                    In Development
                  </span>
                  <p className="text-sm font-semibold text-white">Full Playbook — Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
