"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020810]/90 backdrop-blur border-b border-[#1a3a5c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#00ff88] font-bold text-xl tracking-tight group-hover:text-[#00d4ff] transition-colors">
              Nexum Suum
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link
              href="/boiler"
              className="text-gray-300 hover:text-[#00ff88] transition-colors text-sm font-medium"
            >
              Boiler
            </Link>
            <Link
              href="/chiller"
              className="text-gray-300 hover:text-[#00d4ff] transition-colors text-sm font-medium"
            >
              Chiller
            </Link>
            <Link
              href="/facility"
              className="text-gray-300 hover:text-[#ffb800] transition-colors text-sm font-medium"
            >
              Facility
            </Link>
            <Link
              href="/pricing"
              className="ml-2 px-4 py-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] text-sm font-semibold hover:bg-[#00ff88]/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
