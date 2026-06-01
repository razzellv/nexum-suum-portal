"use client";
import { useState } from "react";
import { Eye, X } from "lucide-react";
import { TIER_LABELS, Tier } from "../app/lib/auth";
import AuthModal from "./AuthModal";

interface Props {
  tier: Exclude<Tier, 'playbook'>;
}

export default function PreviewBanner({ tier }: Props) {
  const [showAuth, setShowAuth] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const label = TIER_LABELS[tier];

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTier={tier} />}
      <div
        className="flex items-center justify-between px-5 py-3 text-sm"
        style={{
          background: 'rgba(0,255,225,0.06)',
          borderLeft: '3px solid #00FFE1',
          borderBottom: '1px solid rgba(0,255,225,0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Eye size={14} style={{ color: '#00FFE1', flexShrink: 0 }} />
          <span style={{ color: 'rgba(0,255,225,0.85)' }}>
            <strong>Preview Mode</strong> — You&apos;re previewing {label}. Purchase to log data and see real results.
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowAuth(true)}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'rgba(0,255,225,0.12)', color: '#00FFE1', border: '1px solid rgba(0,255,225,0.3)' }}
          >
            Unlock {label} →
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
