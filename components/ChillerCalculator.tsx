"use client";
import { useState } from "react";
import { Snowflake } from "lucide-react";

export default function ChillerCalculator() {
  const [tons, setTons] = useState("");
  const [kw, setKw] = useState("");
  const [energyRate, setEnergyRate] = useState("0.12");
  const [result, setResult] = useState<{
    cop: number; eer: number; kwPerTon: number; costPerHr: number; rating: string; tip: string;
  } | null>(null);

  const calculate = () => {
    const t = parseFloat(tons);
    const k = parseFloat(kw);
    const rate = parseFloat(energyRate);
    if (isNaN(t) || isNaN(k) || t <= 0 || k <= 0) return;

    // COP = cooling output (kW) / electrical input (kW)
    // 1 ton of cooling = 3.517 kW
    const cop = (t * 3.517) / k;
    const eer = cop * 3.412;        // BTU/h per watt
    const kwPerTon = k / t;         // lower is better; best centrifugal chillers reach 0.45–0.55
    const costPerHr = k * rate;

    let rating = "Poor", tip = "System is operating inefficiently — check refrigerant charge and condenser conditions.";
    if (cop >= 5.5) { rating = "Excellent"; tip = "Top-tier performance. Maintain clean condenser tubes and optimal setpoints."; }
    else if (cop >= 4.5) { rating = "Good"; tip = "Good performance. Small gains possible via condenser optimization."; }
    else if (cop >= 3.5) { rating = "Fair"; tip = "Review condenser water temps and approach temperatures for savings."; }
    else if (cop >= 2.5) { rating = "Below Average"; tip = "Refrigerant charge, fouling, or setpoint drift may be costing efficiency."; }

    setResult({
      cop: Math.round(cop * 100) / 100,
      eer: Math.round(eer * 10) / 10,
      kwPerTon: Math.round(kwPerTon * 1000) / 1000,
      costPerHr: Math.round(costPerHr * 100) / 100,
      rating,
      tip,
    });
  };

  const ratingColor = (r: string) =>
    r === "Excellent" ? "#34d399" : r === "Good" ? "#fbbf24" : r === "Fair" ? "#fb923c" : "#f87171";

  return (
    <div className="glass rounded-2xl p-6 border border-sky-500/15">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)" }}>
          <Snowflake size={18} style={{ color: "#38bdf8" }} />
        </div>
        <div>
          <h3 className="font-bold text-sky-400 text-sm">Chiller Efficiency Calculator</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">COP · EER · kW/Ton Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Cooling Capacity (Tons)</label>
          <input type="number" placeholder="200" value={tons} onChange={(e) => setTons(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-sky-500/40 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Power Draw (kW)</label>
          <input type="number" placeholder="140" value={kw} onChange={(e) => setKw(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-sky-500/40 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Energy Rate ($/kWh)</label>
          <input type="number" placeholder="0.12" step="0.01" value={energyRate} onChange={(e) => setEnergyRate(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-sky-500/40 transition-all" />
        </div>
        <div className="flex items-end">
          <button onClick={calculate}
            className="w-full px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-xl p-4 border" style={{ background: "rgba(56,189,248,0.03)", borderColor: "rgba(56,189,248,0.12)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold text-sky-400">{result.cop}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">COP</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-sky-400">{result.eer}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">EER</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-sky-300">{result.kwPerTon}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">kW/Ton</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-emerald-400">${result.costPerHr}/hr</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Cost/Hr</p>
            </div>
          </div>
          <div className="text-center mb-2">
            <span className="text-sm font-bold" style={{ color: ratingColor(result.rating) }}>{result.rating}</span>
          </div>
          <p className="text-xs text-gray-500 text-center italic">{result.tip}</p>
        </div>
      )}
    </div>
  );
}
