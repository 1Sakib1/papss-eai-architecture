import React from 'react';
import { Layers, Activity, ShieldCheck, Cpu, Download, ExternalLink, GitBranch, RefreshCw } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenDownloads }) {
  const tabs = [
    { id: 'architecture', label: 'EAI Architecture', icon: Layers },
    { id: 'bpmn', label: 'BPMN Simulator', icon: Activity },
    { id: 'services', label: 'Web Services (WS 1-6)', icon: Cpu },
    { id: 'schemas', label: 'XSD & Validator', icon: ShieldCheck },
    { id: 'transformation', label: 'Data Mapping', icon: RefreshCw },
    { id: 'settlement', label: 'Net Settlement', icon: GitBranch },
    { id: 'docs', label: 'Technical Report', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-navy-950/90 backdrop-blur-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* Logo Mark */}
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-400 p-[2px] shadow-lg shadow-brand-500/20">
            <div className="h-full w-full bg-navy-950 rounded-[10px] flex items-center justify-center font-extrabold text-brand-400 text-lg tracking-wider">
              P
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">PAPSS</span>
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                EAI Hub v1.0
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                ISO 20022 · SOAP 1.2 · BPMN 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pan-African Payment & Settlement System — Enterprise Integration Architecture
            </p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">API Gateway: Online</span>
          </div>
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Clearing Cycle: GHS-NGN-USD</span>
          </div>
          <button
            onClick={onOpenDownloads}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs shadow-md shadow-brand-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Artifacts & Code</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-t border-slate-800/60 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm shadow-brand-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
