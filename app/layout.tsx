import "./globals.css";
import EnergyFlowParticles from "/components/EnergyFlowParticles";

export const metadata = {
  title: "Nexum Suum Portal",
  description: "Facility Optimization • Digital Compliance • Smart Automation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-gray-100 overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 -z-10">
          <EnergyFlowParticles />
        </div>

        {/* Main content area */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>

          {/* Global footer navigation */}
          <footer className="border-t border-gray-800 bg-zinc-950/70 backdrop-blur-sm py-3 text-center text-sm text-gray-400">
            Nexum Suum © 2025 — Facility Efficiency & Digital Compliance
          </footer>
        </div>
      </body>
    </html>
  );
}