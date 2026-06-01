"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { Tier, FILiteUser, loadUser, saveUser, TIER_LABELS } from "../app/lib/auth";

interface Props {
  onClose: () => void;
  defaultTier?: Exclude<Tier, 'playbook'>;
}

const TIERS: { value: Exclude<Tier, 'playbook'>; label: string; desc: string; color: string }[] = [
  { value: "boiler",   label: "Boiler Intelligence",        desc: "Combustion, log sheets, safety protocols, Looker dashboard", color: "#00FFE1" },
  { value: "chiller",  label: "Chiller Intelligence",       desc: "Chilled water logs, cooling tower, refrigerant monitoring",  color: "#38bdf8" },
  { value: "facility", label: "Facility Intelligence Lite", desc: "All systems: SOPs, compliance, Virtuous logger, dashboards",  color: "#fbbf24" },
];

export default function AuthModal({ onClose, defaultTier }: Props) {
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("register");

  // Register state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Exclude<Tier, 'playbook'>>(defaultTier ?? "boiler");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !company) { setError("All fields are required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), company: company.trim(), tier }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const OWNER_EMAIL = "razzellv@nexumsuum.com";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = loginEmail.trim().toLowerCase();

    if (normalized === OWNER_EMAIL) {
      const ownerUser: FILiteUser = {
        email: OWNER_EMAIL,
        name: "Owner",
        company: "Nexum Suum",
        tier: "facility",
        registeredAt: new Date().toISOString(),
      };
      saveUser(ownerUser);
      setUser(ownerUser);
      onClose();
      return;
    }

    const stored = loadUser();
    if (stored && stored.email === normalized) {
      setUser(stored);
      onClose();
    } else {
      setError("No account found for that email on this device. Please register.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{ background: "#01121e", border: "1px solid rgba(0,255,225,0.2)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
              style={{ background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.2)", color: "#00FFE1" }}>NS</div>
            <span className="font-bold text-white">FI Lite Portal</span>
          </div>
          <p className="text-gray-500 text-xs">Intelligence access for facility professionals</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-0.5 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["register", "login"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t ? { background: "rgba(0,255,225,0.1)", color: "#00FFE1" } : { color: "rgba(148,163,184,0.6)" }}>
              {t === "register" ? "Get Started" : "Sign In"}
            </button>
          ))}
        </div>

        {tab === "register" ? (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith"
                className="w-full bg-[#041520]/80 border border-gray-800 focus:border-[#00FFE1]/40 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Company / Facility</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Industrial"
                className="w-full bg-[#041520]/80 border border-gray-800 focus:border-[#00FFE1]/40 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Work Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com"
                className="w-full bg-[#041520]/80 border border-gray-800 focus:border-[#00FFE1]/40 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1.5">Select Tier</label>
              <div className="space-y-2">
                {TIERS.map((t) => (
                  <button key={t.value} type="button" onClick={() => setTier(t.value)}
                    className="w-full text-left rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      background: tier === t.value ? `rgba(${t.value === 'boiler' ? '0,255,225' : t.value === 'chiller' ? '56,189,248' : '251,191,36'},0.08)` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${tier === t.value ? t.color + '50' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <p className="text-sm font-semibold" style={{ color: tier === t.value ? t.color : 'rgba(148,163,184,0.8)' }}>{t.label}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all mt-2"
              style={{ background: "#00FFE1", color: "#001923", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Redirecting to checkout…" : "Continue to Payment →"}
            </button>
            <p className="text-[11px] text-gray-600 text-center">
              Secure checkout via Stripe. Access is granted immediately after payment.
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Work Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="jane@acme.com"
                className="w-full bg-[#041520]/80 border border-gray-800 focus:border-[#00FFE1]/40 rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all" />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: "rgba(0,255,225,0.1)", border: "1px solid rgba(0,255,225,0.3)", color: "#00FFE1" }}>
              Sign In →
            </button>
            <p className="text-[11px] text-gray-600 text-center">
              Sign-in works on the device you registered on. New device? Register again.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
