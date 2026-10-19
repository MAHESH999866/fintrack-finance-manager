/**
 * FinTrack — Dashboard Page Controller
 * Renders consistent monthly financial health metrics in Indian Rupees (INR)
 */

let incomeExpenseChartInstance = null;
let categoryDoughnutChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
  window.refreshPageData = loadDashboardData;
});

async function loadDashboardData() {
  const currentMonth = '2026-10'; // October 2026
  
  // 1. Fetch transactions, plans, and goals
  const transactions = await window.ftApi.getTransactions();
  const plan = await window.ftApi.getMonthlyPlan(currentMonth);
  const goals = await window.ftApi.getSavingsGoals();

  const monthTx = transactions.filter(t => t.transactionDate.startsWith(currentMonth));

  // 2. Compute Real Aggregates
  const totalRecordedIncome = monthTx
    .filter(t => t.transactionType === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const totalRecordedExpense = monthTx
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  // Strict Accounting Invariant: Actual Savings = Recorded Income - Recorded Expenses
  const actualSavings = totalRecordedIncome - totalRecordedExpense;
  const savingsRate = totalRecordedIncome > 0 ? (actualSavings / totalRecordedIncome) * 100 : 0;

  // Planned values
  const expectedIncome = plan ? plan.expectedIncome : 0;
  const targetSavings = plan ? plan.targetSavings : 0;
  const totalPlannedExpense = plan ? (plan.budgets || []).reduce((s, b) => s + b.plannedAmount, 0) : 0;
  const remainingBudget = totalPlannedExpense - totalRecordedExpense;
  const budgetUtilization = totalPlannedExpense > 0 ? (totalRecordedExpense / totalPlannedExpense) * 100 : 0;

  // 3. Update Stat Summary Cards in DOM
  document.getElementById('dashIncomeVal').textContent = window.FT_UI.formatINR(totalRecordedIncome);
  document.getElementById('dashIncomeMeta').textContent = `Plan Target: ${window.FT_UI.formatCompactINR(expectedIncome)}`;

  document.getElementById('dashExpenseVal').textContent = window.FT_UI.formatINR(totalRecordedExpense);
  document.getElementById('dashExpenseMeta').textContent = `${budgetUtilization.toFixed(1)}% of ₹${window.FT_UI.formatCompactINR(totalPlannedExpense)} Budget`;

  document.getElementById('dashActualSavingsVal').textContent = window.FT_UI.formatINR(actualSavings);
  document.getElementById('dashSavingsRateMeta').textContent = `${savingsRate.toFixed(1)}% of Total Income`;

  document.getElementById('dashRemainingBudgetVal').textContent = window.FT_UI.formatINR(remainingBudget);
  const remainingBadge = document.getElementById('dashRemainingBadge');
  if (remainingBadge) {
    if (remainingBudget < 0) {
      remainingBadge.className = 'badge-ft badge-ft-expense font-mono';
      remainingBadge.textContent = 'Over Budget';
    } else {
      remainingBadge.className = 'badge-ft badge-ft-income font-mono';
      remainingBadge.textContent = 'Within Budget';
    }
  }

  // Target Savings Progress Indicator
  const targetSavingsGoalVal = document.getElementById('dashTargetSavingsVal');
  if (targetSavingsGoalVal) {
    targetSavingsGoalVal.textContent = window.FT_UI.formatINR(targetSavings);
  }
  const targetSavingsPctEl = document.getElementById('dashTargetSavingsPct');
  if (targetSavingsPctEl) {
    const pctAchieved = targetSavings > 0 ? (actualSavings / targetSavings) * 100 : 0;
    targetSavingsPctEl.textContent = `${pctAchieved.toFixed(0)}% Achieved`;
    targetSavingsPctEl.className = pctAchieved >= 100 ? 'text-success font-semibold' : 'text-primary font-semibold';
  }

  // 4. Overspending Warnings & Alerts
  renderBudgetWarnings(plan, monthTx);

  // 5. Render Recent Transactions (Top 6)
  renderRecentTransactions(monthTx.slice(0, 6));

  // 6. Initialize / Update Chart.js Charts
  renderIncomeExpenseChart(totalRecordedIncome, totalRecordedExpense, actualSavings);
  renderCategoryBreakdownChart(monthTx);
}

function renderBudgetWarnings(plan, monthTx) {
  const container = document.getElementById('dashBudgetWarnings');
  if (!container) return;

  if (!plan || !plan.budgets || plan.budgets.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info py-2 px-3 text-xs mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle"></i>
        <span>No active monthly plan detected for October 2026. <a href="monthly-plan.html" class="alert-link">Create plan now</a></span>
      </div>
    `;
    return;
  }

  const categorySpentMap = {};
  monthTx.filter(t => t.transactionType === 'EXPENSE').forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
  });

  const alerts = [];
  plan.budgets.forEach(b => {
    const spent = categorySpentMap[b.categoryId] || 0;
    const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;
    const catName = window.FT_UI.getCategoryName(b.categoryId);

    if (pct >= 100) {
      alerts.push({
        type: 'danger',
        message: `<strong>Over Budget Alert:</strong> ${catName} spending of ${window.FT_UI.formatINR(spent)} has reached ${pct.toFixed(0)}% of your ₹${window.FT_UI.formatCompactINR(b.plannedAmount)} cap.`
      });
    } else if (pct >= 80) {
      alerts.push({
        type: 'warning',
        message: `<strong>Approaching Cap:</strong> ${catName} has used ${pct.toFixed(0)}% (${window.FT_UI.formatINR(spent)}) of your allocated ₹${window.FT_UI.formatCompactINR(b.plannedAmount)}.`
      });
    }
  });

  if (alerts.length === 0) {
    container.innerHTML = `
      <div class="p-2.5 rounded-3 bg-light border text-xs text-muted d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill text-success"></i>
        <span>All category budgets are currently operating within safe spending thresholds.</span>
      </div>
    `;
  } else {
    container.innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type === 'danger' ? 'danger' : 'warning'} py-2 px-3 text-xs mb-2 d-flex align-items-center gap-2">
        <i class="bi bi-${a.type === 'danger' ? 'exclamation-octagon-fill text-danger' : 'exclamation-triangle-fill text-warning'}"></i>
        <div>${a.message}</div>
      </div>
    `).join('');
  }
}

