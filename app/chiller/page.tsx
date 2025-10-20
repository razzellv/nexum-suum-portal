export default function ChillerPage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 p-10">
      <h1 className="text-4xl font-bold text-sky-400 mb-6">Chiller Dashboard</h1>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Cooling Load</h2>
          <p className="text-gray-400">Monitor tonnage, evaporator ΔT, and runtime hours.</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Electrical Performance</h2>
          <p className="text-gray-400">Compressor amps and kW within nominal range.</p>
        </div>
      </section>
    </main>
  );
}