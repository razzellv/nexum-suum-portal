"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { saveUser, FILiteUser, Tier } from "../lib/auth";
import { useAuth } from "../../components/AuthContext";

function SuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session_id = searchParams.get("session_id");
    if (!session_id) {
      setStatus("error");
      setMessage("No session ID found. If you completed payment, please contact support.");
      return;
    }

    fetch("/.netlify/functions/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.paid) throw new Error(data.error || "Payment not confirmed");
        const user: FILiteUser = {
          name: data.name,
          email: data.email,
          company: data.company,
          tier: data.tier as Tier,
          registeredAt: new Date().toISOString(),
        };
        saveUser(user);
        setUser(user);
        setStatus("success");
        // Redirect to the right module after 2s
        setTimeout(() => router.push(`/${data.tier}`), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Could not verify payment. Please contact support.");
      });
  }, [searchParams, router, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6"
      style={{ background: "#030d14" }}>

      {status === "verifying" && (
        <>
          <Loader2 size={40} className="animate-spin mb-4" style={{ color: "#00FFE1" }} />
          <p className="text-white font-semibold text-lg mb-1">Confirming your payment…</p>
          <p className="text-gray-600 text-sm">Just a moment while we verify with Stripe.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle size={48} className="mb-4" style={{ color: "#34d399" }} />
          <p className="text-white font-bold text-xl mb-2">Payment confirmed — welcome!</p>
          <p className="text-gray-500 text-sm">Taking you to your portal now…</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={48} className="mb-4" style={{ color: "#f87171" }} />
          <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">{message}</p>
          <a href="mailto:support@nexumsuum.com"
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "rgba(0,255,225,0.08)", border: "1px solid rgba(0,255,225,0.25)", color: "#00FFE1" }}>
            Contact Support →
          </a>
        </>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#030d14" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#00FFE1" }} />
      </div>
    }>
      <SuccessInner />
    </Suspense>
  );
}
