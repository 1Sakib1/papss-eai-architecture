import React, { useState, useEffect } from 'react';
import { ASSETS } from '../data/embedded_assets';
import { validateXmlDocument } from '../utils/xmlValidator';
import { ShieldCheck, CheckCircle2, AlertOctagon, Code, Play, Copy, Check, FileText, Layers, AlertTriangle } from 'lucide-react';

export default function SchemaValidator() {
  const [activeTab, setActiveTab] = useState('validator'); // 'validator', 'schemas', 'theory'
  const [activeSchema, setActiveSchema] = useState('common'); // 'common', 'payment', 'settlement', 'wsdl'
  const [activePreset, setActivePreset] = useState('invalid'); // 'invalid', 'validPayment', 'validSettlement'
  const [xmlInput, setXmlInput] = useState(ASSETS.sampleInvalidXml);
  const [validationResult, setValidationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Run validation initially
    runValidation(xmlInput);
  }, []);

  const runValidation = (text) => {
    const res = validateXmlDocument(text);
    setValidationResult(res);
  };

  const handleSelectPreset = (preset) => {
    setActivePreset(preset);
    let content = "";
    if (preset === 'validPayment') content = ASSETS.samplePaymentXml;
    else if (preset === 'validSettlement') content = ASSETS.sampleSettlementXml;
    else if (preset === 'invalid') content = ASSETS.sampleInvalidXml;

    setXmlInput(content);
    runValidation(content);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSchemaCode = () => {
    switch (activeSchema) {
      case 'common': return ASSETS.commonXsd;
      case 'payment': return ASSETS.paymentXsd;
      case 'settlement': return ASSETS.settlementXsd;
      case 'wsdl': return ASSETS.wsdl;
      default: return ASSETS.commonXsd;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>XML Schema Design (Task 3 Implementation)</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              XSD Architecture & Live In-Browser Validator
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Strict XML Schema validation at the API Gateway protects the orchestration from malformed messages. Test valid payloads and deliberately malformed instructions against canonical ISO 20022 rules.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('validator')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'validator'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Live Schema Validator
            </button>
            <button
              onClick={() => setActiveTab('schemas')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'schemas'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Inspect XSD Schemas
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-brand-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Validation Guarantees
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Live Validator Sandbox */}
      {activeTab === 'validator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: XML Editor & Presets */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Select Test Sample Payload:
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleSelectPreset('invalid')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    activePreset === 'invalid' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Malformed (4 Defects)
                </button>
                <button
                  onClick={() => handleSelectPreset('validPayment')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    activePreset === 'validPayment' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Valid pacs.008
                </button>
                <button
                  onClick={() => handleSelectPreset('validSettlement')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    activePreset === 'validSettlement' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Valid Settlement
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={xmlInput}
                onChange={(e) => {
                  setXmlInput(e.target.value);
                  runValidation(e.target.value);
                }}
                rows={18}
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:border-brand-500 outline-none leading-relaxed"
                spellCheck={false}
              />
              <button
                onClick={() => handleCopy(xmlInput)}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Lines: {xmlInput.split('\n').length}</span>
              <button
                onClick={() => runValidation(xmlInput)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md shadow-brand-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Re-Validate Schema</span>
              </button>
            </div>
          </div>

          {/* Right: Validation Output Diagnostics (Mirroring xmllint) */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Gateway Validation Engine</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Diagnostic Report</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">Schema Detected:</span>
                <div className="text-xs font-mono text-brand-300 font-semibold">{validationResult?.schemaDetected}</div>
              </div>
            </div>

            {/* Status Banner */}
            {validationResult?.isValid ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">Document Validates Successfully!</h4>
                  <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                    $ xmllint --noout --schema {validationResult.schemaDetected} document.xml<br />
                    <strong>Result: validates (0 schema errors, {validationResult.elementCount} elements checked).</strong>
                  </p>
                  <p className="text-[11px] text-emerald-400/80 mt-1.5">
                    Data integrity confirmed: valid UETR, registered settlement currency, properly formatted BICs, and well-formed party details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start space-x-3">
                <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-300">
                    Schema Validation Failed ({validationResult?.errors.length} Errors Found)
                  </h4>
                  <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                    The API Gateway rejected this payload before entering ESB orchestration. Below are the precise xmllint-style facet violations:
                  </p>
                </div>
              </div>
            )}

            {/* Error Diagnostics List */}
            {validationResult?.errors && validationResult.errors.length > 0 && (
              <div className="space-y-3">
                {validationResult.errors.map((err, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/90 border border-red-900/50 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-red-400">
                      <span className="font-bold">Line {err.line} · Element: {err.element}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300">
                        {err.rule}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                      {err.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings list if any */}
            {validationResult?.warnings && validationResult.warnings.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Business Rule Warnings:</span>
                {validationResult.warnings.map((w, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                    <div className="font-bold text-amber-300">{w.rule}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{w.message}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Educational breakdown of the 4 defects */}
            {activePreset === 'invalid' && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-brand-300 block">Why catching these 4 errors at the gateway matters:</span>
                <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                  <li><strong>Truncated BIC ('ECOCGH'):</strong> Prevents routing failure in the participant directory.</li>
                  <li><strong>Unregistered Currency ('GBP'):</strong> Prevents debit failure later in Pre-Funding Management (no clearing account exists).</li>
                  <li><strong>Fraction digits ('250000.555'):</strong> Prevents 3-decimal rounding errors reaching national central bank RTGS ledgers.</li>
                  <li><strong>Missing Creditor Account:</strong> Prevents rejecting during Alt Bank NUBAN check, saving bank API bandwidth.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Inspect XSD Schemas */}
      {activeTab === 'schemas' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Select Schema Contract:</span>
              <div className="flex items-center space-x-1">
                {[
                  { id: 'common', label: 'PapssCommonTypes.xsd' },
                  { id: 'payment', label: 'PaymentInstruction.xsd' },
                  { id: 'settlement', label: 'NetSettlementInstruction.xsd' },
                  { id: 'wsdl', label: 'PaymentService.wsdl' },
                ].map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setActiveSchema(sch.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                      activeSchema === sch.id
                        ? 'bg-brand-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sch.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCopy(getSchemaCode())}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Schema'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto max-h-[550px]">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed">
              {getSchemaCode()}
            </pre>
          </div>
        </div>
      )}

      {/* Mode 3: Validation Guarantees & Theoretical Justification */}
      {activeTab === 'theory' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> What XML Schema Validation Guarantees
              </h3>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li><strong>Data Integrity:</strong> Amounts are strictly bounded to 2 fraction digits and positive values (≥ 0.01) with mandatory ISO 4217 currency attributes, preventing rounding drift on clearing ledgers.</li>
                <li><strong>Consistency & Normalization:</strong> Strips core banking disparities (e.g. DD/MM/YYYY vs YYYYMMDD) into canonical xsd:date (YYYY-MM-DD) before reaching orchestration.</li>
                <li><strong>Machine-Readable Interoperability:</strong> Client banks generate strongly typed SDKs directly from WSDL/XSD without relying on ambiguous prose.</li>
                <li><strong>Early Boundary Defense:</strong> Rejection at the API Gateway costs virtually zero compute, saving the ESB from executing costly compensation rollbacks.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <h3 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> What Validation Does NOT Guarantee
              </h3>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li><strong>Truth of Data:</strong> A schema proves an account number is syntactically well-formed, but not that the account exists, is active, or belongs to the named creditor.</li>
                <li><strong>Liquidity Sufficiency:</strong> A valid pacs.008 will still fail at Check Funds if the bank's pre-funded RTGS clearing account has insufficient balance (handled by WS-04).</li>
                <li><strong>Sanctions Status:</strong> A party name conforming to NameType (1–140 chars) may still be a designated terrorist or politically exposed person (handled by WS-02).</li>
                <li><strong>Cross-Row Arithmetic (XSD 1.0 limit):</strong> Verifying that TotalNetAmount equals the exact mathematical sum of all NetAmounts (zero-sum) requires XSD 1.1 assertions or business layer rules (handled in Settlement Orchestration).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
