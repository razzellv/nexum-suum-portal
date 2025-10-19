"use client";

import EnergyFlowParticles from "../components/EnergyFlowParticles";
import LandingPage from "../components/LandingPage";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="absolute inset-0 -z-10">
        <EnergyFlowParticles />
      </div>

      <section className="text-center z-10 p-10 bg-black/30 backdrop-blur-md rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-emerald-400 mb-4">
          Nexum Suum Portal
        </h1>
        <p className="mb-6 text-gray-200">
          Facility Efficiency. Digital Compliance. Smart Automation.
        </p>

        <LandingPage />
      </section>
    </main>
  );
}