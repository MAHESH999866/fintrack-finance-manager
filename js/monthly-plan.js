/**
 * FinTrack — Monthly Financial Plan Controller
 * Step-by-step financial budgeting wizard with live balance arithmetic
 */

document.addEventListener('DOMContentLoaded', () => {
  initMonthlyPlanPage();
});

const defaultCategoryBudgets = [
  { categoryId: 5, name: 'House Rent', amount: 30000 },
  { categoryId: 6, name: 'Food and Groceries', amount: 18000 },
  { categoryId: 7, name: 'Transport and Petrol', amount: 6000 },
  { categoryId: 8, name: 'Medicines and Healthcare', amount: 3000 },
  { categoryId: 9, name: 'Bills and Utilities', amount: 8000 },
  { categoryId: 10, name: 'Education', amount: 0 },
  { categoryId: 11, name: 'Weekend and Entertainment', amount: 10000 },
  { categoryId: 12, name: 'Shopping', amount: 12000 },
  { categoryId: 13, name: 'Family and Personal Expenses', amount: 3000 },
  { categoryId: 14, name: 'Other Expenses', amount: 0 }
];

async function initMonthlyPlanPage() {
  const currentMonth = '2026-10-01';
  let plan = await window.ftApi.getMonthlyPlan('2026-10');

  const incomeInput = document.getElementById('planExpectedIncome');
  const savingsInput = document.getElementById('planTargetSavings');
  const monthInput = document.getElementById('planMonthSelect');
  const notesInput = document.getElementById('planNotes');
  const form = document.getElementById('monthlyPlanForm');

  if (monthInput) monthInput.value = '2026-10';
  if (incomeInput) incomeInput.value = plan ? plan.expectedIncome : 125000;
  if (savingsInput) savingsInput.value = plan ? plan.targetSavings : 35000;
  if (notesInput && plan?.notes) notesInput.value = plan.notes;

  // Render Category Budget input rows
  renderBudgetRows(plan ? plan.budgets : null);

  // Attach live calculation listeners
  if (incomeInput) incomeInput.addEventListener('input', updateLiveSummary);
  if (savingsInput) savingsInput.addEventListener('input', updateLiveSummary);

  updateLiveSummary();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSavePlan();
    });
  }
}

function renderBudgetRows(savedBudgets) {
  const container = document.getElementById('planCategoriesContainer');
  if (!container) return;

  const budgetMap = {};
  if (savedBudgets) {
    savedBudgets.forEach(b => budgetMap[b.categoryId] = b.plannedAmount);
  }

  container.innerHTML = defaultCategoryBudgets.map(cat => {
    const val = budgetMap[cat.categoryId] !== undefined ? budgetMap[cat.categoryId] : cat.amount;
    return `
      <div class="col-12 col-md-6 mb-3">
        <label class="form-label text-xs fw-semibold text-secondary mb-1 d-flex justify-content-between">
          <span>${cat.name}</span>
          <span class="text-muted font-mono" id="label_cat_${cat.categoryId}">${window.FT_UI.formatINR(val)}</span>
        </label>
        <div class="input-group">
          <span class="input-group-text bg-light border text-muted">₹</span>
          <input 
            type="number" 
            step="100" 
            min="0"
            data-category-id="${cat.categoryId}"
            class="form-control form-control-ft budget-category-input"
            value="${val}"
          />
        </div>
      </div>
    `;
  }).join('');

  // Attach input listener to each budget input
  const inputs = container.querySelectorAll('.budget-category-input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const catId = e.target.getAttribute('data-category-id');
      const label = document.getElementById(`label_cat_${catId}`);
      if (label) {
        label.textContent = window.FT_UI.formatINR(parseFloat(e.target.value) || 0);
      }
      updateLiveSummary();
    });
  });
}

