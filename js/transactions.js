/**
 * FinTrack — Transactions Page Controller
 * Search, filter, pagination, add/edit/delete manual financial cash flows in INR
 */

let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const pageSize = 8;
let editingTxId = null;

document.addEventListener('DOMContentLoaded', () => {
  initTransactionsPage();
  window.refreshPageData = initTransactionsPage;
});

async function initTransactionsPage() {
  allTransactions = await window.ftApi.getTransactions();
  setupFilterListeners();
  populateCategoryDropdownFilter();
  applyFilters();
  setupFormSubmitListener();
}

function populateCategoryDropdownFilter() {
  const catFilter = document.getElementById('txFilterCategory');
  if (!catFilter || !window.FT_CONFIG) return;

  const cats = window.FT_CONFIG.SYSTEM_CATEGORIES;
  catFilter.innerHTML = '<option value="">All Categories</option>' + 
    cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function setupFilterListeners() {
  const searchInput = document.getElementById('txSearch');
  const typeFilter = document.getElementById('txFilterType');
  const catFilter = document.getElementById('txFilterCategory');
  const methodFilter = document.getElementById('txFilterMethod');
  const dateFrom = document.getElementById('txDateFrom');
  const dateTo = document.getElementById('txDateTo');
  const resetBtn = document.getElementById('txResetFiltersBtn');

  const onFilterChange = () => {
    currentPage = 1;
    applyFilters();
  };

  if (searchInput) searchInput.addEventListener('input', onFilterChange);
  if (typeFilter) typeFilter.addEventListener('change', onFilterChange);
  if (catFilter) catFilter.addEventListener('change', onFilterChange);
  if (methodFilter) methodFilter.addEventListener('change', onFilterChange);
  if (dateFrom) dateFrom.addEventListener('change', onFilterChange);
  if (dateTo) dateTo.addEventListener('change', onFilterChange);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = '';
      if (catFilter) catFilter.value = '';
      if (methodFilter) methodFilter.value = '';
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';
      applyFilters();
    });
  }
}

function applyFilters() {
  const query = document.getElementById('txSearch')?.value.toLowerCase().trim() || '';
  const type = document.getElementById('txFilterType')?.value || '';
  const catId = document.getElementById('txFilterCategory')?.value || '';
  const method = document.getElementById('txFilterMethod')?.value || '';
  const from = document.getElementById('txDateFrom')?.value || '';
  const to = document.getElementById('txDateTo')?.value || '';

  filteredTransactions = allTransactions.filter(t => {
    if (query && !t.description.toLowerCase().includes(query)) return false;
    if (type && t.transactionType !== type) return false;
    if (catId && t.categoryId !== parseInt(catId)) return false;
    if (method && t.paymentMethod !== method) return false;
    if (from && t.transactionDate < from) return false;
    if (to && t.transactionDate > to) return false;
    return true;
  });

  renderTable();
  renderPagination();
}

