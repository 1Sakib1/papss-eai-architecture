import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle2, Download, ExternalLink, Bookmark } from 'lucide-react';

export default function TechDocumentation({ onOpenDownloads }) {
  const [activeSection, setActiveSection] = useState('task2');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Academic & Engineering Documentation</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              PAPSS Integration Hub Technical Specification
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Authored by @Sakib (Nov 2, 2026). Comprehensive engineering analysis covering Business Process Modeling (Task 1), Web Service Design (Task 2), and XML Schema Architecture (Task 3).
            </p>
          </div>
          <button
            onClick={onOpenDownloads}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Word Docs (.docx)</span>
          </button>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { id: 'task1', label: 'Task 1: BPMN Collaboration & Process Design' },
          { id: 'task2', label: 'Task 2: Web Service Design (SOAP/WSDL)' },
          { id: 'task3', label: 'Task 3: XML Schema Design (XSD Architecture)' },
          { id: 'references', label: 'References & Citations' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSection === sec.id
                ? 'bg-brand-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        {activeSection === 'task1' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Task 1: Business Process Model and Notation (BPMN 2.0)
            </h3>
            <p>
              The business process model coordinates the end-to-end lifecycle of a cross-border payment instruction across 9 distinct participant pools and enterprise swimlanes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block">Commercial Banks</span>
                <span className="text-slate-400">Ecobank Ghana (Originator) & Alt Bank Nigeria (Beneficiary)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block">Central Bank RTGS</span>
                <span className="text-slate-400">Bank of Ghana (RTGS) & Central Bank of Nigeria (RTGS)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-bold text-white block">Settlement & Corporates</span>
                <span className="text-slate-400">Afreximbank, Roffi Trading Ltd, Legos Corp, Sponsored Participants</span>
              </div>
            </div>

            <h4 className="text-base font-bold text-white mt-4">Key Choreography Mechanics</h4>
            <ul className="list-disc list-inside space-y-2 text-xs">
              <li><strong>Zero Settlement Credit Risk:</strong> The hub checks available pre-funded clearing balances before routing any payment downstream to the beneficiary bank. Funds are reserved atomically.</li>
              <li><strong>Automated Liquidity Replenishment:</strong> When pre-funding is insufficient (AM04), the workflow holds the transaction in status <code>PDNG</code> and issues an automated Top-up request, allowing central bank RTGS credit orders to land and automatically resume the payment without requiring customer re-submission.</li>
              <li><strong>Guaranteed Finality:</strong> Commercial banks credit the beneficiary immediately upon instruction receipt, backed by irrevocable multilateral netting guaranteed by Afreximbank.</li>
            </ul>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 not-prose flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Download Complete BPMN 2.0 Model</span>
                <span className="text-[11px] text-slate-400">Full BPMNDI diagram definition matching OMG BPMN 2.0 specification</span>
              </div>
              <a
                href="/BPMN.bpmn"
                download="PAPSS_Cross_Border_Payment.bpmn"
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                Download .bpmn
              </a>
            </div>
          </div>
        )}

        {activeSection === 'task2' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Task 2: Web Service Design (SOAP 1.2 / WSDL 1.1)
            </h3>
            <p>
              Six SOAP/WSDL service operations carrying ISO 20022 payloads move a PAPSS cross-border payment from customer submission to end-of-day net settlement:
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-800 not-prose">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Ref</th>
                    <th className="py-2.5 px-3">Operation</th>
                    <th className="py-2.5 px-3">Provider (EAI Component)</th>
                    <th className="py-2.5 px-3">Consumer</th>
                    <th className="py-2.5 px-3">ISO 20022 Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-01</td><td className="py-2 px-3 text-white">SubmitPaymentInstruction</td><td className="py-2 px-3">API Gateway → Workflow</td><td className="py-2 px-3">Ecobank Ghana</td><td className="py-2 px-3">pacs.008 → pacs.002</td></tr>
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-02</td><td className="py-2 px-3 text-white">ValidatePaymentInstruction</td><td className="py-2 px-3">Payment Validation + Sanctions</td><td className="py-2 px-3">Workflow (BPEL)</td><td className="py-2 px-3">pacs.002 status</td></tr>
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-03</td><td className="py-2 px-3 text-white">ConfirmBeneficiaryCredit</td><td className="py-2 px-3">Alt Bank Nigeria Adapter</td><td className="py-2 px-3">Settlement Orchestration</td><td className="py-2 px-3">pacs.008 → pacs.002</td></tr>
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-04</td><td className="py-2 px-3 text-white">UpdatePreFundingPosition</td><td className="py-2 px-3">Pre-Funding Management</td><td className="py-2 px-3">Treasury, RTGS Adapters</td><td className="py-2 px-3">pacs.009, camt.054</td></tr>
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-05</td><td className="py-2 px-3 text-white">SubmitNetSettlementInstruction</td><td className="py-2 px-3">Settlement Orchestration</td><td className="py-2 px-3">BoG, CBN, Afreximbank</td><td className="py-2 px-3">pacs.009, camt.053</td></tr>
                  <tr><td className="py-2 px-3 text-brand-300 font-bold">WS-06</td><td className="py-2 px-3 text-white">NotifyPaymentStatus</td><td className="py-2 px-3">Error Handling & Notifications</td><td className="py-2 px-3">Banks, Corporates</td><td className="py-2 px-3">pacs.002, camt.054</td></tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-base font-bold text-white mt-4">Architectural Rationale for SOAP vs REST</h4>
            <p className="text-xs">
              Every inter-institution operation is exposed as a SOAP 1.2 service with a WSDL 1.1 contract and an ISO 20022 XML payload; only corporate channels (Roffi Trading Ltd and Legos Corp) use REST/JSON. This adheres to service-oriented principles of formal, standardized machine-readable contracts between loosely coupled participants (Erl, 2005). WSDL explicitly exposes declared <code>&lt;fault&gt;</code> elements, turning error handling into a concrete contractual obligation.
            </p>
          </div>
        )}

        {activeSection === 'task3' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Task 3: XML Schema Design (XSD Architecture)
            </h3>
            <p>
              Three XSDs define every message exchanged across the hub: a shared common-types schema imported by a Payment Instruction schema and a Net Settlement schema:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 not-prose text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-brand-300 font-bold block">PapssCommonTypes.xsd</span>
                <span className="text-slate-400">Target: .../common/v1</span>
                <p className="text-[11px] text-slate-300 font-sans mt-1">Reusable type library: UETR, BIC, Currency, Amount types, Party, Agent.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-brand-300 font-bold block">PaymentInstruction.xsd</span>
                <span className="text-slate-400">Target: .../payment/v1</span>
                <p className="text-[11px] text-slate-300 font-sans mt-1">Root elements: PaymentInstruction, PaymentAcknowledgement, PaymentFault.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-brand-300 font-bold block">NetSettlementInstruction.xsd</span>
                <span className="text-slate-400">Target: .../settlement/v1</span>
                <p className="text-[11px] text-slate-300 font-sans mt-1">Root elements: NetSettlementInstruction, SettlementConfirmation.</p>
              </div>
            </div>

            <h4 className="text-base font-bold text-white mt-4">Why Three Schemas Rather Than Two?</h4>
            <p className="text-xs">
              Defining common types (BIC, currency codes, amount formats, party definitions) once in a reusable type library prevents schema drift. Updating the BIC regex pattern touches only <code>PapssCommonTypes.xsd</code> without risking discrepancy between payment messages and settlement instructions.
            </p>
          </div>
        )}

        {activeSection === 'references' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Academic & Industry References
            </h3>
            <ul className="space-y-3 text-xs font-mono text-slate-300">
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>Christensen, E., Curbera, F., Meredith, G., & Weerawarana, S. (2001).</strong> Web services description language (WSDL) 1.1 [W3C Note]. World Wide Web Consortium.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>Erl, T. (2005).</strong> Service-oriented architecture: Concepts, technology, and design. Prentice Hall.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>Hohpe, G., & Woolf, B. (2004).</strong> Enterprise integration patterns: Designing, building, and deploying messaging solutions. Addison-Wesley.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>ISO 20022 Registration Authority. (n.d.).</strong> ISO 20022 universal financial industry message scheme. https://www.iso20022.org/
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>OASIS. (2007).</strong> Web services business process execution language version 2.0 [OASIS Standard].
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>W3C. (2007).</strong> SOAP version 1.2 part 1: Messaging framework (2nd ed.) [W3C Recommendation].
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
