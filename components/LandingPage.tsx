"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-10 text-center relative z-10">
      <h1 className="text-4xl font-bold text-emerald-400 drop-shadow-md">Nexum Suum Portal ✅</h1>
      <p className="text-gray-300 max-w-xl leading-relaxed">
        Facility Efficiency. Digital Compliance. Smart Automation.<br />
        Optimize your facilities, track efficiency, and ensure compliance — all from one smart dashboard.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          onClick={() => router.push("/boiler")}
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-400 transition"
        >
          Boiler Log
        </button>
        <button
          onClick={() => router.push("/chiller")}
          className="px-6 py-3 bg-sky-500 text-white rounded-xl shadow-md hover:bg-sky-400 transition"
        >
          Chiller Log
        </button>
        <button
          onClick={() => router.push("/compliance")}
          className="px-6 py-3 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-400 transition"
        >
          Compliance View
        </button>
      </div>
    </div>
  );
}