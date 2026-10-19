/**
 * FinTrack — Profile & Settings Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
});

function initProfilePage() {
  const user = window.FT_STORAGE?.getUser() || {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@fintrack.in',
    currency: 'INR'
  };

  const nameInput = document.getElementById('profileFullName');
  const emailInput = document.getElementById('profileEmail');
  const currencySelect = document.getElementById('profileCurrency');
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('changePasswordForm');
  const resetDataBtn = document.getElementById('resetDataBtn');

  if (nameInput) nameInput.value = user.fullName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (currencySelect) currencySelect.value = user.currency || 'INR';

  // Profile Form
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      user.fullName = nameInput.value.trim();
      user.currency = currencySelect.value;
      user.avatarText = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      window.FT_STORAGE?.setUser(user);
      window.FT_UI?.showToast('Profile settings updated successfully!', 'success');

      // Update sidebar displays
      document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.fullName);
      document.querySelectorAll('.user-avatar-display').forEach(el => el.textContent = user.avatarText);
    });
  }

  // Change Password Form
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPass = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmNewPassword').value;

      if (!currentPass || !newPass || !confirmPass) {
        window.FT_UI?.showToast('Please fill in all password fields.', 'warning');
        return;
      }
      if (newPass !== confirmPass) {
        window.FT_UI?.showToast('New passwords do not match.', 'error');
        return;
      }
      if (newPass.length < 8) {
        window.FT_UI?.showToast('New password must be at least 8 characters long.', 'warning');
        return;
      }

      window.FT_UI?.showToast('Password updated securely!', 'success');
      passwordForm.reset();
    });
  }

  // Reset Demo Data
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      window.FT_STORAGE?.resetAll();
      window.FT_UI?.showToast('Data reset to default October 2026 state.', 'info');
      setTimeout(() => window.location.href = 'dashboard.html', 600);
    });
  }
}
