/**
 * FinTrack — Budgets Page Controller
 * Category-specific spending caps vs recorded outflows with utilization warnings
 */

document.addEventListener('DOMContentLoaded', () => {
  initBudgetsPage();
});

async function initBudgetsPage() {
  const currentMonth = '2026-10';
  const plan = await window.ftApi.getMonthlyPlan(currentMonth);
  const transactions = await window.ftApi.getTransactions();

  const monthTx = transactions.filter(t => t.transactionDate.startsWith(currentMonth));
  const categorySpentMap = {};
  monthTx.filter(t => t.transactionType === 'EXPENSE').forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
  });

  const budgets = plan?.budgets || [];
  const totalPlanned = budgets.reduce((s, b) => s + b.plannedAmount, 0);
  const totalSpent = Object.values(categorySpentMap).reduce((s, a) => s + a, 0);
  const totalRemaining = totalPlanned - totalSpent;

  // Overview Stats
  document.getElementById('budgetTotalPlanned').textContent = window.FT_UI.formatINR(totalPlanned);
  document.getElementById('budgetTotalSpent').textContent = window.FT_UI.formatINR(totalSpent);
  document.getElementById('budgetTotalRemaining').textContent = window.FT_UI.formatINR(totalRemaining);
  document.getElementById('budgetOverallPct').textContent = `${((totalSpent / (totalPlanned || 1)) * 100).toFixed(1)}%`;

  renderBudgetCards(budgets, categorySpentMap);
}

function renderBudgetCards(budgets, categorySpentMap) {
  const container = document.getElementById('budgetCardsContainer');
  if (!container) return;

  if (budgets.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-wallet2 fs-1 text-secondary mb-2"></i>
        <h5>No Budget Plan Active</h5>
        <p class="text-sm">Create a monthly financial plan to allocate spending limits across categories.</p>
        <a href="monthly-plan.html" class="btn btn-ft-primary">Set Monthly Plan</a>
      </div>
    `;
    return;
  }

  container.innerHTML = budgets.map(b => {
    const catName = window.FT_UI.getCategoryName(b.categoryId);
    const spent = categorySpentMap[b.categoryId] || 0;
    const remaining = b.plannedAmount - spent;
    const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;

    let statusCls = 'bg-success';
    let badgeHtml = '<span class="badge-ft badge-ft-income">Under Budget</span>';

    if (pct >= 100) {
      statusCls = 'bg-danger';
      badgeHtml = '<span class="badge-ft badge-ft-expense">Exceeded Cap</span>';
    } else if (pct >= 80) {
      statusCls = 'bg-warning';
      badgeHtml = '<span class="badge-ft badge-ft-warning">Approaching Cap</span>';
    }

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card-ft h-100">
          <div class="card-ft-header">
            <div>
              <h4 class="card-ft-title">${catName}</h4>
              <span class="text-muted font-mono text-xs">Cap: ${window.FT_UI.formatINR(b.plannedAmount)}</span>
            </div>
            ${badgeHtml}
          </div>
          <div class="card-ft-body">
            <div class="d-flex justify-content-between align-items-center mb-1 text-xs">
              <span class="text-secondary">Actual Spent</span>
              <span class="fw-bold font-mono ${pct >= 100 ? 'text-danger' : 'text-dark'}">${window.FT_UI.formatINR(spent)}</span>
            </div>

            <!-- Progress Bar -->
            <div class="progress mb-2" style="height: 8px;">
              <div 
                class="progress-bar ${statusCls}" 
                role="progressbar" 
                style="width: ${Math.min(pct, 100)}%" 
                aria-valuenow="${pct}" 
                aria-valuemin="0" 
                aria-valuemax="100">
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center text-xs text-muted font-mono pt-1">
              <span>${pct.toFixed(0)}% Utilized</span>
              <span class="${remaining < 0 ? 'text-danger fw-bold' : ''}">
                ${remaining >= 0 ? `Remaining: ${window.FT_UI.formatCompactINR(remaining)}` : `Over by ${window.FT_UI.formatINR(Math.abs(remaining))}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
