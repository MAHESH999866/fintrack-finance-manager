/**
 * FinTrack — Shared UI & Formatting Helpers
 * Indian Rupee (INR / ₹) Formatting & Component Utilities
 */

const FT_UI = {
  /**
   * Format numbers into Indian Rupee string (e.g. 125000 -> "₹ 1,25,000.00")
   */
  formatINR(amount) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '₹ 0.00';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num).replace('INR', '₹').trim();
  },

  /**
   * Format compact numbers in Indian system (e.g. 125000 -> "₹ 1.25 L", 400000 -> "₹ 4.00 L", 35000 -> "₹ 35.0 K")
   */
  formatCompactINR(amount) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '₹ 0.00';
    }
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 10000000) {
      return `${sign}₹ ${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹ ${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹ ${(abs / 1000).toFixed(1)} K`;
    }
    return this.formatINR(amount);
  },

  /**
   * Format YYYY-MM-DD into "DD MMM YYYY" (e.g. "04 Oct 2026")
   */
  formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  },

  /**
   * Show a Bootstrap Toast notification
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('ftToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ftToastContainer';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '1090';
      document.body.appendChild(container);
    }

    const toastId = 'toast_' + Date.now();
    const bgClass = type === 'success' ? 'bg-success text-white' :
                    type === 'error' ? 'bg-danger text-white' :
                    type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

    const toastHtml = `
      <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body font-sans text-sm">
            ${message}
          </div>
          <button type="button" class="btn-close ${type !== 'warning' ? 'btn-close-white' : ''} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    if (window.bootstrap && window.bootstrap.Toast) {
      const toast = new window.bootstrap.Toast(toastEl, { delay: 3500 });
      toast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    } else {
      setTimeout(() => toastEl.remove(), 3500);
    }
  },

  /**
   * Render payment method badge with clean design
   */
  getPaymentMethodBadge(method) {
    const map = {
      'UPI': 'badge-ft-neutral',
      'CASH': 'badge-ft-neutral',
      'DEBIT_CARD': 'badge-ft-neutral',
      'CREDIT_CARD': 'badge-ft-neutral',
      'BANK_TRANSFER': 'badge-ft-neutral',
      'OTHER': 'badge-ft-neutral'
    };
    const cls = map[method] || 'badge-ft-neutral';
    return `<span class="badge-ft ${cls} font-mono">${method || 'OTHER'}</span>`;
  },

  /**
   * Category name resolver
   */
  getCategoryName(categoryId) {
    const cat = (window.FT_CONFIG?.SYSTEM_CATEGORIES || []).find(c => c.id === Number(categoryId));
    return cat ? cat.name : 'Uncategorized';
  }
};

window.FT_UI = FT_UI;