function renderTable() {
  const tbody = document.getElementById('transactionsTableBody');
  const countEl = document.getElementById('txTotalCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? '' : 's'}`;

  if (filteredTransactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-2 d-block text-secondary mb-2"></i>
          <div>No transactions found matching your criteria.</div>
          <button class="btn btn-sm btn-ft-outline mt-2" onclick="openAddTransactionModal()">Record First Transaction</button>
        </td>
      </tr>
    `;
    return;
  }

  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filteredTransactions.slice(startIdx, startIdx + pageSize);

  tbody.innerHTML = pageItems.map(t => {
    const isIncome = t.transactionType === 'INCOME';
    const amountClass = isIncome ? 'text-success' : 'text-danger';
    const prefix = isIncome ? '+' : '-';
    const catName = window.FT_UI.getCategoryName(t.categoryId);

    return `
      <tr>
        <td class="font-mono text-xs text-muted">${window.FT_UI.formatDate(t.transactionDate)}</td>
        <td class="fw-medium">
          <div>${t.description}</div>
          ${t.notes ? `<div class="text-[11px] text-muted font-sans">${t.notes}</div>` : ''}
        </td>
        <td><span class="badge bg-light text-secondary border font-sans text-xs">${catName}</span></td>
        <td>
          <span class="badge-ft ${isIncome ? 'badge-ft-income' : 'badge-ft-expense'}">
            ${t.transactionType}
          </span>
        </td>
        <td>${window.FT_UI.getPaymentMethodBadge(t.paymentMethod)}</td>
        <td class="text-end fw-bold font-mono ${amountClass}">
          ${prefix}${window.FT_UI.formatINR(t.amount)}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-link text-secondary p-1" onclick="openEditTransactionModal(${t.id})" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteTransaction(${t.id})" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderPagination() {
  const paginationContainer = document.getElementById('txPagination');
  if (!paginationContainer) return;

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = `<ul class="pagination pagination-sm mb-0">`;
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${currentPage - 1})">&laquo;</button>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${currentPage === i ? 'active' : ''}">
        <button class="page-link" onclick="goToPage(${i})">${i}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" onclick="goToPage(${currentPage + 1})">&raquo;</button>
    </li>
  </ul>`;

  paginationContainer.innerHTML = html;
}

window.goToPage = function(page) {
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
    renderPagination();
  }
};

window.openAddTransactionModal = function() {
  editingTxId = null;
  document.getElementById('txModalTitle').textContent = 'Record Financial Transaction';
  document.getElementById('txForm').reset();
  document.getElementById('txDate').value = '2026-10-16';
  populateModalCategories('EXPENSE');

  if (window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
  }
};

window.openEditTransactionModal = function(id) {
  const tx = allTransactions.find(t => t.id === Number(id));
  if (!tx) return;

  editingTxId = tx.id;
  document.getElementById('txModalTitle').textContent = 'Edit Transaction #' + tx.id;
  document.getElementById('txDescription').value = tx.description;
  document.getElementById('txAmount').value = tx.amount;
  document.getElementById('txType').value = tx.transactionType;
  document.getElementById('txDate').value = tx.transactionDate;
  document.getElementById('txPaymentMethod').value = tx.paymentMethod;
  if (document.getElementById('txNotes')) document.getElementById('txNotes').value = tx.notes || '';

  populateModalCategories(tx.transactionType, tx.categoryId);

  if (window.bootstrap?.Modal) {
    const modal = new window.bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
  }
};

function populateModalCategories(type, selectedCatId) {
  const select = document.getElementById('txCategory');
  if (!select || !window.FT_CONFIG) return;

  const cats = window.FT_CONFIG.SYSTEM_CATEGORIES.filter(c => c.type === type);
  select.innerHTML = cats.map(c => 
    `<option value="${c.id}" ${selectedCatId && selectedCatId === c.id ? 'selected' : ''}>${c.name}</option>`
  ).join('');
}

function setupFormSubmitListener() {
  const form = document.getElementById('txForm');
  const typeSelect = document.getElementById('txType');

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      populateModalCategories(e.target.value);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseFloat(document.getElementById('txAmount').value);
      if (isNaN(amount) || amount <= 0) {
        window.FT_UI?.showToast('Please enter a valid positive amount in Indian Rupees (₹).', 'warning');
        return;
      }

      const txPayload = {
        id: editingTxId,
        description: document.getElementById('txDescription').value.trim(),
        amount: amount,
        transactionType: document.getElementById('txType').value,
        categoryId: parseInt(document.getElementById('txCategory').value),
        paymentMethod: document.getElementById('txPaymentMethod').value,
        transactionDate: document.getElementById('txDate').value,
        notes: document.getElementById('txNotes')?.value.trim() || ''
      };

      try {
        if (editingTxId) {
          await window.ftApi.updateTransaction(txPayload);
          window.FT_UI?.showToast('Transaction updated successfully!', 'success');
        } else {
          await window.ftApi.createTransaction(txPayload);
          window.FT_UI?.showToast('Transaction created successfully!', 'success');
        }

        // Close modal
        const modalEl = document.getElementById('transactionModal');
        if (window.bootstrap?.Modal) {
          const bsModal = window.bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        await initTransactionsPage();
      } catch (err) {
        window.FT_UI?.showToast('Failed to save transaction: ' + err.message, 'error');
      }
    });
  }
}

window.confirmDeleteTransaction = async function(id) {
  try {
    await window.ftApi.deleteTransaction(id);
    window.FT_UI?.showToast('Transaction deleted successfully.', 'info');
    await initTransactionsPage();
  } catch (err) {
    window.FT_UI?.showToast('Failed to delete transaction: ' + err.message, 'error');
  }
};
