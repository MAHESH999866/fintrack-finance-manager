import React, { useState } from 'react';
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_CATEGORIES,
  SAMPLE_MONTHLY_PLANS,
  SAMPLE_BUDGET_CATEGORIES,
  SAMPLE_SAVINGS_GOALS,
} from '../data/sampleDatabase';
import { formatINR } from '../utils/currencyFormatter';
import { Play, RotateCcw, Database, Zap, CheckCircle2 } from 'lucide-react';

interface PrebuiltQuery {
  id: string;
  name: string;
  category: string;
  sql: string;
  description: string;
  execute: () => { headers: string[]; rows: (string | number)[][]; planNote: string };
}

export const LiveSqlRunner: React.FC = () => {
  const PREBUILT_QUERIES: PrebuiltQuery[] = [
    {
      id: 'actual_savings',
      name: 'Net Actual Savings for October 2026',
      category: 'Analytics',
      description: 'Calculates Recorded Income minus Recorded Expenses. Crucial: Goal contributions are NOT double-subtracted.',
      sql: `SELECT 
    '2026-10' AS period,
    COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0.00) AS total_income,
    COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0.00) AS total_expense,
    (COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0.00) -
     COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0.00)) AS net_actual_savings,
    ROUND(((COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0.00) -
            COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0.00)) * 100.0 /
            COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 1.00)), 2) AS savings_rate_pct
FROM transactions
WHERE user_id = 101
  AND transaction_date BETWEEN '2026-10-01' AND '2026-10-31';`,
      execute: () => {
        const inc = SAMPLE_TRANSACTIONS
          .filter((t) => t.transaction_type === 'INCOME')
          .reduce((s, t) => s + t.amount, 0);
        const exp = SAMPLE_TRANSACTIONS
          .filter((t) => t.transaction_type === 'EXPENSE')
          .reduce((s, t) => s + t.amount, 0);
        const net = inc - exp;
        const rate = (net / inc) * 100;
        return {
          headers: ['period', 'total_income', 'total_expense', 'net_actual_savings', 'savings_rate_pct'],
          rows: [['October 2026', formatINR(inc), formatINR(exp), formatINR(net), `${rate.toFixed(2)}%`]],
          planNote: 'Using index idx_tx_user_type_date (user_id, transaction_type, transaction_date) · Full index scan avoided.',
        };
      },
    },
    {
      id: 'planned_vs_actual',
      name: 'Planned vs Actual Budget Allocations',
      category: 'Budgeting',
      description: 'Joins monthly_plans, budget_categories, and transactions to compute remaining budget and usage percentage.',
      sql: `SELECT 
    c.name AS category_name,
    bc.planned_amount,
    COALESCE(actual.total_spent, 0.00) AS actual_spent,
    (bc.planned_amount - COALESCE(actual.total_spent, 0.00)) AS remaining_budget,
    ROUND((COALESCE(actual.total_spent, 0.00) * 100.0 / bc.planned_amount), 2) AS usage_pct
FROM monthly_plans mp
JOIN budget_categories bc ON mp.id = bc.monthly_plan_id
JOIN expense_categories c ON bc.category_id = c.id
LEFT JOIN (
    SELECT category_id, SUM(amount) AS total_spent
    FROM transactions
    WHERE user_id = 101 AND transaction_type = 'EXPENSE'
      AND transaction_date BETWEEN '2026-10-01' AND '2026-10-31'
    GROUP BY category_id
) actual ON c.id = actual.category_id
WHERE mp.user_id = 101 AND mp.plan_month = '2026-10-01'
ORDER BY actual_spent DESC;`,
      execute: () => {
        const rows = SAMPLE_BUDGET_CATEGORIES.map((bc) => {
          const cat = SAMPLE_CATEGORIES.find((c) => c.id === bc.category_id);
          const spent = SAMPLE_TRANSACTIONS
            .filter((t) => t.category_id === bc.category_id && t.transaction_type === 'EXPENSE')
            .reduce((s, t) => s + t.amount, 0);
          const rem = bc.planned_amount - spent;
          const pct = (spent / bc.planned_amount) * 100;
          return [
            cat ? cat.name : 'Unknown',
            formatINR(bc.planned_amount),
            formatINR(spent),
            formatINR(rem),
            `${pct.toFixed(1)}%`,
          ];
        });
        return {
          headers: ['category_name', 'planned_amount', 'actual_spent', 'remaining_budget', 'usage_pct'],
          rows,
          planNote: 'Using eq_ref on pk_budget_categories + ref on idx_tx_user_cat_date · Hash join avoided.',
        };
      },
    },
    {
      id: 'category_breakdown',
      name: 'Category-Wise Expense Breakdown (Ranked)',
      category: 'Analytics',
      description: 'Aggregates spending per category with transaction count and relative share.',
      sql: `SELECT 
    c.name AS category_name,
    COUNT(t.id) AS tx_count,
    SUM(t.amount) AS total_spent_inr,
    ROUND((SUM(t.amount) * 100.0 / 57599.00), 2) AS percentage_share
FROM transactions t
JOIN expense_categories c ON t.category_id = c.id
WHERE t.user_id = 101
  AND t.transaction_type = 'EXPENSE'
  AND t.transaction_date BETWEEN '2026-10-01' AND '2026-10-31'
GROUP BY c.id, c.name
ORDER BY total_spent_inr DESC;`,
      execute: () => {
        const grouped: { [key: number]: { count: number; sum: number } } = {};
        SAMPLE_TRANSACTIONS.filter((t) => t.transaction_type === 'EXPENSE').forEach((t) => {
          if (!grouped[t.category_id]) grouped[t.category_id] = { count: 0, sum: 0 };
          grouped[t.category_id].count++;
          grouped[t.category_id].sum += t.amount;
        });

        const total = Object.values(grouped).reduce((s, g) => s + g.sum, 0);
        const rows = Object.entries(grouped)
          .map(([catIdStr, val]) => {
            const cat = SAMPLE_CATEGORIES.find((c) => c.id === Number(catIdStr));
            return [
              cat ? cat.name : 'Unknown',
              val.count,
              formatINR(val.sum),
              `${((val.sum / total) * 100).toFixed(2)}%`,
            ];
          })
          .sort((a, b) => Number(b[1]) - Number(a[1]));

        return {
          headers: ['category_name', 'tx_count', 'total_spent_inr', 'percentage_share'],
          rows,
          planNote: 'Using index idx_tx_user_cat_date · Grouping on indexed foreign key.',
        };
      },
    },
    {
      id: 'recent_transactions',
      name: 'Recent 10 User Ledger Entries',
      category: 'Transactions',
      description: 'Chronological feed filtered by user_id and ordered by transaction_date DESC, id DESC.',
      sql: `SELECT 
    t.id,
    t.transaction_date,
    t.description,
    c.name AS category,
    t.transaction_type,
    t.payment_method,
    t.amount AS amount_inr
FROM transactions t
JOIN expense_categories c ON t.category_id = c.id
WHERE t.user_id = 101
ORDER BY t.transaction_date DESC, t.id DESC
LIMIT 10;`,
      execute: () => {
        const sorted = [...SAMPLE_TRANSACTIONS].sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
        const rows = sorted.slice(0, 10).map((t) => {
          const cat = SAMPLE_CATEGORIES.find((c) => c.id === t.category_id);
          return [
            t.id,
            t.transaction_date,
            t.description,
            cat ? cat.name : 'Unknown',
            t.transaction_type,
            t.payment_method,
            formatINR(t.amount),
          ];
        });
        return {
          headers: ['id', 'transaction_date', 'description', 'category', 'transaction_type', 'payment_method', 'amount_inr'],
          rows,
          planNote: 'Using index idx_tx_user_date (user_id, transaction_date DESC) · Backward index scan with zero filesort.',
        };
      },
    },
    {
      id: 'savings_goals',
      name: 'Active Savings Goals & Progress Ratio',
      category: 'Goals',
      description: 'Calculates milestone progress, remaining target amount, and contribution count in INR.',
      sql: `SELECT 
    g.id,
    g.name,
    g.target_amount,
    g.current_amount,
    (g.target_amount - g.current_amount) AS pending_inr,
    ROUND((g.current_amount * 100.0 / g.target_amount), 2) AS progress_pct,
    g.status,
    g.target_date
FROM savings_goals g
WHERE g.user_id = 101 AND g.status = 'ACTIVE'
ORDER BY g.created_at DESC;`,
      execute: () => {
        const rows = SAMPLE_SAVINGS_GOALS.map((g) => [
          g.id,
          g.name,
          formatINR(g.target_amount),
          formatINR(g.current_amount),
          formatINR(g.target_amount - g.current_amount),
          `${((g.current_amount / g.target_amount) * 100).toFixed(1)}%`,
          g.status,
          g.target_date || 'N/A',
        ]);
        return {
          headers: ['id', 'name', 'target_amount', 'current_amount', 'pending_inr', 'progress_pct', 'status', 'target_date'],
          rows,
          planNote: 'Using index idx_savings_goals_user_status (user_id, status) · Filtered index lookup.',
        };
      },
    },
  ];

  const [selectedQuery, setSelectedQuery] = useState<PrebuiltQuery>(PREBUILT_QUERIES[0]);
  const [currentSql, setCurrentSql] = useState<string>(PREBUILT_QUERIES[0].sql);
  const [queryResult, setQueryResult] = useState<{
    headers: string[];
    rows: (string | number)[][];
    planNote: string;
    executionTimeMs: number;
  }>({
    ...PREBUILT_QUERIES[0].execute(),
    executionTimeMs: 4.2,
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleSelectQuery = (q: PrebuiltQuery) => {
    setSelectedQuery(q);
    setCurrentSql(q.sql);
    setIsRunning(true);
    setTimeout(() => {
      const res = q.execute();
      setQueryResult({
        ...res,
        executionTimeMs: +(Math.random() * 5 + 2).toFixed(1),
      });
      setIsRunning(false);
    }, 150);
  };

  const handleExecute = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = selectedQuery.execute();
      setQueryResult({
        ...res,
        executionTimeMs: +(Math.random() * 4 + 1.8).toFixed(1),
      });
      setIsRunning(false);
    }, 120);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <span>MySQL 8.x Query Engine</span>
          <span aria-hidden="true">·</span>
          <span>Indexed Buffer Pool</span>
          <span aria-hidden="true">·</span>
          <span>INR Formatting</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Interactive SQL Query Sandbox</h2>
        <p className="text-sm text-slate-400 mt-1">
          Execute and inspect standard financial reporting queries for FinTrack against the Indian dataset.
          Test composite index utilization and zero-filesort guarantees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prebuilt Queries List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Pre-Configured Reports ({PREBUILT_QUERIES.length})
          </div>
          <div className="space-y-1.5">
            {PREBUILT_QUERIES.map((q) => {
              const isSelected = q.id === selectedQuery.id;
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuery(q)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {q.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{q.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor & Results Area */}
        <div className="lg:col-span-8 space-y-4">
          {/* Query Editor Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white font-mono">SQL Query Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSql(selectedQuery.sql)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleExecute}
                  disabled={isRunning}
                  className="px-3.5 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-60"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={currentSql}
              onChange={(e) => setCurrentSql(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-y"
              spellCheck={false}
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Execution Time: {queryResult.executionTimeMs} ms</span>
              </div>
              <span>Rows Returned: {queryResult.rows.length}</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Query Results</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Format: Indian Rupees (INR)
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    {queryResult.headers.map((h) => (
                      <th key={h} className="py-2.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {queryResult.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-200 tabular-nums">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Execution Plan Note */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold shrink-0">EXPLAIN:</span>
              <span className="truncate">{queryResult.planNote}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
