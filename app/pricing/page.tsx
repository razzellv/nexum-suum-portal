"use client";

import Link from "next/link";

const PRICING_URL = "https://nexumsuum-facilityintelligence.com/pricing";

const plans = [
  {
    name: "FI Basic",
    accent: "#00ff88",
    border: "border-[#00ff88]/40",
    bg: "bg-[#00ff88]/10",
    glow: "hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]",
    textColor: "text-[#00ff88]",
    description: "Essential tools for facility teams getting started with digital optimization.",
    features: [
      "Boiler, Chiller & Facility dashboards",
      "Looker Studio analytics integration",
      "Digital log entry with Google Sheets sync",
      "Full SOP and document library",
      "Compliance templates",
    ],
  },
  {
    name: "FI Pro",
    accent: "#00d4ff",
    border: "border-[#00d4ff]/40",
    bg: "bg-[#00d4ff]/10",
    glow: "hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]",
    textColor: "text-[#00d4ff]",
    description: "Advanced platform for multi-site facilities requiring full collaboration and automation.",
    features: [
      "Everything in FI Basic",
      "Team collaboration and role-based access",
      "Work order management",
      "Vendor management portal",
      "Advanced compliance tracking and reporting",
      "API access and integrations",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020810] px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-medium uppercase tracking-widest">
            Full Platform
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to FI Platform
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            The full Nexum Suum Facility Intelligence Platform includes live dashboards, team collaboration,
            work orders, vendor management, compliance tracking, and more.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl bg-[#0a1628] border ${plan.border} ${plan.glow} transition-all duration-300`}
            >
              <h2 className={`text-2xl font-bold mb-2 ${plan.textColor}`}>
                {plan.name}
              </h2>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className={`${plan.textColor} text-xs mt-0.5`}>▸</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex w-full items-center justify-center px-5 py-3 rounded-xl ${plan.bg} border ${plan.border} ${plan.textColor} font-semibold text-sm hover:opacity-90 transition-all`}
              >
                View {plan.name} Pricing →
              </a>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] font-bold text-lg hover:bg-[#00ff88]/20 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
          >
            Go to Full Platform →
          </a>
          <p className="text-gray-600 text-xs mt-4">
            Questions?{" "}
            <Link href="/" className="text-[#00ff88]/60 hover:text-[#00ff88] transition-colors">
              Return to portal home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
