import React, { useState } from 'react';
import { SERVICES, FAULT_SCENARIOS } from '../data/servicesData';
import { Cpu, Send, Copy, Check, AlertCircle, ShieldAlert, Code2, Database, Layers } from 'lucide-react';

export default function WebServicesCatalog() {
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'tester', 'faults'
  const [testMode, setTestMode] = useState('success'); // 'success', 'fault'
  const [customRequestXml, setCustomRequestXml] = useState(SERVICES[0].sampleRequest);
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setCustomRequestXml(srv.sampleRequest);
    setTestResponse(null);
  };

  const handleExecuteTest = () => {
    setIsLoading(true);
    setTestResponse(null);

    setTimeout(() => {
      setIsLoading(false);
      if (testMode === 'success') {
        setTestResponse({
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "application/soap+xml; charset=utf-8; action=\"http://papss.org/payment/Response\"",
            "Server": "PAPSS-Integration-Hub/1.0",
            "X-UETR": "8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58",
            "X-Clearing-Ref": "PAPSS-2026-GH-0001234",
            "X-WS-Security": "X509-Validated-MutualTLS"
          },
          body: selectedService.sampleResponse
        });
      } else {
        // Fault response
        setTestResponse({
          status: 500,
          statusText: "Internal Server Error (SOAP 1.2 Fault)",
          headers: {
            "Content-Type": "application/soap+xml; charset=utf-8",
            "Server": "PAPSS-Integration-Hub/1.0",
            "X-PAPSS-Fault": "InsufficientPreFunding"
          },
          body: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:pay="http://papss.org/schema/payment/v1">
  <soap:Body>
    <soap:Fault>
      <soap:Code>
        <soap:Value>soap:Sender</soap:Value>
        <soap:Subcode>
          <soap:Value>pay:InsufficientPreFunding</soap:Value>
        </soap:Subcode>
      </soap:Code>
      <soap:Reason>
        <soap:Text xml:lang="en">Available pre-funding is insufficient to reserve the instructed amount.</soap:Text>
      </soap:Reason>
      <soap:Detail>
        <pay:PaymentFault>
          <pay:faultCode>AM04</pay:faultCode>
          <pay:faultCategory>BUSINESS</pay:faultCategory>
          <pay:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</pay:paymentId>
          <pay:clearingReference>PAPSS-2026-GH-0001234</pay:clearingReference>
          <pay:participantId>ECOCGHAC</pay:participantId>
          <pay:settlementCurrency>GHS</pay:settlementCurrency>
          <pay:requestedAmount>250000.00</pay:requestedAmount>
          <pay:availableBalance>186420.75</pay:availableBalance>
          <pay:shortfall>63579.25</pay:shortfall>
          <pay:recoveryAction>HOLD_AND_REQUEST_TOPUP</pay:recoveryAction>
          <pay:retryAfter>PT30M</pay:retryAfter>
          <pay:escalationLevel>PARTICIPANT_TREASURY</pay:escalationLevel>
          <pay:faultTimestamp>2026-10-15T09:42:17Z</pay:faultTimestamp>
        </pay:PaymentFault>
      </soap:Detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`
        });
      }
    }, 700);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4" />
              <span>Web Service Design (Task 2 Implementation)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              PAPSS Web Services & SOAP 1.2 Catalog
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Six formally described SOAP 1.2 / WSDL 1.1 service operations carrying ISO 20022 payloads coordinate cross-border clearing from initial submission to multilateral net settlement.
            </p>
          </div>
          <div className="text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            SOAP 1.2 · WSDL 1.1 · WS-Security · MTLS
          </div>
        </div>
      </div>

      {/* Services List / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SERVICES.map((s) => {
          const isSelected = selectedService.ref === s.ref;
          return (
            <button
              key={s.ref}
              onClick={() => handleSelectService(s)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-400 shadow-md shadow-brand-600/30 ring-1 ring-brand-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="font-mono text-[10px] uppercase opacity-80">{s.ref}</div>
              <div className="font-bold text-xs truncate mt-0.5">{s.name}</div>
              <div className="text-[10px] opacity-70 truncate mt-1">{s.isoMessage.split('→')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Main Service Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Header of selected service */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                {selectedService.ref}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{selectedService.name}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {selectedService.purpose}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'fields'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Fields & Schema
            </button>
            <button
              onClick={() => setActiveTab('faults')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'faults'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Faults & Recovery
            </button>
            <button
              onClick={() => setActiveTab('tester')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'tester'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Live Mock Requester
            </button>
          </div>
        </div>

        {/* Tab 1: Fields Specification */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Service Provider</span>
                <span className="text-brand-300 font-semibold block mt-0.5">{selectedService.provider}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Service Consumer</span>
                <span className="text-amber-300 font-semibold block mt-0.5">{selectedService.consumer}</span>
              </div>
            </div>

            {/* Inputs Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <span>Input Payload Specification (Request)</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Field Name</th>
                      <th className="py-2.5 px-3">XSD Data Type</th>
                      <th className="py-2.5 px-3">Req / Opt</th>
                      <th className="py-2.5 px-3">Architectural Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedService.inputs.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 font-mono">
                        <td className="py-2 px-3 text-brand-300 font-bold">{f.field}</td>
                        <td className="py-2 px-3 text-slate-300">{f.type}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            f.req === 'M' ? 'bg-red-950/60 text-red-400 border border-red-800/40' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {f.req === 'M' ? 'Mandatory' : 'Optional'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300">{f.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outputs Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Output Payload Specification (Response)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Output Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Semantics & Behavioral Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedService.outputs.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 font-mono">
                        <td className="py-2 px-3 text-emerald-400 font-bold">{f.field}</td>
                        <td className="py-2 px-3 text-slate-300">{f.type}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{f.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Faults & Recovery */}
        {activeTab === 'faults' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Every operation explicitly declares its business and technical faults in WSDL, making error handling part of the formal contract. Business faults (AC01, AM04) are never blindly retried; technical faults trigger ESB redeliveries with exponential backoff.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Declared Fault</th>
                    <th className="py-2.5 px-3">Reason Code</th>
                    <th className="py-2.5 px-3">Automatic Recovery Path</th>
                    <th className="py-2.5 px-3">Escalation Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedService.faults.map((flt, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono font-bold text-amber-400">{flt.fault}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{flt.code}</td>
                      <td className="py-2 px-3 text-slate-300">{flt.recovery}</td>
                      <td className="py-2 px-3 text-red-300 font-medium">{flt.escalation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* General Fault Matrix summary */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 mt-4">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Key Enterprise Fault Principles
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>Hold rather than reject:</strong> Deficiencies in liquidity (AM04) hold the transaction in status PDNG for up to 30 minutes, avoiding asking the customer to re-enter a valid order.</li>
                <li><strong>Every reservation is compensated:</strong> Every RESERVE call on WS-04 has a matching RELEASE if a downstream bank or network fails, preventing stranded liquidity.</li>
                <li><strong>Dead-Letter Queue (DLQ):</strong> Messages exhausting ESB redeliveries are archived to DLQ and raise a case for human settlement administrators.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Live Mock Requester */}
        {activeTab === 'tester' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Simulation Outcome:</span>
                <button
                  onClick={() => setTestMode('success')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    testMode === 'success'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Success (HTTP 200 ACTC/ACSC)
                </button>
                <button
                  onClick={() => setTestMode('fault')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    testMode === 'fault'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  SOAP Fault (AM04 Insufficient Funds)
                </button>
              </div>

              <button
                onClick={handleExecuteTest}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Dispatching Envelope...' : 'Send SOAP Request'}</span>
              </button>
            </div>

            {/* Request Envelope Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Request Payload (SOAP 1.2 Envelope with WS-Security)</span>
                <button
                  onClick={() => handleCopy(customRequestXml)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                value={customRequestXml}
                onChange={(e) => setCustomRequestXml(e.target.value)}
                rows={12}
                className="w-full bg-slate-950/90 text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-brand-500 outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Live Response Panel */}
            {testResponse && (
              <div className="space-y-2 pt-2 border-t border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-white">Live Hub Response:</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      testResponse.status === 200
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    }`}>
                      HTTP {testResponse.status} {testResponse.statusText}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Roundtrip: 142ms · TLS 1.3</span>
                </div>

                {/* Response Envelope */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                    {testResponse.body}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
