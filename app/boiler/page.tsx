export default function BoilerPage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 p-10">
      <h1 className="text-4xl font-bold text-emerald-400 mb-6">Boiler Dashboard</h1>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Efficiency Overview</h2>
          <p className="text-gray-400">Track stack temp, O₂ levels, and fuel usage in real time.</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">System Status</h2>
          <p className="text-gray-400">All safety interlocks and cutoffs active ✅</p>
        </div>
      </section>
    </main>
  );
}