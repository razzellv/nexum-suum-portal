"use client";
import { useState, ReactNode } from "react";
import { Lock } from "lucide-react";
import { Tier, TIER_LABELS } from "../app/lib/auth";
import AuthModal from "./AuthModal";

interface Props {
  locked: boolean;
  tier: Exclude<Tier, 'playbook'>;
  children: ReactNode;
}

export default function LockedInput({ locked, tier, children }: Props) {
  const [showAuth, setShowAuth] = useState(false);
  const [showTip, setShowTip] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultTier={tier} />}
      <div
        className="relative"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={() => setShowAuth(true)}
        style={{ cursor: 'not-allowed' }}
      >
        <div style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ cursor: 'not-allowed' }}
        >
          <Lock size={12} style={{ color: '#00FFE1', opacity: 0.6 }} />
        </div>
        {showTip && (
          <div
            className="absolute z-30 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none"
            style={{
              background: '#01121e',
              border: '1px solid rgba(0,255,225,0.25)',
              color: '#00FFE1',
              bottom: '110%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            Purchase {TIER_LABELS[tier]} to unlock
          </div>
        )}
      </div>
    </>
  );
}
