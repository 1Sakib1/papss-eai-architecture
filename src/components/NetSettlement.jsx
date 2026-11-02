import React, { useState } from 'react';
import { GitBranch, CheckCircle2, AlertTriangle, ShieldCheck, Scale, FileCheck2, UserCheck, RefreshCw } from 'lucide-react';

export default function NetSettlement() {
  const [positions, setPositions] = useState([
    {
      id: "ECOCGHAC",
      name: "Ecobank Ghana Limited",
      role: "DIRECT",
      grossDebits: 4250000.00,
      grossCredits: 1180500.00,
      txnCount: 1284
    },
    {
      id: "GHCBGHAC",
      name: "Ghana Commercial Bank",
      role: "DIRECT",
      grossDebits: 920000.00,
      grossCredits: 2310000.00,
      txnCount: 655
    },
    {
      id: "AFRXEGCX",
      name: "African Export-Import Bank",
      role: "SETTLEMENT_AGENT",
      grossDebits: 0.00,
      grossCredits: 1679500.00,
      txnCount: 0
    }
  ]);

  const [officer1Signed, setOfficer1Signed] = useState(true);
  const [officer2Signed, setOfficer2Signed] = useState(true);
  const [isDispatched, setIsDispatched] = useState(false);

  // Compute calculated net amounts
  const computedPositions = positions.map(p => ({
    ...p,
    netAmount: p.grossCredits - p.grossDebits
  }));

  const totalDebits = computedPositions.reduce((sum, p) => sum + p.grossDebits, 0);
  const totalCredits = computedPositions.reduce((sum, p) => sum + p.grossCredits, 0);
  const totalNet = computedPositions.reduce((sum, p) => sum + p.netAmount, 0);
  const isBalanced = Math.abs(totalNet) < 0.01;
  const isAuthorized = officer1Signed && officer2Signed;

  const handleResetDefaults = () => {
    setPositions([
      { id: "ECOCGHAC", name: "Ecobank Ghana Limited", role: "DIRECT", grossDebits: 4250000.00, grossCredits: 1180500.00, txnCount: 1284 },
      { id: "GHCBGHAC", name: "Ghana Commercial Bank", role: "DIRECT", grossDebits: 920000.00, grossCredits: 2310000.00, txnCount: 655 },
      { id: "AFRXEGCX", name: "African Export-Import Bank", role: "SETTLEMENT_AGENT", grossDebits: 0.00, grossCredits: 1679500.00, txnCount: 0 }
    ]);
    setOfficer1Signed(true);
    setOfficer2Signed(true);
    setIsDispatched(false);
  };

  const handleUpdateDebit = (index, val) => {
    const num = parseFloat(val) || 0;
    const next = [...positions];
    next[index].grossDebits = num;
    setPositions(next);
    setIsDispatched(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Multilateral Netting & Central Bank Settlement</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Multilateral Net Settlement Engine (Cycle: PAPSS-CYCLE-2026-10-15)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              At the Day Cutoff timer, Settlement Orchestration computes multilateral net positions and issues parallel settlement instructions (WS-05) across Bank of Ghana RTGS, CBN RTGS, and Afreximbank.
            </p>
          </div>
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Cycle Defaults</span>
          </button>
        </div>
      </div>

      {/* Cycle Balance Indicator Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isBalanced
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : 'bg-red-950/40 border-red-500/50 text-red-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {isBalanced ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {isBalanced
                  ? 'Cycle Balanced — Zero-Sum Clearing Verified (0.00 GHS)'
                  : 'Reconciliation Break Detected — Cycle Out of Balance!'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isBalanced
                  ? 'Total gross debits exactly match gross credits across all 3 clearing participants. Ready for RTGS release.'
                  : `Sum of net positions is ${totalNet.toFixed(2)} GHS. Violates multilateral netting conservation rule; triggers SettlementMismatch fault.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase block">Total Net Amount:</span>
              <span className={`text-lg font-extrabold ${isBalanced ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalNet >= 0 ? '+' : ''}{totalNet.toFixed(2)} GHS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Participant Positions Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Multilateral Net Position Matrix</h3>
          <span className="text-xs font-mono text-slate-400">Target: Bank of Ghana RTGS (GHS Leg)</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Participant</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Gross Debits (GHS)</th>
                <th className="py-2.5 px-3">Gross Credits (GHS)</th>
                <th className="py-2.5 px-3">Net Position (GHS)</th>
                <th className="py-2.5 px-3">Txn Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {computedPositions.map((pos, idx) => (
                <tr key={pos.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{pos.name}</span>
                    <span className="text-[11px] text-brand-400">{pos.id}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {pos.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={pos.grossDebits}
                      onChange={(e) => handleUpdateDebit(idx, e.target.value)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none focus:border-brand-500 font-mono"
                    />
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {pos.grossCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      pos.netAmount < 0
                        ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                        : pos.netAmount > 0
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                        : 'text-slate-400'
                    }`}>
                      {pos.netAmount >= 0 ? '+' : ''}{pos.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans">{pos.txnCount.toLocaleString()} txns</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-900/90 font-mono font-bold text-xs border-t border-slate-800 text-slate-300">
              <tr>
                <td className="py-2.5 px-3">Cycle Totals</td>
                <td className="py-2.5 px-3">3 Members</td>
                <td className="py-2.5 px-3 text-white">{totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="py-2.5 px-3 text-white">{totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className={`py-2.5 px-3 ${isBalanced ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalNet.toFixed(2)} GHS
                </td>
                <td className="py-2.5 px-3 font-sans">1,939 payments</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Dual Control Authorization & Release Workflow */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-0.5">
            <UserCheck className="w-4 h-4" />
            <span>Dual-Control Governance (minOccurs='2' maxOccurs='2')</span>
          </div>
          <h3 className="text-base font-bold text-white">Settlement Release Authorization</h3>
          <p className="text-xs text-slate-300 mt-1">
            As enforced in <code>NetSettlementInstruction.xsd</code>, release to central bank RTGS systems requires exactly two authorized settlement officers' cryptographic sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-white">Officer 1: K. Mensah</div>
              <div className="text-[11px] text-slate-400">Head of Settlement Operations</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">X.509 Certificate: Valid</div>
            </div>
            <input
              type="checkbox"
              checked={officer1Signed}
              onChange={(e) => setOfficer1Signed(e.target.checked)}
              className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-white">Officer 2: A. Danquah</div>
              <div className="text-[11px] text-slate-400">Settlement Oversight & Compliance</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">X.509 Certificate: Valid</div>
            </div>
            <input
              type="checkbox"
              checked={officer2Signed}
              onChange={(e) => setOfficer2Signed(e.target.checked)}
              className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Dispatch Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isBalanced && isAuthorized ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ready for WS-05 Dispatch to Bank of Ghana RTGS
              </span>
            ) : !isBalanced ? (
              <span className="text-red-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Blocked: Cycle must balance to 0.00 GHS before release
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Blocked: Dual-control sign-off required from both officers
              </span>
            )}
          </div>

          <button
            onClick={() => setIsDispatched(true)}
            disabled={!isBalanced || !isAuthorized || isDispatched}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isDispatched ? 'Dispatched & Confirmed (SETTLED)' : 'Authorize & Submit WS-05 Instruction'}
          </button>
        </div>

        {isDispatched && (
          <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 animate-fadeIn space-y-1">
            <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Bank of Ghana Confirmation: SETTLED
            </div>
            <p className="text-xs text-slate-300">
              Central bank journal confirmation <code>BOG-RTGS-CONF-20261015-88391</code> received. Settled volume: 3,069,500.00 GHS. Netting cycle closed with zero reconciliation variance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
