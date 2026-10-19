/**
 * FinTrack — Unified Navigation, Sidebar, and App Shell Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Authentication Guard (Skip for login and register pages)
  const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
  const user = window.FT_STORAGE?.getUser();

  if (!isAuthPage && !user) {
    // If not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }

  // 2. Populate User Profile snippet in sidebar and topbar
  if (user) {
    const userNameEls = document.querySelectorAll('.user-name-display');
    userNameEls.forEach(el => el.textContent = user.fullName || 'Rahul Sharma');

    const userEmailEls = document.querySelectorAll('.user-email-display');
    userEmailEls.forEach(el => el.textContent = user.email || 'rahul.sharma@fintrack.in');

    const userAvatarEls = document.querySelectorAll('.user-avatar-display');
    userAvatarEls.forEach(el => el.textContent = user.avatarText || 'RS');
  }

  // 3. Mark current page as active in sidebar
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.sidebar-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === 'index.html' && href === 'dashboard.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Mobile Sidebar Drawer Toggle
  const sidebar = document.getElementById('appSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('show');
    });
  }

  // 5. Logout Action
  const logoutBtns = document.querySelectorAll('.action-logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(window.FT_STORAGE?.KEYS.TOKEN);
      window.location.href = 'login.html';
    });
  });

  // 6. Global Quick Add Transaction Modal Setup
  initQuickAddTransactionModal();

  // 7. Initialize Chatbot Assistant
  if (typeof initChatbot === 'function') {
    initChatbot();
  }
});

/**
 * Universal Quick Add Transaction Modal Handler
 */
function initQuickAddTransactionModal() {
  const modalEl = document.getElementById('quickAddTransactionModal');
  if (!modalEl) return;

  const form = document.getElementById('quickAddTransactionForm');
  const dateInput = document.getElementById('qaDate');
  const amountInput = document.getElementById('qaAmount');
  const typeSelect = document.getElementById('qaType');
  const categorySelect = document.getElementById('qaCategory');

  // Pre-fill today's date if empty
  if (dateInput && !dateInput.value) {
    dateInput.value = '2026-10-16'; // Aligned with current session date
  }

  // Populate categories dynamically based on type (Income vs Expense)
  const populateCategories = () => {
    if (!categorySelect || !window.FT_CONFIG) return;
    const type = typeSelect ? typeSelect.value : 'EXPENSE';
    const cats = window.FT_CONFIG.SYSTEM_CATEGORIES.filter(c => c.type === type);
    
    categorySelect.innerHTML = cats.map(c => 
      `<option value="${c.id}">${c.name}</option>`
    ).join('');
  };

  if (typeSelect) {
    typeSelect.addEventListener('change', populateCategories);
    populateCategories();
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount <= 0) {
        window.FT_UI?.showToast('Please enter a valid positive amount in Indian Rupees (₹).', 'warning');
        return;
      }

      const txData = {
        description: document.getElementById('qaDescription').value.trim(),
        amount: amount,
        transactionType: typeSelect.value,
        categoryId: parseInt(categorySelect.value),
        paymentMethod: document.getElementById('qaPaymentMethod').value,
        transactionDate: dateInput.value,
        notes: document.getElementById('qaNotes') ? document.getElementById('qaNotes').value.trim() : ''
      };

      try {
        await window.ftApi.createTransaction(txData);
        window.FT_UI?.showToast(`Transaction of ${window.FT_UI.formatINR(amount)} recorded successfully!`, 'success');

        // Close modal
        if (window.bootstrap?.Modal) {
          const bsModal = window.bootstrap.Modal.getInstance(modalEl);
          if (bsModal) bsModal.hide();
        }

        form.reset();
        dateInput.value = '2026-10-16';

        // Trigger page refresh callback if available on active page
        if (typeof window.refreshPageData === 'function') {
          window.refreshPageData();
        }
      } catch (err) {
        window.FT_UI?.showToast('Failed to save transaction: ' + err.message, 'error');
      }
    });
  }
}
