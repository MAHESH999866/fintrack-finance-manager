import React, { useState } from 'react';
import {
  SAMPLE_TRANSACTIONS,
  SAMPLE_CATEGORIES,
  SAMPLE_MONTHLY_PLANS,
  SAMPLE_BUDGET_CATEGORIES,
  SAMPLE_SAVINGS_GOALS,
  SAMPLE_SAVINGS_CONTRIBUTIONS,
} from '../data/sampleDatabase';
import { formatINR, formatCompactINR } from '../utils/currencyFormatter';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Code2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ReportingQueriesView: React.FC = () => {
  const [selectedMonth] = useState('2026-10');
  const [activeSqlModal, setActiveSqlModal] = useState<string | null>(null);

  // Filter transactions for October 2026
  const octoberTx = SAMPLE_TRANSACTIONS.filter((t) => t.transaction_date.startsWith(selectedMonth));

  // Compute Income & Expense
  const totalIncome = octoberTx
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = octoberTx
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  // Business Rule: Actual Savings = Income - Expense (do NOT double-subtract contributions!)
  const actualSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0;

  // Monthly Plan for October
  const plan = SAMPLE_MONTHLY_PLANS[0];
  const targetSavings = plan ? plan.target_savings : 0;
  const expectedIncome = plan ? plan.expected_income : 0;

  // Category-wise expense breakdown
  const categoryExpenses: { [key: number]: number } = {};
  octoberTx
    .filter((t) => t.transaction_type === 'EXPENSE')
    .forEach((t) => {
      categoryExpenses[t.category_id] = (categoryExpenses[t.category_id] || 0) + t.amount;
    });

  const categorySpendingReport = Object.entries(categoryExpenses)
    .map(([catIdStr, spent]) => {
      const catId = Number(catIdStr);
      const cat = SAMPLE_CATEGORIES.find((c) => c.id === catId);
      const pct = totalExpense > 0 ? (spent / totalExpense) * 100 : 0;
      return {
        categoryId: catId,
        name: cat ? cat.name : 'Unknown',
        spent,
        percentage: pct,
      };
    })
    .sort((a, b) => b.spent - a.spent);

  // Planned vs Actual Budgets
  const plannedVsActual = SAMPLE_BUDGET_CATEGORIES.map((bc) => {
    const cat = SAMPLE_CATEGORIES.find((c) => c.id === bc.category_id);
    const actualSpent = categoryExpenses[bc.category_id] || 0;
    const remaining = bc.planned_amount - actualSpent;
    const usagePct = bc.planned_amount > 0 ? (actualSpent / bc.planned_amount) * 100 : 0;

    return {
      categoryId: bc.category_id,
      categoryName: cat ? cat.name : 'Unallocated',
      planned: bc.planned_amount,
      actual: actualSpent,
      remaining,
      usagePct,
      status: usagePct > 100 ? 'OVER_BUDGET' : usagePct > 85 ? 'WARNING' : 'HEALTHY',
    };
  }).sort((a, b) => b.actual - a.actual);

  const totalPlannedExpense = SAMPLE_BUDGET_CATEGORIES.reduce((s, b) => s + b.planned_amount, 0);

  // Daily Expense Aggregation
  const dailyExpenses: { [date: string]: number } = {};
  octoberTx
    .filter((t) => t.transaction_type === 'EXPENSE')
    .forEach((t) => {
      dailyExpenses[t.transaction_date] = (dailyExpenses[t.transaction_date] || 0) + t.amount;
    });

  const dailyTrend = Object.entries(dailyExpenses)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, amount]) => ({ date, amount }));

  return (
    <div className="space-y-6">
      {/* Scope and Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">October 2026 Financial Reports</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                User ID: 101 · Rahul Sharma
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live calculated from MySQL 8.x schema transactions. Amounts in Indian Rupees (INR).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSqlModal(activeSqlModal ? null : 'all')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeSqlModal ? 'Hide SQL Code' : 'Inspect SQL & JPQL Queries'}</span>
          </button>
        </div>
      </div>

      {/* SQL Queries Collapsible Card */}
      {activeSqlModal && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs text-slate-300 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Production MySQL 8.x &amp; Spring Data JPA Reporting Queries</span>
            </span>
            <span className="text-slate-500 text-[11px]">Strict User Scoping &amp; Date Range Protection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">1. Actual Savings Calculation (SQL):</div>
              <pre className="p-3 rounded bg-slate-900 border border-slate-800 overflow-x-auto text-emerald-300">
{`SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS actual_savings
FROM transactions
WHERE user_id = :userId
  AND transaction_date BETWEEN '2026-10-01' AND '2026-10-31';`}
              </pre>
            </div>

            <div>
              <div className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">2. Category Breakdown (JPQL):</div>
              <pre className="p-3 rounded bg-slate-900 border border-slate-800 overflow-x-auto text-indigo-300">
{`@Query("""
  SELECT new com.fintrack.dto.CategorySpendingReportDto(
      c.id, c.name, c.categoryType, SUM(t.amount), COUNT(t.id)
  )
  FROM Transaction t JOIN t.category c
  WHERE t.user.id = :userId AND t.transactionType = 'EXPENSE'
    AND t.transactionDate BETWEEN :startDate AND :endDate
  GROUP BY c.id, c.name, c.categoryType
  ORDER BY SUM(t.amount) DESC
""")`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Recorded In-Hand Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatINR(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
            <span>Plan: {formatCompactINR(expectedIncome)}</span>
            <span className="text-emerald-400">+{formatCompactINR(totalIncome - expectedIncome)} vs Plan</span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Recorded Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {formatINR(totalExpense)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
            <span>Budgeted Cap: {formatCompactINR(totalPlannedExpense)}</span>
            <span className="text-emerald-400">{((totalExpense / totalPlannedExpense) * 100).toFixed(1)}% Used</span>
          </div>
        </div>

        {/* Actual Savings */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Actual Net Savings</span>
            <PiggyBank className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-400 tabular-nums">
            {formatINR(actualSavings)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
            <span>Savings Rate</span>
            <span className="text-indigo-400 font-semibold">{savingsRate.toFixed(1)}% of Income</span>
          </div>
        </div>

        {/* Target Savings Achievement */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Target Savings Goal</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            {formatINR(targetSavings)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
            <span>Target Achieved</span>
            <span className="text-emerald-400 font-semibold">
              {targetSavings > 0 ? ((actualSavings / targetSavings) * 100).toFixed(0) : 0}% Achieved
            </span>
          </div>
        </div>
      </div>

      {/* Planned vs Actual Budget Allocation Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Planned vs. Actual Category Spending (October 2026 Plan #501)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Budget compliance tracking. Sum of planned expenses (₹ 90,000) + target savings (₹ 35,000) = ₹ 1,25,000.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Total Planned: <strong className="text-white">{formatINR(totalPlannedExpense)}</strong></span>
            <span>Total Actual: <strong className="text-rose-400">{formatINR(totalExpense)}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Expense Category</th>
                <th className="py-2.5 px-3 text-right">Planned Budget</th>
                <th className="py-2.5 px-3 text-right">Actual Spent</th>
                <th className="py-2.5 px-3 text-right">Remaining Cap</th>
                <th className="py-2.5 px-3">Utilization &amp; Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {plannedVsActual.map((item) => (
                <tr key={item.categoryId} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {item.categoryName}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                    {formatINR(item.planned)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-300 font-semibold tabular-nums">
                    {formatINR(item.actual)}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-semibold tabular-nums ${
                    item.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {formatINR(item.remaining)}
                  </td>
                  <td className="py-2.5 px-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.status === 'OVER_BUDGET'
                              ? 'bg-rose-500'
                              : item.status === 'WARNING'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(item.usagePct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-semibold tabular-nums ${
                        item.status === 'OVER_BUDGET'
                          ? 'text-rose-400'
                          : item.status === 'WARNING'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}>
                        {item.usagePct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Category Share & Daily Cash Flow Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Share List with SVG Bars */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-white">Category-Wise Actual Expenses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by total actual expenditure in INR.</p>
          </div>

          <div className="space-y-2.5 pt-1">
            {categorySpendingReport.map((c) => (
              <div key={c.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 truncate">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold tabular-nums">{formatINR(c.spent)}</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">({c.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Cash Flow Timeline Chart */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Outflow Velocity (October 2026)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily recorded expense spikes (Rent, Festive Shopping, Outings).</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">11 Transactions</span>
          </div>

          {/* SVG Bar Timeline Chart */}
          <div className="pt-2">
            <div className="h-44 flex items-end gap-2 pb-6 pt-2 border-b border-slate-800">
              {dailyTrend.map((d) => {
                const maxAmount = 30000;
                const heightPct = Math.max((d.amount / maxAmount) * 100, 10);
                const dayLabel = d.date.split('-')[2];

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-mono p-1.5 rounded border border-slate-800 whitespace-nowrap z-10 pointer-events-none shadow-lg">
                      {d.date}: {formatINR(d.amount)}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${
                        d.amount >= 20000
                          ? 'bg-rose-500 hover:bg-rose-400'
                          : d.amount >= 5000
                          ? 'bg-amber-400 hover:bg-amber-300'
                          : 'bg-emerald-400 hover:bg-emerald-300'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 absolute -bottom-5">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-3">
              <span>Oct 01 (Month Start)</span>
              <span>Oct 15 (Current Date)</span>
              <span>Oct 31 (Month End)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals & Contributions Milestone Tracker */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Savings Goals Milestones (Indian Rupee Targets)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Goal contributions represent internal transfers to savings milestones. They do NOT reduce monthly actual savings.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">2 Active Goals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_SAVINGS_GOALS.map((goal) => {
            const pct = (goal.current_amount / goal.target_amount) * 100;
            const contribs = SAMPLE_SAVINGS_CONTRIBUTIONS.filter(
              (c) => c.savings_goal_id === goal.id
            );

            return (
              <div key={goal.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{goal.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Target Date: {goal.target_date || 'No deadline'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {goal.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Accumulated</span>
                    <span className="text-white font-bold tabular-nums">
                      {formatINR(goal.current_amount)} / {formatINR(goal.target_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                    <span>{pct.toFixed(1)}% Completed</span>
                    <span>Remaining: {formatINR(goal.target_amount - goal.current_amount)}</span>
                  </div>
                </div>

                {/* Contribution History Preview */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Recent Contribution Logs ({contribs.length}):
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {contribs.map((c) => (
                      <div
                        key={c.id}
                        className="text-[11px] font-mono text-slate-400 flex items-center justify-between py-0.5"
                      >
                        <span className="truncate pr-2">{c.contribution_date} · {c.description}</span>
                        <span className="text-emerald-400 font-semibold shrink-0">
                          +{formatINR(c.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