function updateLiveSummary() {
  const income = parseFloat(document.getElementById('planExpectedIncome')?.value) || 0;
  const savings = parseFloat(document.getElementById('planTargetSavings')?.value) || 0;

  let totalExpenses = 0;
  const inputs = document.querySelectorAll('.budget-category-input');
  inputs.forEach(input => {
    totalExpenses += parseFloat(input.value) || 0;
  });

  const totalAllocated = totalExpenses + savings;
  const remaining = income - totalAllocated;
  const savingsPct = income > 0 ? (savings / income) * 100 : 0;
  const expensePct = income > 0 ? (totalExpenses / income) * 100 : 0;

  // DOM Updates
  document.getElementById('summaryIncome').textContent = window.FT_UI.formatINR(income);
  document.getElementById('summaryTargetSavings').textContent = window.FT_UI.formatINR(savings);
  document.getElementById('summaryTargetSavingsPct').textContent = `${savingsPct.toFixed(1)}% of Income`;
  document.getElementById('summaryPlannedExpenses').textContent = window.FT_UI.formatINR(totalExpenses);
  document.getElementById('summaryPlannedExpensesPct').textContent = `${expensePct.toFixed(1)}% of Income`;

  const remainingEl = document.getElementById('summaryRemaining');
  const alertContainer = document.getElementById('planOverAllocationAlert');

  if (remainingEl) {
    remainingEl.textContent = window.FT_UI.formatINR(remaining);
    if (remaining < 0) {
      remainingEl.className = 'fw-bold text-danger font-mono';
    } else {
      remainingEl.className = 'fw-bold text-success font-mono';
    }
  }

  // Warning if total allocations exceed expected income
  if (alertContainer) {
    if (remaining < 0) {
      alertContainer.innerHTML = `
        <div class="alert alert-danger py-2 px-3 text-xs mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill text-danger fs-6"></i>
          <div>
            <strong>Warning: Budget Over-Allocation!</strong> You have planned ${window.FT_UI.formatINR(totalAllocated)}, 
            which exceeds expected income by <strong class="text-danger">${window.FT_UI.formatINR(Math.abs(remaining))}</strong>. 
            Adjust category expenses or target savings before saving.
          </div>
        </div>
      `;
    } else if (remaining > 0) {
      alertContainer.innerHTML = `
        <div class="alert alert-info py-2 px-3 text-xs mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-info-circle-fill text-info fs-6"></i>
          <div>
            You have an unallocated surplus of <strong>${window.FT_UI.formatINR(remaining)}</strong>. You can route this towards your savings goals or festival fund.
          </div>
        </div>
      `;
    } else {
      alertContainer.innerHTML = `
        <div class="alert alert-success py-2 px-3 text-xs mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-check-circle-fill text-success fs-6"></i>
          <div>
            <strong>Balanced Budget!</strong> 100% of your ₹${window.FT_UI.formatCompactINR(income)} income is allocated across savings and expenses.
          </div>
        </div>
      `;
    }
  }
}

async function handleSavePlan() {
  const income = parseFloat(document.getElementById('planExpectedIncome').value);
  const savings = parseFloat(document.getElementById('planTargetSavings').value);
  const notes = document.getElementById('planNotes')?.value.trim() || '';

  if (isNaN(income) || income <= 0) {
    window.FT_UI?.showToast('Please enter a valid expected monthly income in INR.', 'warning');
    return;
  }

  const budgets = [];
  document.querySelectorAll('.budget-category-input').forEach(input => {
    budgets.push({
      categoryId: parseInt(input.getAttribute('data-category-id')),
      plannedAmount: parseFloat(input.value) || 0
    });
  });

  const planPayload = {
    userId: 101,
    planMonth: '2026-10-01',
    expectedIncome: income,
    targetSavings: savings,
    currencyCode: 'INR',
    notes: notes,
    budgets: budgets
  };

  try {
    await window.ftApi.saveMonthlyPlan(planPayload);
    window.FT_UI?.showToast('Monthly financial plan saved successfully!', 'success');
  } catch (err) {
    window.FT_UI?.showToast('Failed to save monthly plan: ' + err.message, 'error');
  }
}
