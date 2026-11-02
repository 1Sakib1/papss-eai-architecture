import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, AlertTriangle, ShieldAlert, Clock, ArrowRight, FileCheck, Layers } from 'lucide-react';

const SCENARIOS = {
  happy_path: {
    id: "happy_path",
    title: "1. Clean Happy Path (Standard Execution)",
    description: "Successful cross-border payment of 250,000.00 GHS from Roffi Trading Ltd (Ecobank Ghana) to Legos Corp (Alt Bank Nigeria). Converted at 24.871500 to 6,217,875.00 NGN and settled in under 120 seconds.",
    outcome: "SUCCESS (ACSC)",
    steps: [
      {
        id: 1,
        lane: "Customer Channel (Ghana)",
        actor: "Roffi Trading Ltd",
        action: "Enter Payment",
        detail: "Roffi Trading submits payment for 250,000.00 GHS to Legos Corp via corporate banking portal.",
        payload: "REST JSON { debtor: 'Roffi Trading', amount: 250000.00, ccy: 'GHS', creditor: 'Legos Corp' }",
        state: "Initiated"
      },
      {
        id: 2,
        lane: "Payment Operations (Ecobank Ghana)",
        actor: "Ecobank Ghana Adapter",
        action: "Hold GHS & Generate UETR",
        detail: "Ecobank debits customer account with hold, assigns UETR (8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58), maps TXN_REF to pacs.008, signs with X.509.",
        payload: "pacs.008.001.08 / SOAP 1.2 via WS-01 SubmitPaymentInstruction",
        state: "Debited (Hold)"
      },
      {
        id: 3,
        lane: "API Gateway (PAPSS)",
        actor: "PAPSS API Gateway",
        action: "Validate Schema & Idempotency",
        detail: "API Gateway verifies XML schema against Task 3 XSDs, validates X.509 certificate over MTLS, and verifies UETR is unique in cache.",
        payload: "HTTP 200 OK / Schema Validated / WS-01 Acknowledgement ACTC",
        state: "Accepted (ACTC)"
      },
      {
        id: 4,
        lane: "Business Rules (PAPSS)",
        actor: "Compliance & Sanctions Screening",
        action: "WS-02 ValidatePaymentInstruction",
        detail: "Screen debtor and creditor against UN, OFAC, and regional lists. Score: 0/100 (CLEAR). Account format passes NUBAN validation.",
        payload: "WS-02 Result: validationStatus=PASS, complianceStatus=CLEAR",
        state: "Screened CLEAR"
      },
      {
        id: 5,
        lane: "Treasury/Liquidity (PAPSS)",
        actor: "Pre-Funding Management",
        action: "WS-04 Check Funds & RESERVE",
        detail: "Ecobank GHS clearing balance is 4,250,000.00 GHS. Earmarks 250,000.00 GHS (RESERVE). Available balance drops to 4,000,000.00 GHS.",
        payload: "WS-04 RESERVE { amount: 250000.00, ccy: 'GHS', balanceAfter: 4000000.00 }",
        state: "Funds Reserved"
      },
      {
        id: 6,
        lane: "Workflow Management (PAPSS)",
        actor: "BPEL Process Engine",
        action: "Apply FX Quote & Route to Alt Bank",
        detail: "Applies guaranteed exchange rate of 24.871500 GHS/NGN. Instructed credit amount computed: 6,217,875.00 NGN.",
        payload: "pacs.008 mapped to Alt Bank Nigeria adapter",
        state: "FX Converted"
      },
      {
        id: 7,
        lane: "Payment Operations (Alt Bank Nigeria)",
        actor: "Alt Bank Adapter",
        action: "WS-03 ConfirmBeneficiaryCredit",
        detail: "Alt Bank validates NUBAN 3081447729 for Legos Corp, posts immediate credit of 6,217,875.00 NGN, and replies with ACSC journal ref.",
        payload: "WS-03 Response: creditStatus=ACSC, journalRef=ALTB-NG-TXN-20261015-99214",
        state: "Credited (ACSC)"
      },
      {
        id: 8,
        lane: "Error Handling & Notifications",
        actor: "PAPSS Notification Service",
        action: "WS-06 NotifyPaymentStatus",
        detail: "Outbound notification pushes final ACSC result to Ecobank Ghana, Credit Notice to Legos Corp, and confirms clearing status.",
        payload: "WS-06 Result: status=ACSC, delivered=true",
        state: "Notified (ACSC)"
      },
      {
        id: 9,
        lane: "Multilateral Settlement (EOD)",
        actor: "Settlement Orchestration",
        action: "WS-05 Net Settlement Cycle",
        detail: "At 17:30 UTC Cutoff, multilateral net positions are submitted to Bank of Ghana RTGS (-3,069,500.00 GHS), CBN RTGS, and Afreximbank.",
        payload: "NetSettlementInstruction.xsd: TotalNetAmount = 0.00 GHS (Balanced Cycle)",
        state: "SETTLED"
      }
    ]
  },
  insufficient_funds: {
    id: "insufficient_funds",
    title: "2. Insufficient Pre-Funding (AM04 Hold & Auto-Resume)",
    description: "Ecobank Ghana has an available clearing balance of only 186,420.75 GHS against a required 250,000.00 GHS. Payment is placed on HOLD (PDNG), Top-up request emitted to treasury, BoG RTGS funds transferred, and transaction auto-resumes!",
    outcome: "HOLD → AUTO-RECOVERY → ACSC",
    steps: [
      {
        id: 1,
        lane: "Customer Channel (Ghana)",
        actor: "Roffi Trading Ltd",
        action: "Enter Payment",
        detail: "Roffi Trading submits payment for 250,000.00 GHS to Legos Corp.",
        payload: "REST JSON { amount: 250000.00, ccy: 'GHS' }",
        state: "Initiated"
      },
      {
        id: 2,
        lane: "API Gateway (PAPSS)",
        actor: "API Gateway",
        action: "Admit Instruction",
        detail: "Schema and signature validated; admitted to BPEL orchestration with reference PAPSS-2026-GH-0001234.",
        payload: "WS-01 Status: ACTC",
        state: "Accepted"
      },
      {
        id: 3,
        lane: "Business Rules (PAPSS)",
        actor: "Sanctions & Compliance",
        action: "WS-02 Screening",
        detail: "Originator and Beneficiary screened: CLEAR.",
        payload: "complianceStatus=CLEAR",
        state: "Screened"
      },
      {
        id: 4,
        lane: "Treasury/Liquidity (PAPSS)",
        actor: "Pre-Funding Management",
        action: "WS-04 Check Funds → Fault AM04 Raised!",
        detail: "Ecobank GHS balance is 186,420.75 GHS. Shortfall is 63,579.25 GHS. SOAP Fault InsufficientPreFunding (AM04) raised!",
        payload: "SOAP Fault AM04: shortfall=63579.25, recoveryAction=HOLD_AND_REQUEST_TOPUP, retryAfter=PT30M",
        state: "Fault AM04 Raised"
      },
      {
        id: 5,
        lane: "Workflow Management (PAPSS)",
        actor: "BPEL Process Engine",
        action: "Hold Payment (Status PDNG)",
        detail: "Workflow catches AM04 fault. Does NOT reject payment! Enters 'Mark Pending' state and arms PT30M timeout timer.",
        payload: "Payment state set to PDNG; Customer debit preserved",
        state: "HELD (PDNG)"
      },
      {
        id: 6,
        lane: "Error Handling & Notifications",
        actor: "Notification Service",
        action: "WS-06 Top-up Request Dispatched",
        detail: "Dispatches automated Top-up request to Ecobank Ghana Treasury specifying shortfall of 63,579.25 GHS.",
        payload: "WS-06 TOPUP_REQUEST { shortfall: 63579.25, currency: 'GHS' }",
        state: "Top-up Requested"
      },
      {
        id: 7,
        lane: "Treasury (Ecobank Ghana) & BoG RTGS",
        actor: "Bank of Ghana RTGS",
        action: "GHS Funding Order & Credit landed",
        detail: "Ecobank treasury sends GHS funding order to BoG RTGS. Central bank confirms transfer; WS-04 credited with 200,000.00 GHS.",
        payload: "WS-04 CREDIT from BoG RTGS ref BOG-FT-20261015-88392",
        state: "Liquidity Replenished"
      },
      {
        id: 8,
        lane: "Treasury/Liquidity (PAPSS)",
        actor: "Pre-Funding Management",
        action: "Funds Available Event → Auto-Resume",
        detail: "The Funds Available conditional event fires at the Wait Funds gateway. Check Funds re-runs RESERVE and now succeeds!",
        payload: "WS-04 RESERVE { amount: 250000.00 GHS } → APPLIED",
        state: "Auto-Resumed"
      },
      {
        id: 9,
        lane: "Payment Operations (Alt Bank Nigeria)",
        actor: "Alt Bank Adapter",
        action: "WS-03 Beneficiary Credit & Settlement",
        detail: "Proceeds seamlessly to credit Legos Corp in NGN. Final status ACSC confirmed!",
        payload: "WS-03 ACSC Confirmation / Payment completed without manual re-entry",
        state: "Completed (ACSC)"
      }
    ]
  },
  sanctions_hit: {
    id: "sanctions_hit",
    title: "3. Compliance & Sanctions Hit (Watchlist Freeze)",
    description: "Beneficiary name triggers a high-confidence fuzzy match against regional and international sanctions lists. Automated workflow halts, funds are quarantined, and the case escalates to compliance officers.",
    outcome: "COMPLIANCE HOLD (No Sender Leakage)",
    steps: [
      {
        id: 1,
        lane: "Customer Channel (Ghana)",
        actor: "Originator Bank",
        action: "Submit Payment",
        detail: "Payment submitted with beneficiary name matching a restricted entity on watchlists.",
        payload: "pacs.008 via WS-01",
        state: "Submitted"
      },
      {
        id: 2,
        lane: "API Gateway (PAPSS)",
        actor: "API Gateway",
        action: "Schema & Signature Check",
        detail: "Passes technical schema validation and X.509 signature checks.",
        payload: "Status: ACTC (Technical Accept)",
        state: "Accepted"
      },
      {
        id: 3,
        lane: "Business Rules (PAPSS)",
        actor: "Compliance Screening Engine",
        action: "WS-02 Screening → Sanctions Hit!",
        detail: "Fuzzy match score: 94/100 against OFAC & Regional lists. Returns complianceStatus=HIT, matchedListRef=SDN-AFR-8832.",
        payload: "SOAP Fault: FailedSanctionsCheck (Code: HOLD)",
        state: "SANCTIONS HIT"
      },
      {
        id: 4,
        lane: "Workflow Management (PAPSS)",
        actor: "BPEL Process Engine",
        action: "Compliance Quarantine & Zero Leakage",
        detail: "BPEL diverts to Compliance Hold. Pre-funding is NOT reserved. Crucially, NO sanctions reason code is returned to the originator to prevent tipping off.",
        payload: "Originator receives generic status PDNG / Internal Compliance Alert Raised",
        state: "Quarantined"
      },
      {
        id: 5,
        lane: "Audit & Reconciliation",
        actor: "PAPSS Compliance Officer",
        action: "Open Case & Regulator Review",
        detail: "Audit record locked. Case flagged in Audit & Reconciliation for manual compliance decision (release-or-reject).",
        payload: "Audit Record: Case #CMP-2026-9912 logged to immutable audit trail",
        state: "Manual Review"
      }
    ]
  },
  invalid_account: {
    id: "invalid_account",
    title: "4. Invalid Account Details (AC01 Immediate Unwind)",
    description: "Beneficiary bank (Alt Bank Nigeria) rejects the NUBAN account because the check-digit is invalid. Non-retryable fault: immediate rollback, release reserved GHS pre-funding, and push AC01 reject notice.",
    outcome: "REJECTED (AC01) & FUNDS RELEASED",
    steps: [
      {
        id: 1,
        lane: "API Gateway & Validation",
        actor: "PAPSS Hub",
        action: "Technical & Sanctions Passed",
        detail: "Payment passes schema, signature, and sanctions screening. 250,000.00 GHS reserved in Pre-Funding Management.",
        payload: "WS-04 RESERVE APPLIED",
        state: "Reserved"
      },
      {
        id: 2,
        lane: "Payment Operations (Alt Bank Nigeria)",
        actor: "Alt Bank Adapter",
        action: "WS-03 Check Credit → NUBAN Failed!",
        detail: "Alt Bank runs Nigeria NUBAN algorithm on account 3081447729. Check digit mismatch: account does not exist (AC01).",
        payload: "WS-03 Fault: InvalidAccountDetails (Reason: AC01)",
        state: "Rejected (AC01)"
      },
      {
        id: 3,
        lane: "Workflow Management (PAPSS)",
        actor: "BPEL Compensation Handler",
        action: "Release Reserved Liquidity",
        detail: "Workflow catches non-retryable AC01 fault. Executes compensating transaction: calls WS-04 with movementType=RELEASE to restore Ecobank's balance.",
        payload: "WS-04 RELEASE { amount: 250000.00 GHS, relatedPaymentId }",
        state: "Funds Restored"
      },
      {
        id: 4,
        lane: "Error Handling & Notifications",
        actor: "Notification Service",
        action: "WS-06 Final Rejection Dispatched",
        detail: "Sends final pacs.002 with status RJCT and reason AC01 to Ecobank Ghana. Ecobank releases local hold and notifies Roffi Trading.",
        payload: "pacs.002 Status: RJCT / ReasonCode: AC01 (Invalid Account Number)",
        state: "Closed (RJCT)"
      }
    ]
  },
  beneficiary_timeout: {
    id: "beneficiary_timeout",
    title: "5. Beneficiary Timeout & ESB Retry (Idempotency Safe)",
    description: "Alt Bank Nigeria endpoint encounters network degradation. The Message Broker/ESB runs exponential backoff retries, then switches to the read-only GetCreditStatus query to eliminate duplicate credit risk.",
    outcome: "ESB RETRY → STATUS QUERY → RESOLVED",
    steps: [
      {
        id: 1,
        lane: "Workflow Management (PAPSS)",
        actor: "ESB Router",
        action: "WS-03 Dispatch & Transport Failure",
        detail: "Hub sends NGN credit instruction. Network packet drop at edge router; Alt Bank endpoint fails to acknowledge within 5s SLA.",
        payload: "Fault: BeneficiaryBankUnavailable",
        state: "Timeout"
      },
      {
        id: 2,
        lane: "Message Broker / ESB",
        actor: "ESB Retry Mechanism",
        action: "Exponential Backoff Redeliveries",
        detail: "ESB initiates redeliveries from persistent message store with exponential backoff intervals: 30s, 2 minutes, 8 minutes.",
        payload: "Redelivery attempt 1/3 (RetryCount: 1)",
        state: "ESB Retrying"
      },
      {
        id: 3,
        lane: "Workflow Management (PAPSS)",
        actor: "Event-Based Gateway",
        action: "Invoke GetCreditStatus (Idempotent Query)",
        detail: "Rather than re-sending the credit order and risking duplicate debit, hub issues read-only GetCreditStatus using paymentId.",
        payload: "GetCreditStatusRequest { paymentId, clearingReference }",
        state: "Polling Status"
      },
      {
        id: 4,
        lane: "Payment Operations (Alt Bank Nigeria)",
        actor: "Alt Bank Adapter",
        action: "Status Confirmed: Already Posted",
        detail: "Alt Bank responds to status enquiry: initial posting succeeded, journal reference echoed. No second debit created!",
        payload: "GetCreditStatusResponse: creditStatus=ACSC",
        state: "Confirmed ACSC"
      }
    ]
  }
};

