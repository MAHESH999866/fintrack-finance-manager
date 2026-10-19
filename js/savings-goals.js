/**
 * FinTrack — Savings Goals & Milestone Tracking Controller
 * Indian Rupee targets, individual contribution logs, and progress indicators
 */

let allGoals = [];
let activeGoalForContribution = null;

document.addEventListener('DOMContentLoaded', () => {
  initSavingsGoalsPage();
});

async function initSavingsGoalsPage() {
  allGoals = await window.ftApi.getSavingsGoals();
  renderGoalsGrid();
  setupAddGoalForm();
  setupContributionForm();
}

function renderGoalsGrid() {
  const container = document.getElementById('savingsGoalsContainer');
  if (!container) return;

  if (allGoals.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <i class="bi bi-piggy-bank fs-1 text-secondary mb-2"></i>
        <h5>No Savings Goals Created</h5>
        <p class="text-sm">Create your first milestone target (e.g. 6-Month Safety Net, Higher Education, Diwali Gold).</p>
        <button class="btn btn-ft-primary" onclick="openAddGoalModal()">Create Savings Goal</button>
      </div>
    `;
    return;
  }

  // Summary Metrics
  const totalTarget = allGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalAccumulated = allGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalPending = totalTarget - totalAccumulated;
  const overallPct = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

  document.getElementById('goalsTotalTarget').textContent = window.FT_UI.formatINR(totalTarget);
  document.getElementById('goalsTotalAccumulated').textContent = window.FT_UI.formatINR(totalAccumulated);
  document.getElementById('goalsTotalPending').textContent = window.FT_UI.formatINR(totalPending);
  document.getElementById('goalsOverallPct').textContent = `${overallPct.toFixed(1)}%`;

  container.innerHTML = allGoals.map(g => {
    const pct = (g.currentAmount / g.targetAmount) * 100;
    const remaining = g.targetAmount - g.currentAmount;
    const contribs = window.FT_STORAGE?.getSavingsContributions(g.id) || [];

    return `
      <div class="col-12 col-md-6 col-lg-6 mb-4">
        <div class="card-ft h-100">
          <div class="card-ft-header">
            <div>
              <h4 class="card-ft-title">${g.name}</h4>
              <span class="text-muted font-mono text-xs">Target Date: ${g.targetDate ? window.FT_UI.formatDate(g.targetDate) : 'Open-ended'}</span>
            </div>
            <span class="badge-ft ${g.status === 'COMPLETED' ? 'badge-ft-income' : 'badge-ft-neutral'} font-mono">
              ${g.status}
            </span>
          </div>
          <div class="card-ft-body">
            <div class="d-flex justify-content-between align-items-center mb-1 text-xs">
              <span class="text-secondary">Accumulated Amount</span>
              <span class="fw-bold font-mono text-dark">${window.FT_UI.formatINR(g.currentAmount)} / ${window.FT_UI.formatINR(g.targetAmount)}</span>
            </div>

            <!-- Progress Bar -->
            <div class="progress mb-2" style="height: 10px;">
              <div 
                class="progress-bar bg-primary" 
                role="progressbar" 
                style="width: ${Math.min(pct, 100)}%" 
                aria-valuenow="${pct}" 
                aria-valuemin="0" 
                aria-valuemax="100">
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center text-xs text-muted font-mono mb-3">
              <span class="text-primary fw-semibold">${pct.toFixed(1)}% Funded</span>
              <span>Pending: ${window.FT_UI.formatINR(Math.max(remaining, 0))}</span>
            </div>

            <div class="border-top pt-2">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-xs fw-semibold text-secondary">Recent Contributions (${contribs.length})</span>
                <button class="btn btn-sm btn-ft-outline py-1 px-2 text-xs" onclick="openContributionModal(${g.id})">
                  <i class="bi bi-plus-circle me-1 text-primary"></i> Add Deposit
                </button>
              </div>

              <div class="space-y-1" style="max-height: 110px; overflow-y: auto;">
                ${contribs.slice(-3).reverse().map(c => `
                  <div class="d-flex justify-content-between align-items-center text-xs font-mono py-1 border-bottom border-light">
                    <span class="text-truncate text-muted pe-2">${window.FT_UI.formatDate(c.contributionDate)} · ${c.description || 'Milestone Deposit'}</span>
                    <span class="text-success fw-semibold shrink-0">+${window.FT_UI.formatINR(c.amount)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openAddGoalModal = function() {
  document.getElementById('addGoalForm').reset();
  if (window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(document.getElementById('addGoalModal'));
    modal.show();
  }
};

window.openContributionModal = function(goalId) {
  activeGoalForContribution = allGoals.find(g => g.id === Number(goalId));
  if (!activeGoalForContribution) return;

  document.getElementById('contribGoalName').textContent = activeGoalForContribution.name;
  document.getElementById('contribForm').reset();
  document.getElementById('contribDate').value = '2026-10-16';

  if (window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(document.getElementById('contributionModal'));
    modal.show();
  }
};

function setupAddGoalForm() {
  const form = document.getElementById('addGoalForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const date = document.getElementById('goalTargetDate').value;

    if (!name || isNaN(target) || target <= 0) {
      window.FT_UI?.showToast('Please enter a valid goal name and target amount in INR.', 'warning');
      return;
    }

    const newGoal = {
      name,
      targetAmount: target,
      currentAmount: 0,
      targetDate: date || null,
      status: 'ACTIVE'
    };

    try {
      await window.ftApi.createSavingsGoal(newGoal);
      window.FT_UI?.showToast(`Savings goal "${name}" created!`, 'success');

      const modalEl = document.getElementById('addGoalModal');
      if (window.bootstrap?.Modal) {
        const bsModal = window.bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }

      await initSavingsGoalsPage();
    } catch (err) {
      window.FT_UI?.showToast('Failed to create goal: ' + err.message, 'error');
    }
  });
}

function setupContributionForm() {
  const form = document.getElementById('contribForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeGoalForContribution) return;

    const amount = parseFloat(document.getElementById('contribAmount').value);
    const date = document.getElementById('contribDate').value;
    const desc = document.getElementById('contribDesc').value.trim() || 'Milestone transfer';

    if (isNaN(amount) || amount <= 0) {
      window.FT_UI?.showToast('Please enter a valid contribution amount in INR.', 'warning');
      return;
    }

    try {
      await window.ftApi.addSavingsContribution(
        activeGoalForContribution.id,
        amount,
        desc,
        date
      );

      window.FT_UI?.showToast(`Deposited ${window.FT_UI.formatINR(amount)} toward ${activeGoalForContribution.name}!`, 'success');

      const modalEl = document.getElementById('contributionModal');
      if (window.bootstrap?.Modal) {
        const bsModal = window.bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
      }

      await initSavingsGoalsPage();
    } catch (err) {
      window.FT_UI?.showToast('Failed to record contribution: ' + err.message, 'error');
    }
  });
}
