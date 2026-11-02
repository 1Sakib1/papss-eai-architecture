import React, { useState } from 'react';
import { MAPPINGS, CANONICAL_COMPARISON } from '../data/mappingData';
import { RefreshCw, ArrowRight, Layers, Calculator, CheckCircle2, TrendingDown } from 'lucide-react';

export default function DataTransformation() {
  const [participantsCount, setParticipantsCount] = useState(10);
  const [selectedMapping, setSelectedMapping] = useState(MAPPINGS[0]);

  const p2pCount = participantsCount * (participantsCount - 1);
  const hubCount = participantsCount;
  const savingsPct = (((p2pCount - hubCount) / p2pCount) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <RefreshCw className="w-4 h-4" />
              <span>Data Transformation & Integration Patterns</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Canonical ISO 20022 Mapping & Complexity Reduction
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              The Data Transformation component converts each bank's proprietary core-banking format into one canonical ISO 20022 payload at the edge of the hub, so no participant ever has to understand another participant's format.
            </p>
          </div>
          <div className="text-xs font-mono bg-brand-950/60 px-3 py-1.5 rounded-lg border border-brand-500/30 text-brand-300 font-bold">
            Canonical Data Model (Hohpe & Woolf, 2004)
          </div>
        </div>
      </div>

      {/* Interactive Scaling Calculator: O(N) vs O(N^2) */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-950 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-brand-400 tracking-wider">
              Integration Architecture Metric
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-400" />
              <span>Network Scalability: Point-to-Point vs. Canonical Hub</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Slide to simulate connecting Africa's financial institutions across all 54 nations.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Participating Banks / Central Banks:</span>
            <span className="font-mono text-xl font-extrabold text-brand-400">{participantsCount}</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={2}
            max={54}
            value={participantsCount}
            onChange={(e) => setParticipantsCount(parseInt(e.target.value, 10))}
            className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>2 (Corridor Pilot)</span>
            <span>6 (Current PAPSS Live)</span>
            <span>25 (Regional Union)</span>
            <span>54 (Full Pan-African Union)</span>
          </div>
        </div>

        {/* Comparison Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-left space-y-1">
            <span className="text-[10px] font-mono uppercase text-red-400">Point-to-Point Architecture [O(N²)]</span>
            <div className="text-2xl font-extrabold text-red-300 font-mono">
              {p2pCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Custom pairwise translators needed across participants (N × [N - 1])</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-left space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400">PAPSS Canonical Hub [O(N)]</span>
            <div className="text-2xl font-extrabold text-emerald-300 font-mono">
              {hubCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">Canonical adapters needed (1 adapter per connected institution)</p>
          </div>

          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/40 text-left space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-400">Integration Cost Savings</span>
            <div className="text-2xl font-extrabold text-brand-300 font-mono flex items-center gap-1.5">
              <TrendingDown className="w-6 h-6 text-brand-400" />
              <span>{savingsPct}%</span>
            </div>
            <p className="text-[11px] text-slate-400">Reduction in contract maintenance, translation overhead, and regression risk</p>
          </div>
        </div>
      </div>

      {/* Field Transformation Matrix Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Three-Tier Data Transformation Matrix</h3>
            <p className="text-xs text-slate-400">
              Tracing fields from Ecobank Ghana Core Banking → Canonical ISO 20022 pacs.008 → Alt Bank Nigeria NUBAN Ledger
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Ecobank Core Banking Field</th>
                <th className="py-2.5 px-3">Canonical ISO 20022 Element</th>
                <th className="py-2.5 px-3">Alt Bank Nigeria Target Field</th>
                <th className="py-2.5 px-3">Transformation Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {MAPPINGS.map((m, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="text-amber-400 font-bold">{m.sourceField}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">{m.sourceType}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-brand-300 font-bold">{m.isoElement}</span>
                    <span className="text-[10px] text-slate-400 block">WS-01: {m.wsField}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 font-bold">{m.targetField}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">{m.targetType}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] leading-relaxed max-w-xs">
                    {m.rule}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