export default function BpmnSimulator() {
  const [currentScenarioKey, setCurrentScenarioKey] = useState("happy_path");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2500);

  const scenario = SCENARIOS[currentScenarioKey];
  const totalSteps = scenario.steps.length;

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed]);

  const handleScenarioChange = (key) => {
    setCurrentScenarioKey(key);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const currentStep = scenario.steps[currentStepIndex];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Scenario Selection Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>BPMN 2.0 Business Process Simulation Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              PAPSS Cross-Border Payment Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Step through the multi-participant choreography modeled in <code>BPMN.bpmn</code>. Simulate both the sub-120s happy path and business exception recovery flows.
            </p>
          </div>

          {/* Scenario Select Buttons */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(SCENARIOS).map((key) => {
              const sc = SCENARIOS[key];
              const isSelected = currentScenarioKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleScenarioChange(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="font-semibold truncate max-w-[180px]">{sc.title.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sc.outcome}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator Control Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Player Controls & Status Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Current Execution Scenario</span>
            <h3 className="text-sm font-bold text-white mt-0.5">{scenario.title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{scenario.description}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Step Progress</span>
              <span className="font-mono font-bold text-brand-400">
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Status:</span>
              <span className="font-semibold text-white px-2 py-0.5 rounded bg-brand-950/60 border border-brand-500/30">
                {currentStep.state}
              </span>
            </div>
          </div>

          {/* Buttons: Play, Pause, Next, Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-brand-600 hover:bg-brand-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex >= totalSteps - 1}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-medium flex items-center justify-center cursor-pointer"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Simulation Speed:</span>
            <div className="flex items-center space-x-1">
              {[
                { label: '0.5x', ms: 3500 },
                { label: '1x', ms: 2200 },
                { label: '2x', ms: 1000 },
              ].map(sp => (
                <button
                  key={sp.label}
                  onClick={() => setPlaybackSpeed(sp.ms)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    playbackSpeed === sp.ms ? 'bg-brand-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Active Step Spotlight & Swimlane Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {/* Spotlight Card: Current Step Details */}
          <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 relative overflow-hidden bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="h-6 w-6 rounded-full bg-brand-500 text-slate-950 flex items-center justify-center text-xs font-extrabold">
                  {currentStep.id}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-brand-300">
                  {currentStep.lane}
                </span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Actor: {currentStep.actor}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{currentStep.action}</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentStep.detail}
              </p>

              {/* Message Payload Box */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs text-brand-300 overflow-x-auto">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">Message Transmission / Service Call:</span>
                <code>{currentStep.payload}</code>
              </div>
            </div>
          </div>

          {/* Interactive Swimlane Step Chain */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full Process Step Chain ({scenario.steps.length} Phases)
              </span>
              <span className="text-[11px] text-slate-400">Click any step to inspect directly</span>
            </div>

            <div className="space-y-2">
              {scenario.steps.map((st, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;

                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isCurrent
                        ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                        : isPast
                        ? 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                        : 'border-slate-800/40 bg-slate-950/40 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-brand-500 text-slate-950 ring-2 ring-brand-300'
                          : isPast
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {isPast ? '✓' : st.id}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {st.action}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {st.lane} · <span className="font-mono">{st.actor}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                        : 'bg-slate-800/60 text-slate-400'
                    }`}>
                      {st.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
