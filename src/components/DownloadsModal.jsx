import React from 'react';
import { X, Download, FileCode, FileText, Layers, CheckCircle } from 'lucide-react';

export default function DownloadsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const files = [
    { name: "PAPSS_Cross_Border_Payment.bpmn", path: "/BPMN.bpmn", category: "Process Model", desc: "OMG BPMN 2.0 XML with full BPMNDI coordinates" },
    { name: "PapssCommonTypes.xsd", path: "/schemas/PapssCommonTypes.xsd", category: "Schema", desc: "Reusable XML type library: BIC, UETR, Currencies, Amounts" },
    { name: "PaymentInstruction.xsd", path: "/schemas/PaymentInstruction.xsd", category: "Schema", desc: "WS-01 ISO 20022 pacs.008 schema & unique payment constraint" },
    { name: "NetSettlementInstruction.xsd", path: "/schemas/NetSettlementInstruction.xsd", category: "Schema", desc: "WS-05 multilateral net settlement schema with dual-control" },
    { name: "PaymentInstructionService.wsdl", path: "/schemas/PaymentInstructionService.wsdl", category: "WSDL Contract", desc: "WSDL 1.1 / SOAP 1.2 interface definition for WS-01" },
    { name: "PaymentInstruction_Sample.xml", path: "/schemas/PaymentInstruction_Sample.xml", category: "Valid XML", desc: "Sample 250,000.00 GHS payment from Roffi to Legos" },
    { name: "NetSettlementInstruction_Sample.xml", path: "/schemas/NetSettlementInstruction_Sample.xml", category: "Valid XML", desc: "Bank of Ghana balanced net settlement cycle (0.00 GHS)" },
    { name: "PaymentInstruction_Invalid_Sample.xml", path: "/schemas/PaymentInstruction_Invalid_Sample.xml", category: "Test XML", desc: "Sample with 4 deliberate defects for xmllint testing" },
    { name: "InsufficientPreFunding_Fault.xml", path: "/schemas/InsufficientPreFunding_Fault.xml", category: "SOAP Envelope", desc: "Realistic SOAP Fault envelope for AM04 liquidity shortfall" },
    { name: "Task2_Web_Service_Design.docx", path: "/docs/Task2_Web_Service_Design.docx", category: "Word Report", desc: "Complete authored report for Task 2 Web Services" },
    { name: "Task3_XML_Schema_Design.docx", path: "/docs/Task3_XML_Schema_Design.docx", category: "Word Report", desc: "Complete authored report for Task 3 XML Schemas" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700 p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold text-white">Project Artifacts & Code Repository</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Download original specifications, schemas, BPMN choreography models, and sample messages directly to your machine.
        </p>

        <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {files.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-start space-x-2.5">
                <FileCode className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono font-bold text-xs text-white block">{f.name}</span>
                  <span className="text-[11px] text-slate-400 block">{f.desc}</span>
                </div>
              </div>
              <a
                href={f.path}
                download={f.name}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get</span>
              </a>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
