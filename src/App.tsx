/**
 * FinTrack — MySQL Database Design & Java Persistence Architecture Studio
 * Built for Indian Personal Finance Management (INR / ₹)
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { SchemaViewer } from './components/SchemaViewer';
import { ReportingQueriesView } from './components/ReportingQueriesView';
import { LiveSqlRunner } from './components/LiveSqlRunner';
import { CodeInspector } from './components/CodeInspector';
import { ArchitectureRulesView } from './components/ArchitectureRulesView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('schema');
  const [initialCodeFile, setInitialCodeFile] = useState<string | undefined>(undefined);

  const handleOpenCodeFile = (fileName: string) => {
    setInitialCodeFile(fileName);
    setActiveTab('code-inspector');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Bar Contract (3 zones, 1 line links, 1 CTA) */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'schema' && (
          <SchemaViewer onOpenCodeFile={handleOpenCodeFile} />
        )}

        {activeTab === 'reporting' && (
          <ReportingQueriesView />
        )}

        {activeTab === 'sql-runner' && (
          <LiveSqlRunner />
        )}

        {activeTab === 'code-inspector' && (
          <CodeInspector initialFile={initialCodeFile} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureRulesView />
        )}
      </main>

      {/* Clean Unboxed Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FinTrack Database Engine</span>
            <span aria-hidden="true">·</span>
            <span>MySQL 8.x InnoDB</span>
            <span aria-hidden="true">·</span>
            <span>Java 21 / Spring Boot 3</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">INR (₹) Standard</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Flyway Baseline V1-V3 · DECIMAL(15,2) / BigDecimal
          </div>
        </div>
      </footer>
    </div>
  );
}
