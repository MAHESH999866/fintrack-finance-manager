import React, { useState } from 'react';
import { SCHEMA_TABLES, SchemaTable } from '../data/schemaData';
import { Database, Key, Shield, ArrowRight, Layers, Table as TableIcon } from 'lucide-react';

interface SchemaViewerProps {
  onOpenCodeFile?: (fileName: string) => void;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ onOpenCodeFile }) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('transactions');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showErdDiagram, setShowErdDiagram] = useState<boolean>(true);

  const categories = ['All', 'Identity', 'Classification', 'Budgeting', 'Ledger', 'Goals', 'Assistant'];

  const filteredTables = SCHEMA_TABLES.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  const selectedTable: SchemaTable =
    SCHEMA_TABLES.find((t) => t.id === selectedTableId) || SCHEMA_TABLES[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <span>MySQL 8.x Normalized Relational Schema</span>
            <span aria-hidden="true">·</span>
            <span>InnoDB</span>
            <span aria-hidden="true">·</span>
            <span>utf8mb4_0900_ai_ci</span>
            <span aria-hidden="true">·</span>
            <span>INR (₹) Standard</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            FinTrack Database Architecture &amp; Persistence Layer
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            8 normalized tables engineered for high-throughput Indian personal finance tracking.
            Guaranteed user scoping, positive monetary amounts via <code className="text-emerald-300 font-mono">DECIMAL(15,2)</code> / <code className="text-emerald-300 font-mono">BigDecimal</code>, and strict audit timestamps.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowErdDiagram(!showErdDiagram)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
              showErdDiagram
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {showErdDiagram ? 'Hide Mermaid ERD' : 'Show Mermaid ERD'}
          </button>
        </div>
      </div>

      {/* Visual ERD Diagram Card */}
      {showErdDiagram && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Entity Relationship Topology (8 Normalized Tables)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Referential Integrity Enforced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-emerald-400 flex items-center justify-between">
                <span>users</span>
                <span className="text-[10px] text-slate-500">1 : N</span>
              </div>
              <p className="text-slate-400 mt-1">Identity root. Owns plans, transactions, goals, categories, and AI chats.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-emerald-400 flex items-center justify-between">
                <span>monthly_plans</span>
                <span className="text-[10px] text-slate-500">1 : N (Budgets)</span>
              </div>
              <p className="text-slate-400 mt-1">First-of-month (YYYY-MM-01) date anchor. Cascades to budget categories.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-emerald-400 flex items-center justify-between">
                <span>transactions</span>
                <span className="text-[10px] text-slate-500">N : 1 (User, Cat)</span>
              </div>
              <p className="text-slate-400 mt-1">Actual historical cash flows in INR. Restrict deletion protects ledgers.</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-emerald-400 flex items-center justify-between">
                <span>savings_goals</span>
                <span className="text-[10px] text-slate-500">1 : N (Contribs)</span>
              </div>
              <p className="text-slate-400 mt-1">Milestones in INR. Contributions do not double-subtract from savings.</p>
            </div>
          </div>

          {/* Clean ASCII / Mermaid Visual Flow */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="text-emerald-400 font-semibold mb-2">// Relationship Flow Matrix</div>
            <div className="whitespace-pre text-slate-400 leading-relaxed">
{`[users] ─────1:N─────> [monthly_plans] ─────1:N─────> [budget_categories]
   │                          │                                  │
   ├─────1:N─────> [transactions] <────────N:1────── [expense_categories]
   │
   ├─────1:N─────> [savings_goals] ────1:N─────> [savings_contributions]
   │
   └─────1:N─────> [chatbot_conversations] ──1:N──> [chatbot_messages]`}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
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
            {cat} {cat === 'All' ? `(${SCHEMA_TABLES.length})` : ''}
          </button>
        ))}
      </div>

      {/* Main Table Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Database Tables ({filteredTables.length})
          </div>
          <div className="space-y-1.5">
            {filteredTables.map((t) => {
              const isSelected = t.id === selectedTableId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TableIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className={`font-mono text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {t.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {t.columns.length} cols
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">{t.description}</div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
                    <span>{t.entityName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-500/80">{t.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table Detailed View */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white">{selectedTable.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {selectedTable.entityName}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedTable.description}</p>
              </div>

              {onOpenCodeFile && (
                <button
                  onClick={() => onOpenCodeFile(selectedTable.entityName)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>View JPA Entity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Column Schema Table */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Column Definitions &amp; Mappings</span>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">MySQL Type</th>
                      <th className="py-2.5 px-3">Java Type</th>
                      <th className="py-2.5 px-3">Nullability</th>
                      <th className="py-2.5 px-3">Key / Constraint</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-white flex items-center gap-1.5">
                          {col.isPk && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                          {col.isFk && <span className="text-[10px] text-blue-400 shrink-0">FK</span>}
                          <span>{col.name}</span>
                        </td>
                        <td className="py-2 px-3 text-emerald-400">{col.type}</td>
                        <td className="py-2 px-3 text-indigo-300">{col.javaType}</td>
                        <td className="py-2 px-3 text-slate-400">
                          {col.nullable ? 'NULL' : 'NOT NULL'}
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {col.isPk && <span className="text-amber-400">PK (Auto)</span>}
                          {col.isFk && <span className="text-blue-400">→ {col.references}</span>}
                          {col.isUnique && <span className="text-purple-400">UNIQUE</span>}
                          {!col.isPk && !col.isFk && !col.isUnique && (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Indexes & Performance Optimization */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Indexes &amp; Query Optimization</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {selectedTable.indexes.map((idx) => (
                  <div key={idx.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-emerald-400 font-semibold">{idx.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {idx.isUnique ? 'UNIQUE INDEX' : 'INDEX'}
                      </span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] mt-1">
                      ({idx.columns.join(', ')})
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-1">
                      {idx.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrity Constraints & Deletion Rules */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-300">Referential Integrity &amp; Deletion Guardrails:</span>
              <p className="text-slate-400 leading-relaxed">{selectedTable.cardinalityNotes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
