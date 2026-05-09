"use client";
import { useState } from "react";
import { Flame } from "lucide-react";

const FUELS = {
  natural_gas: { name: "Natural Gas",  factor: 1730 },
  oil_2:       { name: "#2 Fuel Oil",  factor: 1620 },
  propane:     { name: "Propane",      factor: 1680 },
};
type FuelKey = keyof typeof FUELS;

export default function BoilerCalculator() {
  const [fuel, setFuel] = useState<FuelKey>("natural_gas");
  const [stackTemp, setStackTemp] = useState("");
  const [ambientTemp, setAmbientTemp] = useState("");
  const [o2Pct, setO2Pct] = useState("");
  const [result, setResult] = useState<{ efficiency: number; stackLoss: number; rating: string; tip: string } | null>(null);

  const calculate = () => {
    const stack = parseFloat(stackTemp);
    const ambient = parseFloat(ambientTemp);
    const o2 = parseFloat(o2Pct);
    if (isNaN(stack) || isNaN(ambient) || isNaN(o2) || stack <= ambient) return;

    const factor = FUELS[fuel].factor;
    // Simplified Siegert-derived formula: stack loss accounts for temp differential and excess air via O₂
    const tempDiff = stack - ambient;
    const excessAirMultiplier = 1 + (o2 / Math.max(21 - o2, 0.1)) * 0.45;
    const stackLoss = (tempDiff / factor) * 100 * excessAirMultiplier;
    const efficiency = Math.max(50, Math.min(99, 100 - stackLoss));

    let rating = "Poor", tip = "Tune burner and reduce excess air significantly.";
    if (efficiency >= 85) { rating = "Excellent"; tip = "System is well-tuned. Maintain current settings."; }
    else if (efficiency >= 80) { rating = "Good"; tip = "Minor tuning could recover 1–3% efficiency."; }
    else if (efficiency >= 75) { rating = "Fair"; tip = "Reduce stack temp or O₂% to improve efficiency."; }
    else if (efficiency >= 70) { rating = "Below Average"; tip = "Combustion tune-up needed — check excess air and stack temperature."; }

    setResult({
      efficiency: Math.round(efficiency * 10) / 10,
      stackLoss: Math.round(stackLoss * 10) / 10,
      rating,
      tip,
    });
  };

  const ratingColor = (r: string) =>
    r === "Excellent" ? "#34d399" : r === "Good" ? "#fbbf24" : r === "Fair" ? "#fb923c" : "#f87171";

  return (
    <div className="glass rounded-2xl p-6 border border-[#00FFE1]/15">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(0,255,225,0.1)", border: "1px solid rgba(0,255,225,0.25)" }}>
          <Flame size={18} style={{ color: "#00FFE1" }} />
        </div>
        <div>
          <h3 className="font-bold text-[#00FFE1] text-sm">Boiler Efficiency Calculator</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">Combustion &amp; Stack Loss Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="col-span-2">
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Fuel Type</label>
          <select value={fuel} onChange={(e) => setFuel(e.target.value as FuelKey)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#00FFE1]/40 transition-all">
            {Object.entries(FUELS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Stack Temp (°F)</label>
          <input type="number" placeholder="400" value={stackTemp} onChange={(e) => setStackTemp(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-[#00FFE1]/40 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Ambient Temp (°F)</label>
          <input type="number" placeholder="70" value={ambientTemp} onChange={(e) => setAmbientTemp(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-[#00FFE1]/40 transition-all" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">O₂ in Stack (%)</label>
          <input type="number" placeholder="4.0" step="0.1" value={o2Pct} onChange={(e) => setO2Pct(e.target.value)}
            className="w-full bg-[#041520]/80 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none focus:border-[#00FFE1]/40 transition-all" />
        </div>
        <div className="flex items-end">
          <button onClick={calculate}
            className="w-full px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "rgba(0,255,225,0.1)", border: "1px solid rgba(0,255,225,0.3)", color: "#00FFE1" }}>
            Calculate
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-xl p-4 border" style={{ background: "rgba(0,255,225,0.03)", borderColor: "rgba(0,255,225,0.12)" }}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#00FFE1]">{result.efficiency}%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Efficiency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{result.stackLoss}%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Stack Loss</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: ratingColor(result.rating) }}>{result.rating}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">Rating</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center italic">{result.tip}</p>
        </div>
      )}
    </div>
  );
}
