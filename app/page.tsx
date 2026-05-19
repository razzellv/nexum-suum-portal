"use client";
import { useState } from "react";
import { Thermometer, Snowflake, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../components/AuthContext";
import AuthModal from "../components/AuthModal";

export default function HomePage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const packages = [
    {
      icon: Thermometer, accent: '#00FFE1', accentRgb: '0,255,225',
      title: 'Boiler Intelligence',
      subtitle: 'For boiler operators and steam plant techs',
      desc: 'Combustion logging · Stack temps · Water chemistry · Efficiency calculator',
      href: '/boiler',
      tier: 'boiler',
    },
    {
      icon: Snowflake, accent: '#38bdf8', accentRgb: '56,189,248',
      title: 'Chiller Intelligence',
      subtitle: 'For chiller operators and HVAC technicians',
      desc: 'Chilled water logging · Refrigerant tracking · COP/EER calculator',
      href: '/chiller',
      tier: 'chiller',
    },
    {
      icon: Building2, accent: '#fbbf24', accentRgb: '251,191,36',
      title: 'Facility Intelligence Lite',
      subtitle: 'For facility managers overseeing multiple mechanical systems',
      desc: 'Both systems · VirtuousBoard · Drift Analyzer · Weekly compliance scoring',
      href: '/facility',
      tier: 'facility',
    },
  ];

  const canAccess = (tier: string) => user && (user.tier === tier || user.tier === 'facility');

  return (
    <div className="min-h-full px-8 pt-10 pb-16" style={{ position: 'relative', zIndex: 1 }}>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Hero */}
      <div className="max-w-3xl mb-12">
        <h1 className="font-display text-5xl font-bold text-white leading-tight mb-3">
          Facility Intelligence Lite
        </h1>
        <p className="text-gray-400 text-lg mb-1">An introduction to the Nexum Suum Intelligence Platform</p>
        <p className="text-sm" style={{ color: 'rgba(0,255,225,0.6)' }}>Start with your system. Upgrade when ready.</p>
      </div>

      {/* 3 package cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-12">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          const accessible = canAccess(pkg.tier);
          return (
            <div key={pkg.tier} className="flex flex-col rounded-2xl p-6 transition-all"
              style={{
                background: 'rgba(2,10,18,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid rgba(${pkg.accentRgb},0.15)`,
                borderRadius: '16px',
              }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `rgba(${pkg.accentRgb},0.1)`, border: `1px solid rgba(${pkg.accentRgb},0.2)` }}>
                  <Icon size={18} style={{ color: pkg.accent }} />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">{pkg.title}</h2>
                  <p className="text-[11px] text-gray-500">{pkg.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 flex-1 mb-5">{pkg.desc}</p>
              {accessible ? (
                <a href={pkg.href}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: `rgba(${pkg.accentRgb},0.12)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.25)` }}>
                  Open Dashboard <ArrowRight size={14} />
                </a>
              ) : (
                <button onClick={() => setShowAuth(true)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: `rgba(${pkg.accentRgb},0.08)`, color: pkg.accent, border: `1px solid rgba(${pkg.accentRgb},0.18)` }}>
                  Access via secure checkout <ArrowRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl p-6 text-center max-w-xl mx-auto"
        style={{ background: 'rgba(2,10,18,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-gray-500 text-sm mb-1">Ready for the full operational intelligence suite?</p>
        <h3 className="font-display text-lg font-semibold text-white mb-3">Nexum Suum FI Platform</h3>
        <p className="text-xs text-gray-600 mb-4">Multi-user · Work orders · AI insights · Unlimited data</p>
        <a href="https://portal.nexumsuum-facilityintelligence.com/pricing" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(0,255,225,0.1)', color: '#00FFE1', border: '1px solid rgba(0,255,225,0.22)' }}>
          View FI Platform Pricing <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );
}
