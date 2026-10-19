/**
 * FinTrack — Authentication & Session Controller (Login / Register)
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthPages();
});

function initAuthPages() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const demoFillBtn = document.getElementById('demoFillBtn');

  // Fill sample credentials for quick grading/demo
  if (demoFillBtn) {
    demoFillBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');
      if (emailInput) emailInput.value = 'rahul.sharma@fintrack.in';
      if (passInput) passInput.value = 'FinTrack@Secure2026';
    });
  }

  // Handle Login Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorAlert = document.getElementById('authErrorAlert');
      const submitBtn = document.getElementById('loginSubmitBtn');

      if (!email || !password) {
        showError(errorAlert, 'Please enter your email and password.');
        return;
      }

      setLoading(submitBtn, true, 'Signing in...');

      try {
        await window.ftApi.login(email, password);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showError(errorAlert, err.message || 'Invalid credentials. Please verify your email and password.');
        setLoading(submitBtn, false, 'Sign In to FinTrack');
      }
    });
  }

  // Handle Registration Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const errorAlert = document.getElementById('authErrorAlert');
      const submitBtn = document.getElementById('regSubmitBtn');

      if (!fullName || !email || !password || !confirmPassword) {
        showError(errorAlert, 'All registration fields are required.');
        return;
      }

      if (password !== confirmPassword) {
        showError(errorAlert, 'Passwords do not match. Please re-enter identical passwords.');
        return;
      }

      if (password.length < 8) {
        showError(errorAlert, 'Password must be at least 8 characters long.');
        return;
      }

      setLoading(submitBtn, true, 'Creating Account...');

      try {
        await window.ftApi.register(fullName, email, password);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showError(errorAlert, err.message || 'Registration failed. Email might already be taken.');
        setLoading(submitBtn, false, 'Create FinTrack Account');
      }
    });
  }
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('d-none');
}

function setLoading(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? `<span class="spinner-border spinner-border-sm me-2"></span>${text}` : text;
}
