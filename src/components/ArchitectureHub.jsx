import React, { useState } from 'react';
import { Server, Database, Shield, ArrowRightLeft, Cpu, Activity, AlertTriangle, FileCode, CheckCircle2, Info } from 'lucide-react';

const EAI_COMPONENTS = [
  {
    id: "hub",
    title: "PAPSS Integration Hub",
    category: "Core EAI Engine",
    type: "hub",
    description: "The enterprise orchestration backbone connecting African commercial banks, central banks, and settlement agents into a unified, instant multi-currency payment network.",
    pattern: "Enterprise Service Bus (ESB) + Canonical Data Model",
    protocols: "SOAP 1.2 / MTLS / WS-Security (X.509) / ISO 20022 XML",
    submodules: [
      "API Gateway",
      "Message Broker / ESB",
      "Workflow Management / BPEL",
      "Data Transformation",
      "Payment Validation",
      "Compliance & Sanctions Screening",
      "Pre-Funding Management",
      "Settlement Orchestration",
      "Audit & Reconciliation",
      "Error Handling & Notifications"
    ]
  },
  {
    id: "gateway",
    title: "API Gateway",
    category: "Perimeter Security & Ingestion",
    parent: "hub",
    description: "The first line of defense. Performs schema validation against Task 3 XSDs, enforces WS-Security X.509 digital signature verification over mutual TLS, checks UETR idempotency in high-speed cache, and applies rate limiting.",
    services: ["WS-01 SubmitPaymentInstruction"],
    pattern: "Message Gateway + Idempotent Receiver",
    protocols: "SOAP 1.2 / HTTPS (Port 443) / WSDL 1.1",
    guarantee: "Rejects malformed instructions before entering orchestration, avoiding costly compensation workflows."
  },
  {
    id: "esb",
    title: "Message Broker / ESB",
    category: "Messaging & Reliability",
    parent: "hub",
    description: "Enterprise messaging fabric ensuring reliable, decoupled delivery. Implements WS-ReliableMessaging, dead-letter queues (DLQ), priority routing, and guaranteed at-least-once / exactly-once message transport across participants.",
    services: ["WS-01", "WS-03", "WS-04", "WS-06"],
    pattern: "Message Broker + Dead-Letter Channel + Guaranteed Delivery",
    protocols: "AMQP 1.0 / JMS / Internal Event Bus",
    guarantee: "Prevents message loss during network partitions or downstream core banking maintenance."
  },
  {
    id: "workflow",
    title: "Workflow Management / BPEL",
    category: "Orchestration",
    parent: "hub",
    description: "Executes stateful, long-running business processes defined in WS-BPEL 2.0. Coordinates parallel RTGS settlement legs, event-based waiting gateways (Wait Credit, Wait Funds), compensation handlers, and SLA timers (PT30M).",
    services: ["WS-01", "WS-02", "WS-03", "WS-04"],
    pattern: "Process Manager / Saga Coordinator",
    protocols: "WS-BPEL 2.0 / BPMN 2.0 Execution Engine",
    guarantee: "Maintains transaction state consistency across heterogeneous financial institutions."
  },
  {
    id: "transformation",
    title: "Data Transformation",
    category: "Integration",
    parent: "hub",
    description: "Translates proprietary bank formats (e.g. Ecobank Ghana core banking TXN_REF, branch codes) into canonical ISO 20022 (pacs.008, pacs.002) at the edge, scaling integration complexity from O(N²) to O(N).",
    services: ["WS-01", "WS-03"],
    pattern: "Canonical Data Model + Message Translator",
    protocols: "XSLT 3.0 / ISO 20022 Universal Scheme",
    guarantee: "Allows admitting new central banks by adding 1 adapter rather than N pairwise translators."
  },
  {
    id: "validation",
    title: "Payment Validation",
    category: "Business Rules",
    parent: "hub",
    description: "Validates account structure, check-digits (NUBAN for Nigeria, IBAN/local format for Ghana), currency eligibility, participant status in the clearing directory, and transaction limit thresholds.",
    services: ["WS-02 ValidatePaymentInstruction"],
    pattern: "Content Filter + Business Rules Engine",
    protocols: "SOAP 1.2 / In-Memory Decision Engine",
    guarantee: "Catches format and ledger mismatches before funds are reserved or moved."
  },
  {
    id: "sanctions",
    title: "Compliance & Sanctions Screening",
    category: "Regulatory Security",
    parent: "hub",
    description: "Performs real-time fuzzy screening of debtor and creditor names against United Nations, OFAC, and regional African sanctions watchlists. Yields CLEAR, HIT, or REVIEW decisions.",
    services: ["WS-02 ValidatePaymentInstruction"],
    pattern: "Interceptor / Policy Enforcement Point",
    protocols: "Fuzzy-Matching Engine / Restricted REST Screening API",
    guarantee: "Isolates watch-list updates so compliance checks can re-run without re-submitting payment."
  },
  {
    id: "prefunding",
    title: "Pre-Funding Management",
    category: "Liquidity & Risk",
    parent: "hub",
    description: "Guarantees zero settlement credit risk. Maintains real-time clearing balances per bank and currency backed by funds locked in central bank RTGS. Executes atomic RESERVE, CREDIT, DEBIT, and RELEASE operations.",
    services: ["WS-04 UpdatePreFundingPosition"],
    pattern: "Account Aggregator / Reservation Pattern",
    protocols: "SOAP 1.2 / High-Speed Transactional Ledger",
    guarantee: "Payments clear exclusively if pre-funding is held, preventing counterparty default."
  },
  {
    id: "settlement",
    title: "Settlement Orchestration",
    category: "Multilateral Netting",
    parent: "hub",
    description: "At the Day Cutoff timer, calculates multilateral net obligations across all participants and issues parallel settlement orders to Bank of Ghana RTGS (GHS), Central Bank of Nigeria RTGS (NGN), and Afreximbank (USD).",
    services: ["WS-05 SubmitNetSettlementInstruction"],
    pattern: "Aggregator / Scatter-Gather / Two-Phase Commit",
    protocols: "SOAP 1.2 / Dual-Control XML-DSig / MTLS",
    guarantee: "Enforces zero-sum multilateral netting (TotalNetAmount = 0.00 GHS) across all currency cycles."
  },
  {
    id: "audit",
    title: "Audit & Reconciliation",
    category: "Ledger & Reporting",
    parent: "hub",
    description: "Maintains an immutable, tamper-evident audit ledger keyed on UETR and CycleId. Performs end-of-day matching between hub transaction logs and central bank RTGS confirmation statements (camt.053).",
    services: ["WS-05", "WS-02"],
    pattern: "Audit Interceptor / Event Sourcing",
    protocols: "Append-Only Cryptographic Journal / camt.053",
    guarantee: "Provides complete non-repudiation and regulatory proof for central bank oversight."
  },
  {
    id: "notifications",
    title: "Error Handling & Notifications",
    category: "Outbound Dispatch",
    parent: "hub",
    description: "Centralized notification service that pushes final payment results (ACSC/RJCT), credit notices, settlement reports, and automated Top-up liquidity requests across SOAP, REST webhooks, and email.",
    services: ["WS-06 NotifyPaymentStatus"],
    pattern: "Publish-Subscribe / Channel Adapter",
    protocols: "SOAP 1.2 (Banks) / REST JSON (Corporates) / SMTP",
    guarantee: "Centralizes retry policies, webhook HMAC signatures, and delivery status tracking."
  },
  // External Entities
  {
    id: "ecobank",
    title: "Ecobank Ghana",
    category: "Originator Direct Participant",
    type: "participant",
    description: "Direct clearing participant in Ghana. Debits Roffi Trading Ltd in GHS, holds a pre-funded clearing account at Bank of Ghana RTGS, maps core-banking transactions, and submits signed pacs.008 instructions to PAPSS.",
    role: "Originator Direct Bank (ECOCGHAC)",
    protocols: "Core Banking API → Bank Adapter → SOAP 1.2 MTLS",
    servicesConsumed: ["WS-01", "WS-04", "WS-06"]
  },
  {
    id: "altbank",
    title: "Alt Bank Nigeria",
    category: "Beneficiary Direct Participant",
    type: "participant",
    description: "Direct clearing participant in Nigeria. Receives NGN credit instructions from PAPSS, performs beneficiary name matching, posts credits to Legos Corp's NUBAN account, and replies with ACSC confirmations.",
    role: "Beneficiary Direct Bank (ALTBNGLA)",
    protocols: "SOAP 1.2 MTLS → Alt Bank Adapter → Core NUBAN Ledger",
    servicesConsumed: ["WS-03", "WS-06"]
  },
  {
    id: "bog",
    title: "Bank of Ghana (RTGS)",
    category: "Central Bank RTGS",
    type: "centralbank",
    description: "National central bank of Ghana. Holds Ecobank Ghana's GHS pre-funding clearing reserve account and executes end-of-day net settlement transfers between participant settlement accounts on WS-05.",
    role: "Central Bank / Settlement System (BOG-RTGS)",
    protocols: "ISO 20022 SWIFT FIN / pacs.009 / RTGS Adapter"
  },
  {
    id: "cbn",
    title: "Central Bank of Nigeria (RTGS)",
    category: "Central Bank RTGS",
    type: "centralbank",
    description: "National central bank of Nigeria. Manages NGN pre-funding accounts and executes end-of-day multilateral net settlement postings for Alt Bank Nigeria and fellow clearing members.",
    role: "Central Bank / Settlement System (CBN-RTGS)",
    protocols: "ISO 20022 / pacs.009 / RTGS Adapter"
  },
  {
    id: "afreximbank",
    title: "Afreximbank",
    category: "Multilateral Settlement Agent",
    type: "agent",
    description: "African Export-Import Bank acts as the multilateral settlement guarantor and foreign exchange clearing agent. Settles net foreign exchange exposure (hard-currency USD leg) across currency corridors.",
    role: "Settlement Agent / Netting Guarantor (AFRXEGCX)",
    protocols: "SOAP 1.2 / MTLS / pacs.009 / camt.053"
  },
  {
    id: "roffi",
    title: "Roffi Trading Ltd",
    category: "Corporate Originator",
    type: "corporate",
    description: "Ghanaian commercial enterprise purchasing cocoa processing machinery from Nigeria. Initiates GHS payment instruction through Ecobank Ghana corporate internet banking portal.",
    role: "Originator Customer (Ghana)",
    protocols: "HTTPS / REST JSON Corporate Banking Channel"
  },
  {
    id: "legos",
    title: "Legos Corp",
    category: "Corporate Beneficiary",
    type: "corporate",
    description: "Nigerian industrial equipment exporter. Receives guaranteed instant NGN funds credit into their Alt Bank Nigeria account and receives instant credit notification via REST webhook / SMS.",
    role: "Beneficiary Customer (Nigeria)",
    protocols: "Alt Bank Corporate Webhook / REST JSON"
  }
];

