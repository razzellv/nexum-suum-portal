"use client";

import Link from "next/link";

const PRICING_URL = "https://nexumsuum-facilityintelligence.com/pricing";

const plans = [
  {
    name: "FI Basic",
    accent: "#00FFE1",
    accentRgb: "0, 255, 225",
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
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
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
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#00FFE1]/30 text-[#00FFE1] text-xs font-semibold uppercase tracking-widest bg-[#00FFE1]/5">
          Full Platform
        </div>
        <h1 className="text-3xl font-bold text-[hsl(200_18%_84%)] mb-4">
          Upgrade to Nexum Suum FI Platform
        </h1>
        <p className="text-[hsl(200_15%_55%)] max-w-xl mx-auto text-sm">
          The full Nexum Suum Facility Intelligence Platform includes live team dashboards, work orders,
          vendor management, compliance tracking, and more.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="p-8 rounded-xl border transition-all duration-300"
            style={{
              background: "hsl(200 50% 10%)",
              borderColor: `rgba(${plan.accentRgb}, 0.3)`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${plan.accentRgb}, 0.6)`;
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px rgba(${plan.accentRgb}, 0.1)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${plan.accentRgb}, 0.3)`;
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: plan.accent }}>
              {plan.name}
            </h2>
            <p className="text-sm text-[hsl(200_15%_55%)] mb-6">{plan.description}</p>
            <ul className="space-y-2 mb-8">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[hsl(200_18%_84%)]">
                  <span className="text-xs mt-0.5" style={{ color: plan.accent }}>▸</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={PRICING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center px-5 py-3 rounded-lg font-semibold text-sm transition-all"
              style={{
                background: `rgba(${plan.accentRgb}, 0.1)`,
                border: `1px solid rgba(${plan.accentRgb}, 0.35)`,
                color: plan.accent,
              }}
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
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00FFE1] text-[#001923] font-bold text-base hover:bg-[#00FFE1]/90 teal-glow transition-all"
        >
          Go to Full Platform →
        </a>
        <p className="text-[hsl(200_15%_45%)] text-xs mt-4">
          Questions?{" "}
          <Link href="/" className="text-[#00FFE1]/60 hover:text-[#00FFE1] transition-colors">
            Return to portal home
          </Link>
        </p>
      </div>
    </div>
  );
}
