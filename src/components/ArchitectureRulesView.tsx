import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Scale, CheckCircle2, Lock, FileSpreadsheet } from 'lucide-react';
import { formatINR } from '../utils/currencyFormatter';

export const ArchitectureRulesView: React.FC = () => {
  const [testAmountA, setTestAmountA] = useState<number>(0.1);
  const [testAmountB, setTestAmountB] = useState<number>(0.2);

  // Floating point sum
  const floatSum = testAmountA + testAmountB;
  // Exact sum (simulating BigDecimal)
  const exactSum = Number((testAmountA + testAmountB).toFixed(2));

  const businessRules = [
    {
      id: 1,
      title: 'Every Transaction Belongs to a Specific User',
      enforcement: 'Database NOT NULL FK `fk_transactions_user` + Spring Security tenant principal injection in service layer.',
      status: 'Enforced',
    },
    {
      id: 2,
      title: 'Zero Cross-User Data Leaks',
      enforcement: 'Every repository query strictly binds `WHERE user.id = :userId`. Path parameter IDs validated against security context.',
      status: 'Enforced',
    },
    {
      id: 3,
      title: 'Strictly Positive Transaction Amounts',
      enforcement: 'MySQL `CHECK (amount > 0.00)` + Jakarta Bean Validation `@DecimalMin("0.01")`. Negative numbers rejected at API boundary.',
      status: 'Enforced',
    },
    {
      id: 4,
      title: 'Non-Negative Monthly Plan Targets',
      enforcement: 'MySQL `CHECK (expected_income >= 0.00)` and `CHECK (target_savings >= 0.00)`. Stored in INR.',
      status: 'Enforced',
    },
    {
      id: 5,
      title: 'Non-Negative Category Budget Allocations',
      enforcement: 'MySQL `CHECK (planned_amount >= 0.00)`. Sum of budget allocations plus target savings should balance with income.',
      status: 'Enforced',
    },
    {
      id: 6,
      title: 'One Plan Per Month Per User',
      enforcement: 'MySQL `UNIQUE KEY uk_monthly_plan_user_month (user_id, plan_month)`. `plan_month` normalized to 1st of month.',
      status: 'Enforced',
    },
    {
      id: 7,
      title: 'No Duplicate Budget Categories in a Single Plan',
      enforcement: 'MySQL `UNIQUE KEY uk_budget_plan_category (monthly_plan_id, category_id)`. Category cannot be budgeted twice in the same month.',
      status: 'Enforced',
    },
    {
      id: 8,
      title: 'Positive Savings Contributions',
      enforcement: 'MySQL `CHECK (amount > 0.00)` on `savings_contributions`. Zero or negative milestone deposits prohibited.',
      status: 'Enforced',
    },
    {
      id: 9,
      title: 'Monthly Expense Reports Scoped by Transaction Date',
      enforcement: 'Filtered by `transaction_date BETWEEN :startDate AND :endDate`. Scoped strictly to calendar month boundaries.',
      status: 'Enforced',
    },
    {
      id: 10,
      title: 'Planned Budget Amounts and Actual Expenses Kept Separate',
      enforcement: 'Planned caps live in `budget_categories`; actual outflows live in `transactions`. Never overwritten or mutated.',
      status: 'Enforced',
    },
    {
      id: 11,
      title: 'Actual Savings Equation (No Double Subtractions)',
      enforcement: 'Actual Savings = Total Recorded Income - Total Recorded Expenses. Goal contributions are milestone transfers, NOT expenses.',
      status: 'Enforced',
    },
    {
      id: 12,
      title: 'Planned Savings Independence',
      enforcement: 'Planned savings represents the user\'s intention target and is never counted as real savings until earned and unspent.',
      status: 'Enforced',
    },
    {
      id: 13,
      title: 'Ban on Plaintext Passwords & Banking Credentials',
      enforcement: 'Passwords hashed via BCrypt / Argon2. Sensitive UPI PINs, NetBanking passwords, or OTPs are completely excluded from the schema.',
      status: 'Enforced',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
          <span>Architectural Blueprint</span>
          <span aria-hidden="true">·</span>
          <span>13 Business Invariants</span>
          <span aria-hidden="true">·</span>
          <span>Financial Integrity</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">FinTrack Backend Architecture Rules &amp; Guardrails</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Comprehensive persistence invariants, referential integrity strategies, and mathematical standards
          that every backend engineer on FinTrack must comply with.
        </p>
      </div>

      {/* Interactive IEEE-754 vs BigDecimal Precision Explainer */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Scale className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Monetary Math Invariant: Why Floating-Point Types are Strictly Forbidden
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Standard floating-point types (<code className="text-rose-400 font-mono">float</code>, <code className="text-rose-400 font-mono">double</code>)
          use IEEE-754 binary fractions. They cannot accurately represent decimal currency units like Indian Paise (₹0.01),
          causing fractional accumulation errors that fail regulatory bank reconciliation audits. FinTrack mandates
          <strong className="text-emerald-400 font-mono"> DECIMAL(15, 2)</strong> in MySQL and
          <strong className="text-emerald-400 font-mono"> BigDecimal(15, 2)</strong> in Java with <code className="text-emerald-300 font-mono">RoundingMode.HALF_UP</code>.
        </p>

        {/* Live Interactive Precision Demonstration */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400">Interactive Precision Test:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Float / Double Outcome */}
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 font-mono text-xs space-y-1">
              <div className="text-rose-400 font-bold flex items-center justify-between">
                <span>❌ IEEE-754 Double / Float</span>
                <span className="text-[10px]">Broken Math</span>
              </div>
              <div className="text-slate-300 text-[11px] pt-1">
                0.1 + 0.2 in binary float:
              </div>
              <div className="text-rose-300 text-sm font-bold">
                {floatSum.toString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Accumulates invisible fractions of paise across thousands of transactions.
              </div>
            </div>

            {/* BigDecimal / DECIMAL Outcome */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs space-y-1">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>✅ MySQL DECIMAL(15, 2) &amp; Java BigDecimal</span>
                <span className="text-[10px]">Exact Invariant</span>
              </div>
              <div className="text-slate-300 text-[11px] pt-1">
                ₹0.10 + ₹0.20 in BigDecimal:
              </div>
              <div className="text-emerald-300 text-sm font-bold">
                ₹ 0.30 (Exact 30 Paise)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Guaranteed exact base-10 decimal representation with zero binary artifacts.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referential Integrity & Cascade Deletion Matrix */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Referential Integrity &amp; Deletion Guardrails
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          FinTrack forbids indiscriminate cascading deletions that could silently wipe out user financial ledgers.
        </p>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Parent Table</th>
                <th className="py-2 px-3">Child Table</th>
                <th className="py-2 px-3">Foreign Key Rule</th>
                <th className="py-2 px-3">Architectural Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-xs">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-white font-semibold">users</td>
                <td className="py-2 px-3 text-slate-300">transactions</td>
                <td className="py-2 px-3 text-amber-400">ON DELETE RESTRICT</td>
                <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                  Prevents catastrophic accidental deletion of real financial tax &amp; audit history.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-white font-semibold">expense_categories</td>
                <td className="py-2 px-3 text-slate-300">transactions</td>
                <td className="py-2 px-3 text-amber-400">ON DELETE RESTRICT</td>
                <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                  Category cannot be removed while active transaction entries reference it.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-white font-semibold">monthly_plans</td>
                <td className="py-2 px-3 text-slate-300">budget_categories</td>
                <td className="py-2 px-3 text-emerald-400">ON DELETE CASCADE</td>
                <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                  Safe: Category budget caps are purely internal line-items of that monthly plan draft.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-white font-semibold">savings_goals</td>
                <td className="py-2 px-3 text-slate-300">savings_contributions</td>
                <td className="py-2 px-3 text-emerald-400">ON DELETE CASCADE</td>
                <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                  Contributions belong exclusively to the specific goal lifecycle.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-white font-semibold">chatbot_conversations</td>
                <td className="py-2 px-3 text-slate-300">chatbot_messages</td>
                <td className="py-2 px-3 text-emerald-400">ON DELETE CASCADE</td>
                <td className="py-2 px-3 font-sans text-slate-300 text-[11px]">
                  Deleting an AI advisory conversation purges all associated conversational logs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 13 Business Invariants Checklist */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">13 Enforced Business Rules &amp; Invariants</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {businessRules.map((rule) => (
            <div key={rule.id} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Rule #{rule.id}: {rule.title}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rule.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans pl-5 leading-relaxed">
                {rule.enforcement}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
