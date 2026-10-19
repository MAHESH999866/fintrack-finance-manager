import React, { useState } from 'react';
import { BACKEND_FILES, BackendFile } from '../data/backendCodeRegistry';
import { Copy, Check, Download, FileCode, Search, Terminal } from 'lucide-react';

interface CodeInspectorProps {
  initialFile?: string;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ initialFile }) => {
  const [selectedFile, setSelectedFile] = useState<BackendFile>(() => {
    if (initialFile) {
      const match = BACKEND_FILES.find((f) => f.name.toLowerCase() === initialFile.toLowerCase());
      if (match) return match;
    }
    return BACKEND_FILES[0];
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = ['All', 'Migration', 'Entity', 'Repository', 'Config', 'Documentation'];

  const filteredFiles = BACKEND_FILES.filter((f) => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <span>Java 21 · Spring Boot 3.x · Jakarta Persistence 3.1</span>
          <span aria-hidden="true">·</span>
          <span>Flyway Migrations</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Source Code Inspector &amp; Artifacts</h2>
        <p className="text-sm text-slate-400 mt-1">
          Production-grade standalone Java persistence files, Spring Data JPA repositories, Flyway SQL migrations,
          and YAML configs ready to copy or drop directly into your Spring Boot microservice.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code files..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Directory Sidebar */}
        <div className="lg:col-span-4 space-y-1.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
            File Registry ({filteredFiles.length})
          </div>
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredFiles.map((f) => {
              const isSelected = f.name === selectedFile.name;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {f.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {f.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1 truncate">{f.path}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-white">{selectedFile.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedFile.language.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
              <div className="text-[11px] font-mono text-slate-500 mt-1">Path: {selectedFile.path}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSingle}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Window with Line Numbers */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 max-h-[520px] overflow-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre className="whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