function renderRecentTransactions(transactions) {
  const tbody = document.getElementById('dashRecentTxBody');
  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No transactions recorded for this month.</td></tr>`;
    return;
  }

  tbody.innerHTML = transactions.map(t => {
    const isIncome = t.transactionType === 'INCOME';
    const amountClass = isIncome ? 'text-success' : 'text-danger';
    const prefix = isIncome ? '+' : '-';
    const catName = window.FT_UI.getCategoryName(t.categoryId);

    return `
      <tr>
        <td class="text-muted font-mono text-xs">${window.FT_UI.formatDate(t.transactionDate)}</td>
        <td class="fw-medium">${t.description}</td>
        <td><span class="badge bg-light text-secondary border font-sans text-xs">${catName}</span></td>
        <td>${window.FT_UI.getPaymentMethodBadge(t.paymentMethod)}</td>
        <td class="text-end fw-bold font-mono ${amountClass}">
          ${prefix}${window.FT_UI.formatINR(t.amount)}
        </td>
      </tr>
    `;
  }).join('');
}

function renderIncomeExpenseChart(income, expense, savings) {
  const ctx = document.getElementById('dashIncomeExpenseChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (incomeExpenseChartInstance) {
    incomeExpenseChartInstance.destroy();
  }

  incomeExpenseChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Income', 'Actual Expenses', 'Net Savings'],
      datasets: [{
        label: 'October 2026 (INR)',
        data: [income, expense, Math.max(savings, 0)],
        backgroundColor: [
          '#15803d', // Green for income
          '#b91c1c', // Red for expenses
          '#1e40af'  // Deep blue for savings
        ],
        borderRadius: 6,
        barThickness: 38
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Amount: ${window.FT_UI.formatINR(ctx.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => window.FT_UI.formatCompactINR(val),
            font: { family: 'Inter' }
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', weight: '500' } }
        }
      }
    }
  });
}

function renderCategoryBreakdownChart(monthTx) {
  const ctx = document.getElementById('dashCategoryDoughnut');
  if (!ctx || typeof Chart === 'undefined') return;

  if (categoryDoughnutChartInstance) {
    categoryDoughnutChartInstance.destroy();
  }

  const categorySpentMap = {};
  monthTx.filter(t => t.transactionType === 'EXPENSE').forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + t.amount;
  });

  const sortedCats = Object.entries(categorySpentMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 categories

  const labels = sortedCats.map(([id]) => window.FT_UI.getCategoryName(id));
  const data = sortedCats.map(([, val]) => val);

  categoryDoughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#1e40af', '#3b82f6', '#0ea5e9', '#14b8a6', '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 10, font: { size: 11, family: 'Inter' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${window.FT_UI.formatINR(ctx.raw)}`
          }
        }
      }
    }
  });
}