export default function ArchitectureHub() {
  const [selectedNode, setSelectedNode] = useState(EAI_COMPONENTS[0]);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredComponents = EAI_COMPONENTS.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'hub') return c.parent === 'hub' || c.id === 'hub';
    if (activeFilter === 'participants') return c.type === 'participant' || c.type === 'corporate';
    if (activeFilter === 'centralbanks') return c.type === 'centralbank' || c.type === 'agent';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Introduction */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <Server className="w-4 h-4" />
              <span>Enterprise Application Integration (EAI) Architecture</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              PAPSS Integration Hub Topology
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Explore the service-oriented integration architecture connecting Ecobank Ghana, Alt Bank Nigeria, national RTGS systems, and Afreximbank. Built upon a <strong>Canonical ISO 20022 Data Model</strong>, <strong>SOAP 1.2/WSDL 1.1 contracts</strong>, and <strong>WS-BPEL orchestration</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'hub', 'participants', 'centralbanks'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'all' && 'All Elements'}
                {f === 'hub' && 'Hub Modules'}
                {f === 'participants' && 'Commercial Banks & Corporates'}
                {f === 'centralbanks' && 'Central Banks & Afreximbank'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual Diagram & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Visual Interactive Architectural Canvas */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4 text-brand-400" />
              <span>Interactive Architecture Map</span>
            </h3>
            <span className="text-xs text-slate-400 italic">Click any component to inspect technical specs</span>
          </div>

          {/* Architecture Layout Canvas */}
          <div className="bg-navy-950/80 rounded-xl p-5 border border-slate-800/80 relative space-y-8">
            {/* Top Tier: Corporate Clients */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider mb-2">
                Tier 1: Corporate End-Users (REST / JSON Channels)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'roffi'))}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'roffi'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Roffi Trading Ltd</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-brand-300">Ghana Originator</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Initiates 250,000.00 GHS payment for machinery</p>
                </button>

                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'legos'))}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'legos'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">Legos Corp</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">Nigeria Beneficiary</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Receives 6,217,875.00 NGN instant credit</p>
                </button>
              </div>
            </div>

            {/* Connecting arrows indicator */}
            <div className="flex justify-around text-xs text-slate-500 font-mono">
              <span>↓ GHS Payment Order (REST)</span>
              <span>↑ NGN Credit Notice (REST)</span>
            </div>

            {/* Tier 2: Commercial Banks & Adapters */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider mb-2">
                Tier 2: Commercial Banks & Edge Adapters (SOAP 1.2 / MTLS / ISO 20022)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'ecobank'))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'ecobank'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400 shadow-lg shadow-brand-500/10'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">Ecobank Ghana</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono">ECOCGHAC</span>
                  </div>
                  <p className="text-xs text-slate-300">Core Banking + Treasury; Edge Bank Adapter</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400"></span>
                    <span>Invokes: WS-01 SubmitPaymentInstruction</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'altbank'))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'altbank'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400 shadow-lg shadow-brand-500/10'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">Alt Bank Nigeria</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">ALTBNGLA</span>
                  </div>
                  <p className="text-xs text-slate-300">Core Banking + Treasury; NUBAN Bank Adapter</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    <span>Serves: WS-03 ConfirmBeneficiaryCredit</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tier 3: The Core PAPSS Integration Hub */}
            <div className="border border-brand-500/30 rounded-2xl p-5 bg-gradient-to-b from-brand-950/30 via-slate-900/90 to-navy-950/90 relative shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-brand-400 animate-ping"></div>
                  <span className="font-extrabold text-sm uppercase tracking-wider text-brand-300">
                    PAPSS Integration Hub (Enterprise Application Integration)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'hub'))}
                  className="text-xs text-brand-400 hover:underline cursor-pointer"
                >
                  Overview & Specs →
                </button>
              </div>

              {/* Submodule Blocks within the Hub */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'gateway', label: 'API Gateway', sub: 'WS-01 & Schema XSD' },
                  { id: 'esb', label: 'Message Broker / ESB', sub: 'Reliable Messaging' },
                  { id: 'workflow', label: 'Workflow Management', sub: 'WS-BPEL 2.0 State' },
                  { id: 'transformation', label: 'Data Transformation', sub: 'Canonical pacs.008' },
                  { id: 'validation', label: 'Payment Validation', sub: 'Format & Account' },
                  { id: 'sanctions', label: 'Compliance Screening', sub: 'UN / OFAC / AML' },
                  { id: 'prefunding', label: 'Pre-Funding Mgmt', sub: 'WS-04 Zero Credit Risk' },
                  { id: 'settlement', label: 'Settlement Orchestration', sub: 'WS-05 Netting' },
                  { id: 'audit', label: 'Audit & Reconciliation', sub: 'Immutable Journal' },
                  { id: 'notifications', label: 'Error & Notifications', sub: 'WS-06 Outbound' },
                ].map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === mod.id))}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedNode?.id === mod.id
                        ? 'border-brand-400 bg-brand-500/20 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-brand-500/40 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white truncate">{mod.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{mod.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 4: Central Banks & Settlement Agents */}
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider mb-2">
                Tier 4: Central Bank RTGS Systems & Multilateral Settlement Agent
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'bog'))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'bog'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Bank of Ghana</div>
                  <div className="text-[10px] text-brand-300 font-mono">BOG-RTGS</div>
                  <div className="text-[10px] text-slate-400 mt-1">GHS Settlement Leg</div>
                </button>

                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'afreximbank'))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'afreximbank'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Afreximbank</div>
                  <div className="text-[10px] text-amber-300 font-mono">AFRXEGCX</div>
                  <div className="text-[10px] text-slate-400 mt-1">USD Hard Currency Leg</div>
                </button>

                <button
                  onClick={() => setSelectedNode(EAI_COMPONENTS.find(c => c.id === 'cbn'))}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedNode?.id === 'cbn'
                      ? 'border-brand-400 bg-brand-950/40 ring-1 ring-brand-400'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">CBN RTGS</div>
                  <div className="text-[10px] text-brand-300 font-mono">CBN-RTGS</div>
                  <div className="text-[10px] text-slate-400 mt-1">NGN Settlement Leg</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Technical Specification Inspector Drawer */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-semibold">
              {selectedNode?.category || 'Component Spec'}
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              {selectedNode?.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {selectedNode?.description}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {selectedNode?.pattern && (
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Enterprise Integration Pattern</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedNode.pattern}</span>
              </div>
            )}

            {selectedNode?.protocols && (
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Protocols & Transport</span>
                <span className="font-mono text-brand-300 mt-0.5 block bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800">
                  {selectedNode.protocols}
                </span>
              </div>
            )}

            {selectedNode?.services && (
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Exposed / Consumed Services</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedNode.services.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-slate-800 text-brand-400 rounded font-mono text-[11px] border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedNode?.guarantee && (
              <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30 text-slate-300">
                <span className="font-bold text-brand-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Architectural Guarantee
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">{selectedNode.guarantee}</p>
              </div>
            )}

            {selectedNode?.submodules && (
              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase mb-1.5">Integrated Subcomponents</span>
                <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-300 font-mono">
                  {selectedNode.submodules.map((m, idx) => (
                    <li key={m} className="flex items-center gap-2 px-2 py-1 rounded bg-slate-900/60 border border-slate-800/80">
                      <span className="text-brand-400">{idx + 1}.</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
