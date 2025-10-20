export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-black text-gray-200 p-10">
      <h1 className="text-4xl font-bold text-amber-400 mb-6">Compliance View</h1>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">OSHA & EPA Checklist</h2>
          <p className="text-gray-400">All required logs and audits up to date.</p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">System Documents</h2>
          <p className="text-gray-400">View permits, training records, and inspection reports.</p>
        </div>
      </section>
    </main>
  );
}