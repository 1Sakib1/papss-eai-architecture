import React, { useState } from 'react';
import Header from './components/Header';
import ArchitectureHub from './components/ArchitectureHub';
import BpmnSimulator from './components/BpmnSimulator';
import WebServicesCatalog from './components/WebServicesCatalog';
import SchemaValidator from './components/SchemaValidator';
import DataTransformation from './components/DataTransformation';
import NetSettlement from './components/NetSettlement';
import TechDocumentation from './components/TechDocumentation';
import DownloadsModal from './components/DownloadsModal';
import { Github, Globe, Shield, Terminal, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('architecture');
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-brand-500/30 selection:text-brand-300">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDownloads={() => setIsDownloadsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'architecture' && <ArchitectureHub />}
        {activeTab === 'bpmn' && <BpmnSimulator />}
        {activeTab === 'services' && <WebServicesCatalog />}
        {activeTab === 'schemas' && <SchemaValidator />}
        {activeTab === 'transformation' && <DataTransformation />}
        {activeTab === 'settlement' && <NetSettlement />}
        {activeTab === 'docs' && <TechDocumentation onOpenDownloads={() => setIsDownloadsOpen(true)} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950/80 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-bold text-white text-sm">
              <span className="text-brand-400">PAPSS Integration Hub</span>
              <span>· Enterprise Architecture Portal</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pan-African Payment and Settlement System (PAPSS) cross-border payment integration model.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <a
              href="https://github.com/1Sakib1/papss-eai-architecture"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span>1Sakib1/papss-eai-architecture</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
            <span>·</span>
            <span>Designed by @Sakib</span>
          </div>
        </div>
      </footer>

      {/* Downloads Modal */}
      <DownloadsModal
        isOpen={isDownloadsOpen}
        onClose={() => setIsDownloadsOpen(false)}
      />
    </div>
  );
}
