import React, { useState } from 'react';
import { Download, Database, Check } from 'lucide-react';
import JSZip from 'jszip';
import { BACKEND_FILES } from '../data/backendCodeRegistry';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      // Add all backend files into the ZIP archive in proper folder structure
      BACKEND_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add supplementary project structure info
      zip.file(
        'PROJECT_INFO.txt',
        `FinTrack — MySQL 8.x Database Layer & Spring Boot 3 JPA Persistence
Generated for Indian Market (INR - Indian Rupees)
Currency format: DECIMAL(15, 2) / BigDecimal(15, 2)
Flyway migrations included in src/main/resources/db/migration/
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fintrack-mysql-spring-boot-backend.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  const navItems = [
    { id: 'schema', label: 'Schema & ERD' },
    { id: 'reporting', label: 'Reporting Queries' },
    { id: 'sql-runner', label: 'Live SQL Runner' },
    { id: 'code-inspector', label: 'Code Files' },
    { id: 'architecture', label: 'Architecture & Rules' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white whitespace-nowrap">
            FinTrack <span className="text-emerald-400 font-normal">DB Studio</span>
          </span>
          <span className="text-xs text-slate-500 font-mono border-l border-slate-800 pl-2.5 ml-1 hidden sm:inline">
            MySQL 8.x · INR (₹)
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                activeTab === item.id
                  ? 'text-emerald-400 font-semibold border-b-2 border-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-sm shadow-emerald-500/20"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Packing...' : 'Download Backend ZIP'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 gap-2 bg-slate-900/50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium ${
              activeTab === item.id
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
