"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center text-gray-200">
      <h1 className="text-5xl font-bold text-emerald-400 drop-shadow-md">Nexum Suum Portal ✅</h1>

      <p className="mt-4 text-lg max-w-2xl leading-relaxed text-gray-300">
        Facility Efficiency • Digital Compliance • Smart Automation  
        <br />Your operations, logs & compliance in one intelligent view.
      </p>

      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <button
          onClick={() => router.push("/boiler")}
          className="px-8 py-3 bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-500 transition font-semibold"
        >
          Boiler Dashboard
        </button>
        <button
          onClick={() => router.push("/chiller")}
          className="px-8 py-3 bg-sky-600 rounded-xl shadow-md hover:bg-sky-500 transition font-semibold"
        >
          Chiller Dashboard
        </button>
        <button
          onClick={() => router.push("/compliance")}
          className="px-8 py-3 bg-amber-600 rounded-xl shadow-md hover:bg-amber-500 transition font-semibold"
        >
          Compliance View
        </button>
      </div>
    </section>
  );
}