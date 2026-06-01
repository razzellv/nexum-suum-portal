"use client";
import { useState } from "react";
import { Thermometer, Snowflake, Building2, BookMarked, ArrowRight } from "lucide-react";
import AuthModal from "../components/AuthModal";
import { Tier } from "./lib/auth";

const PACKAGES = [
  {
    icon: Thermometer,
    accent: '#00FFE1',
    accentRgb: '0,255,225',
    title: 'Boiler Intelligence',
    subtitle: 'Built for boiler operators and steam plant technicians',
    desc: 'Combustion compliance · Stack analysis · Water chemistry · Blowdown logs',
    tags: ['KPI Dashboard', 'Neon Log Table', 'Efficiency Calculator', 'Compliance Score'],
    href: '/boiler',
    tier: 'boiler' as Tier,
    cta: 'Preview Free →',
    purchaseCta: 'Purchase Access →',
    free: false,
  },
  {
    icon: Snowflake,
    accent: '#38bdf8',
    accentRgb: '56,189,248',
    title: 'Chiller Intelligence',
    subtitle: 'Built for chiller operators and HVAC technicians',
    desc: 'Refrigerant compliance · Cooling efficiency · Basin water · COP/EER calculator',
    tags: ['KPI Dashboard', 'Neon Log Table', 'COP/EER Calculator', 'Compliance Score'],
    href: '/chiller',
    tier: 'chiller' as Tier,
    cta: 'Preview Free →',
    purchaseCta: 'Purchase Access →',
    free: false,
  },
  {
    icon: Building2,
    accent: '#fbbf24',
    accentRgb: '251,191,36',
    title: 'Facility Intelligence Lite',
    subtitle: 'For facility managers overseeing boiler and chiller operations',
    desc: 'Both systems · VirtuousBoard · Drift Analyzer · Weekly compliance scoring',
    tags: ['Full Compliance', 'Drift Analysis', 'Water Chem', 'PM Tracking'],
    href: '/facility',
    tier: 'facility' as Tier,
    cta: 'Preview Free →',
    purchaseCta: 'Purchase Access →',
    free: false,
  },
  {
    icon: BookMarked,
    accent: '#a78bfa',
    accentRgb: '167,139,250',
    title: 'FI PMO Playbook',
    subtitle: 'A framework for facility teams building documentation discipline',
    desc: 'Operational visibility calculator · Continuity scoring · PM cost analysis',
    tags: ['Free Access', 'FIPMO Calculator', 'Mini Playbook', 'Coming Soon: Full Playbook'],
    href: '/playbook',
    tier: 'playbook' as Tier,
    cta: 'Open Playbook →',
    purchaseCta: null,
    free: true,
  },
];

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authTier, setAuthTier] = useState<Exclude<Tier, 'playbook'>>('boiler');

  function openAuth(tier: Exclude<Tier, 'playbook'>) {
    setAuthTier(tier);
    setShowAuth(true);
  }

  return (
    <div className="min-h-full px-8 pt-10 pb-16" style={{ position: 'relative', zIndex: 1 }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTier={authTier} />}

      {/* Hero */}
      <div className="max-w-3xl mb-4">
        <h1 className="font-display text-5xl font-bold text-white leading-tight mb-3">
          Facility Intelligence Lite
        </h1>
        <p className="text-gray-400 text-lg mb-1">Compliance-ready packages for boiler and chiller operations</p>
        <p className="text-sm" style={{ color: 'rgba(0,255,225,0.6)' }}>
          Preview any package free. Purchase to unlock data entry and live results.
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid md:grid-cols-2 gap-5 mb-12 max-w-4xl">
        {PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.tier}
              className="flex flex-col rounded-2xl p-6 transition-all"
              style={{
                background: 'rgba(2,10,18,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid rgba(${pkg.accentRgb},0.15)`,
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `rgba(${pkg.accentRgb},0.1)`, border: `1px solid rgba(${pkg.accentRgb},0.2)` }}
                >
                  <Icon size={18} style={{ color: pkg.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-base font-semibold text-white">{pkg.title}</h2>
                    {pkg.free && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `rgba(${pkg.accentRgb},0.12)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.3)` }}
                      >
                        FREE PREVIEW
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{pkg.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">{pkg.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {pkg.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: `rgba(${pkg.accentRgb},0.07)`, color: `rgba(${pkg.accentRgb === '0,255,225' ? '0,255,225' : pkg.accentRgb},0.7)`, border: `1px solid rgba(${pkg.accentRgb},0.15)` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className={`mt-auto flex ${pkg.purchaseCta ? 'gap-2' : ''}`}>
                <a
                  href={pkg.href}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition-all flex-1"
                  style={{ background: `rgba(${pkg.accentRgb},0.1)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.22)` }}
                >
                  {pkg.cta} <ArrowRight size={13} />
                </a>
                {pkg.purchaseCta && pkg.tier !== 'playbook' && (
                  <button
                    onClick={() => openAuth(pkg.tier as Exclude<Tier, 'playbook'>)}
                    className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-sm font-semibold transition-all flex-1"
                    style={{ background: `rgba(${pkg.accentRgb},0.05)`, color: `rgba(${pkg.accentRgb === '0,255,225' ? '0,255,225' : pkg.accentRgb},0.7)`, border: `1px solid rgba(${pkg.accentRgb},0.12)` }}
                  >
                    {pkg.purchaseCta}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <p className="text-xs text-gray-700 max-w-4xl">
        Secure checkout via Stripe. Access granted immediately after payment. Preview mode shows demo data — purchase to enter real facility data.
      </p>
    </div>
  );
}
