/**
 * FinTrack — Centralized API Client & Spring Boot Fetch Integration
 * Handles JSON payload serialization, Bearer authorization headers,
 * error state propagation, and offline mock-mode failover.
 */

class FinTrackAPI {
  constructor() {
    this.baseUrl = window.FT_CONFIG?.API_BASE_URL || '/api';
    this.isBackendOnline = null; // null = untested, true = connected, false = mock fallback
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = localStorage.getItem(window.FT_STORAGE?.KEYS.TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Expired session or unauthorized
        localStorage.removeItem(window.FT_STORAGE?.KEYS.TOKEN);
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
          window.location.href = 'login.html?expired=true';
        }
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      this.isBackendOnline = true;
      return await response.json();
    } catch (err) {
      // If network fails (e.g. backend server is not running locally yet),
      // we log clean diagnostic and provide seamless fallback to local persistence
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        this.isBackendOnline = false;
        console.warn(`[FinTrack API] Spring Boot backend at ${url} is unreachable. Falling back to offline client store.`);
        return this.mockRoute(endpoint, options);
      }
      throw err;
    }
  }

  /**
   * Graceful fallback simulator when Spring Boot backend is offline
   */
  async mockRoute(endpoint, options) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;
    const storage = window.FT_STORAGE;

    // Simulate minor 80ms network latency
    await new Promise(r => setTimeout(r, 80));

    // 1. Auth routes
    if (endpoint.startsWith('/auth/login')) {
      const user = storage.getUser() || {
        id: 101,
        fullName: 'Rahul Sharma',
        email: body?.email || 'rahul.sharma@fintrack.in',
        accountStatus: 'ACTIVE',
        currency: 'INR',
        avatarText: 'RS'
      };
      storage.setUser(user);
      localStorage.setItem(storage.KEYS.TOKEN, 'mock_bearer_jwt_token_2026');
      return { token: 'mock_bearer_jwt_token_2026', user };
    }

    if (endpoint.startsWith('/auth/register')) {
      const newUser = {
        id: Date.now(),
        fullName: body.fullName,
        email: body.email,
        accountStatus: 'ACTIVE',
        currency: 'INR',
        avatarText: body.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      };
      storage.setUser(newUser);
      localStorage.setItem(storage.KEYS.TOKEN, 'mock_bearer_jwt_token_2026');
      return { token: 'mock_bearer_jwt_token_2026', user: newUser };
    }

    if (endpoint.startsWith('/users/me')) {
      return storage.getUser();
    }

    // 2. Transactions routes
    if (endpoint.startsWith('/transactions')) {
      if (method === 'GET') {
        return storage.getTransactions();
      }
      if (method === 'POST') {
        return storage.addTransaction(body);
      }
      if (method === 'PUT') {
        return storage.updateTransaction(body);
      }
      if (method === 'DELETE') {
        const id = endpoint.split('/').pop();
        storage.deleteTransaction(id);
        return { success: true };
      }
    }

    // 3. Monthly Plans & Budgets
    if (endpoint.startsWith('/monthly-plans')) {
      if (method === 'GET') {
        const plans = storage.getMonthlyPlans();
        return plans.length > 0 ? plans[0] : null;
      }
      if (method === 'POST' || method === 'PUT') {
        return storage.saveMonthlyPlan(body);
      }
    }

    if (endpoint.startsWith('/budgets')) {
      const plan = storage.getMonthlyPlans()[0];
      const tx = storage.getTransactions();
      const currentMonth = plan?.planMonth || '2026-10-01';
      const monthPrefix = currentMonth.slice(0, 7);

      const actualSpentMap = {};
      tx.filter(t => t.transactionType === 'EXPENSE' && t.transactionDate.startsWith(monthPrefix))
        .forEach(t => {
          actualSpentMap[t.categoryId] = (actualSpentMap[t.categoryId] || 0) + t.amount;
        });

      const budgets = (plan?.budgets || []).map(b => {
        const spent = actualSpentMap[b.categoryId] || 0;
        const remaining = b.plannedAmount - spent;
        const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;
        return {
          categoryId: b.categoryId,
          plannedAmount: b.plannedAmount,
          actualSpent: spent,
          remainingAmount: remaining,
          usagePercentage: pct
        };
      });

      return {
        planMonth: currentMonth,
        expectedIncome: plan?.expectedIncome || 0,
        targetSavings: plan?.targetSavings || 0,
        budgets
      };
    }

    // 4. Savings Goals routes
    if (endpoint.startsWith('/savings-goals')) {
      if (endpoint.includes('/contributions') && method === 'POST') {
        return storage.addSavingsContribution(body);
      }
      if (method === 'GET') {
        return storage.getSavingsGoals();
      }
      if (method === 'POST') {
        return storage.saveSavingsGoal(body);
      }
    }

    // 5. Reports Summary route
    if (endpoint.startsWith('/reports/summary')) {
      const tx = storage.getTransactions();
      const currentMonth = '2026-10';
      const monthTx = tx.filter(t => t.transactionDate.startsWith(currentMonth));

      const totalIncome = monthTx.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const totalExpense = monthTx.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      const actualSavings = totalIncome - totalExpense;

      const plan = storage.getMonthlyPlans()[0];

      return {
        month: currentMonth,
        totalIncome,
        totalExpense,
        actualSavings,
        expectedIncome: plan?.expectedIncome || 0,
        targetSavings: plan?.targetSavings || 0,
        totalBudgeted: (plan?.budgets || []).reduce((s, b) => s + b.plannedAmount, 0)
      };
    }

    // 6. Chatbot Assistant route
    if (endpoint.startsWith('/chat')) {
      const prompt = body?.message || '';
      return this.generateSimulatedAiResponse(prompt);
    }

    return {};
  }

  /**
   * Generates realistic, contextual financial guidance in Indian Rupees (INR)
   */
  generateSimulatedAiResponse(prompt) {
    const lower = prompt.toLowerCase();
    let reply = '';

    if (lower.includes('spent') || lower.includes('expense')) {
      reply = `In October 2026, your recorded total expenses stand at ₹57,599.00 across 11 transactions.\n\nYour primary outflows are:\n1. House Rent: ₹30,000.00 (52.1%)\n2. Food & Groceries: ₹9,230.00 (16.0%)\n3. Shopping & Festive: ₹8,499.00 (14.8%)\n\nYou still have ₹32,401.00 remaining in your ₹90,000.00 monthly expense budget cap.`;
    } else if (lower.includes('budget') || lower.includes('over')) {
      reply = `Good news! None of your categories have breached 100% budget cap this month.\n\nHowever, keep an eye on:\n• House Rent: ₹30,000.00 of ₹30,000.00 (100% utilized)\n• Shopping: ₹8,499.00 of ₹12,000.00 (70.8% utilized with Diwali approaching)\n• Food & Groceries: ₹9,230.00 of ₹18,000.00 (51.3% utilized)`;
    } else if (lower.includes('savings') || lower.includes('target')) {
      reply = `Your October target savings in your monthly plan was ₹35,000.00.\n\nBased on your actual cash flow (Income: ₹1,33,500.00 minus Expenses: ₹57,599.00), your Net Actual Savings currently stands at ₹75,901.00 (56.85% savings rate).\n\nYou have achieved 216.8% of your planned monthly savings target!`;
    } else if (lower.includes('grocery') || lower.includes('food') || lower.includes('reduce')) {
      reply = `Here are 3 practical ways to optimize grocery spending in India:\n1. Consolidate quick-commerce orders (Zepto/Blinkit) into planned weekly purchases to eliminate split delivery and convenience surcharges.\n2. Utilize UPI cashback and credit card dining offers for weekend meals.\n3. Buy non-perishable pantry staples in bulk once a month during supermarket festival sales.`;
    } else if (lower.includes('difference') || lower.includes('planned') || lower.includes('actual')) {
      reply = `Key Accounting Distinction in FinTrack:\n\n• Planned Savings: Your intended allocation set at the start of the month (e.g. ₹35,000.00). It is a goal, NOT real money yet.\n• Actual Savings: Calculated strictly as [Recorded Income - Recorded Expenses] for the calendar period (e.g. ₹75,901.00).\n• Goal Contributions: Internal milestone transfers. They do not reduce your monthly actual savings.`;
    } else {
      reply = `Namaste! Based on your active October 2026 financial records:\n• Total In-hand Income: ₹1,33,500.00\n• Total Expenses: ₹57,599.00\n• Actual Net Savings: ₹75,901.00\n• Emergency Fund Progress: ₹1,75,000.00 / ₹4,00,000.00 (43.8% funded)\n\nFeel free to ask about reducing specific category expenses, checking budget warnings, or planning for upcoming festival gifts!`;
    }

    return {
      message: reply,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Convenience API Methods
  async login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  async register(fullName, email, password) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(tx) {
    return this.request('/transactions', { method: 'POST', body: JSON.stringify(tx) });
  }

  async updateTransaction(tx) {
    return this.request('/transactions', { method: 'PUT', body: JSON.stringify(tx) });
  }

  async deleteTransaction(id) {
    return this.request(`/transactions/${id}`, { method: 'DELETE' });
  }

  async getMonthlyPlan(month) {
    return this.request(`/monthly-plans?month=${month}`);
  }

  async saveMonthlyPlan(plan) {
    return this.request('/monthly-plans', { method: 'POST', body: JSON.stringify(plan) });
  }

  async getBudgets(month) {
    return this.request(`/budgets?month=${month}`);
  }

  async getSavingsGoals() {
    return this.request('/savings-goals');
  }

  async createSavingsGoal(goal) {
    return this.request('/savings-goals', { method: 'POST', body: JSON.stringify(goal) });
  }

  async addSavingsContribution(goalId, amount, description, date) {
    return this.request('/savings-goals/contributions', {
      method: 'POST',
      body: JSON.stringify({ savingsGoalId: goalId, amount, description, contributionDate: date })
    });
  }

  async getReportsSummary(month) {
    return this.request(`/reports/summary?month=${month}`);
  }

  async sendChatMessage(message) {
    return this.request('/chat', { method: 'POST', body: JSON.stringify({ message }) });
  }
}

window.ftApi = new FinTrackAPI();
