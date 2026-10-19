/**
 * FinTrack — Local Storage Persistence & State Management
 * Serves as realistic offline data engine and fallback when Spring Boot backend is not yet spun up.
 */

const FT_STORAGE = {
  KEYS: {
    USER: 'fintrack_auth_user',
    TOKEN: 'fintrack_auth_token',
    MONTHLY_PLANS: 'fintrack_monthly_plans',
    TRANSACTIONS: 'fintrack_transactions',
    SAVINGS_GOALS: 'fintrack_savings_goals',
    SAVINGS_CONTRIBUTIONS: 'fintrack_savings_contributions',
    CHAT_MESSAGES: 'fintrack_chat_messages'
  },

  initDefaultData() {
    // 1. Default Authenticated User
    if (!localStorage.getItem(this.KEYS.USER)) {
      const defaultUser = {
        id: 101,
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@fintrack.in',
        accountStatus: 'ACTIVE',
        currency: 'INR',
        avatarText: 'RS'
      };
      localStorage.setItem(this.KEYS.USER, JSON.stringify(defaultUser));
      localStorage.setItem(this.KEYS.TOKEN, 'fintrack_mock_jwt_token_2026');
    }

    // 2. Default Monthly Plan (October 2026 / Current Month)
    if (!localStorage.getItem(this.KEYS.MONTHLY_PLANS)) {
      const defaultPlans = [
        {
          id: 501,
          userId: 101,
          planMonth: '2026-10-01',
          expectedIncome: 125000.00,
          targetSavings: 35000.00,
          currencyCode: 'INR',
          notes: 'October festive plan. Targeting ₹35,000 savings towards Emergency Fund.',
          budgets: [
            { categoryId: 5, plannedAmount: 30000.00 }, // House Rent
            { categoryId: 6, plannedAmount: 18000.00 }, // Food and Groceries
            { categoryId: 7, plannedAmount: 6000.00 },  // Transport and Petrol
            { categoryId: 8, plannedAmount: 3000.00 },  // Medicines and Healthcare
            { categoryId: 9, plannedAmount: 8000.00 },  // Bills and Utilities
            { categoryId: 11, plannedAmount: 10000.00 }, // Weekend and Entertainment
            { categoryId: 12, plannedAmount: 12000.00 }, // Shopping
            { categoryId: 13, plannedAmount: 3000.00 }   // Family & Personal
          ]
        }
      ];
      localStorage.setItem(this.KEYS.MONTHLY_PLANS, JSON.stringify(defaultPlans));
    }

    // 3. Default Realistic Transactions (In Indian Rupees)
    if (!localStorage.getItem(this.KEYS.TRANSACTIONS)) {
      const defaultTx = [
        {
          id: 7001,
          userId: 101,
          categoryId: 1,
          transactionType: 'INCOME',
          amount: 115000.00,
          description: 'Monthly Corporate Salary Credit',
          transactionDate: '2026-10-01',
          paymentMethod: 'BANK_TRANSFER',
          notes: 'Net in-hand salary credited to HDFC Bank A/c'
        },
        {
          id: 7002,
          userId: 101,
          categoryId: 2,
          transactionType: 'INCOME',
          amount: 18500.00,
          description: 'Freelance Web Design Retainer',
          transactionDate: '2026-10-04',
          paymentMethod: 'UPI',
          notes: 'Received via PhonePe UPI'
        },
        {
          id: 7003,
          userId: 101,
          categoryId: 5,
          transactionType: 'EXPENSE',
          amount: 30000.00,
          description: 'Apartment Rent (Indiranagar 2BHK)',
          transactionDate: '2026-10-02',
          paymentMethod: 'BANK_TRANSFER',
          notes: 'Direct NEFT to landlord'
        },
        {
          id: 7004,
          userId: 101,
          categoryId: 9,
          transactionType: 'EXPENSE',
          amount: 3420.00,
          description: 'BESCOM Electricity Bill',
          transactionDate: '2026-10-03',
          paymentMethod: 'UPI',
          notes: 'Paid via Google Pay UPI'
        },
        {
          id: 7005,
          userId: 101,
          categoryId: 6,
          transactionType: 'EXPENSE',
          amount: 2850.00,
          description: 'Zepto Grocery & Staples',
          transactionDate: '2026-10-04',
          paymentMethod: 'UPI',
          notes: 'Vegetables, milk, provisions'
        },
        {
          id: 7006,
          userId: 101,
          categoryId: 7,
          transactionType: 'EXPENSE',
          amount: 2100.00,
          description: 'IndianOil Petrol Fill-up',
          transactionDate: '2026-10-05',
          paymentMethod: 'UPI',
          notes: 'Full tank for Honda City'
        },
        {
          id: 7007,
          userId: 101,
          categoryId: 8,
          transactionType: 'EXPENSE',
          amount: 1250.00,
          description: 'Apollo Pharmacy Prescriptions',
          transactionDate: '2026-10-06',
          paymentMethod: 'DEBIT_CARD',
          notes: 'Routine health check supplies'
        },
        {
          id: 7008,
          userId: 101,
          categoryId: 11,
          transactionType: 'EXPENSE',
          amount: 3800.00,
          description: 'Weekend Dinner at Toit Indiranagar',
          transactionDate: '2026-10-07',
          paymentMethod: 'CREDIT_CARD',
          notes: 'Dine-out with college friends'
        },
        {
          id: 7009,
          userId: 101,
          categoryId: 6,
          transactionType: 'EXPENSE',
          amount: 4600.00,
          description: 'Nature Basket Weekly Pantry',
          transactionDate: '2026-10-09',
          paymentMethod: 'UPI',
          notes: 'Monthly provisions'
        },
        {
          id: 7010,
          userId: 101,
          categoryId: 9,
          transactionType: 'EXPENSE',
          amount: 1199.00,
          description: 'Airtel Xstream Fiber Broadband',
          transactionDate: '2026-10-10',
          paymentMethod: 'UPI',
          notes: 'Auto-pay via UPI mandate'
        },
        {
          id: 7011,
          userId: 101,
          categoryId: 12,
          transactionType: 'EXPENSE',
          amount: 8499.00,
          description: 'Amazon Great Indian Festival Shopping',
          transactionDate: '2026-10-12',
          paymentMethod: 'CREDIT_CARD',
          notes: 'Diwali gifts & kitchen appliances'
        },
        {
          id: 7012,
          userId: 101,
          categoryId: 6,
          transactionType: 'EXPENSE',
          amount: 1780.00,
          description: 'Swiggy Instamart Snack & Beverage',
          transactionDate: '2026-10-14',
          paymentMethod: 'UPI',
          notes: 'Quick delivery'
        },
        {
          id: 7013,
          userId: 101,
          categoryId: 7,
          transactionType: 'EXPENSE',
          amount: 1850.00,
          description: 'Ola & Uber Commutes to Office',
          transactionDate: '2026-10-15',
          paymentMethod: 'UPI',
          notes: 'Rainy day cab rides'
        }
      ];
      localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(defaultTx));
    }

    // 4. Default Savings Goals
    if (!localStorage.getItem(this.KEYS.SAVINGS_GOALS)) {
      const defaultGoals = [
        {
          id: 801,
          userId: 101,
          name: '6-Month Emergency Safety Net',
          targetAmount: 400000.00,
          currentAmount: 175000.00,
          targetDate: '2027-03-31',
          status: 'ACTIVE',
          createdAt: '2026-08-01'
        },
        {
          id: 802,
          userId: 101,
          name: 'Diwali Gold Sovereign & Gifting',
          targetAmount: 60000.00,
          currentAmount: 45000.00,
          targetDate: '2026-11-01',
          status: 'ACTIVE',
          createdAt: '2026-07-01'
        }
      ];
      localStorage.setItem(this.KEYS.SAVINGS_GOALS, JSON.stringify(defaultGoals));
    }

    // 5. Default Savings Contributions
    if (!localStorage.getItem(this.KEYS.SAVINGS_CONTRIBUTIONS)) {
      const defaultContribs = [
        { id: 9001, savingsGoalId: 801, amount: 75000.00, contributionDate: '2026-08-05', description: 'Initial Fixed Deposit transfer' },
        { id: 9002, savingsGoalId: 801, amount: 50000.00, contributionDate: '2026-09-05', description: 'September monthly savings allocation' },
        { id: 9003, savingsGoalId: 801, amount: 50000.00, contributionDate: '2026-10-05', description: 'October emergency fund transfer from salary' },
        { id: 9004, savingsGoalId: 802, amount: 25000.00, contributionDate: '2026-08-10', description: 'Diwali gold token deposit' },
        { id: 9005, savingsGoalId: 802, amount: 20000.00, contributionDate: '2026-10-02', description: 'Festival jewelry fund addition' }
      ];
      localStorage.setItem(this.KEYS.SAVINGS_CONTRIBUTIONS, JSON.stringify(defaultContribs));
    }

    // 6. Default Chatbot History
    if (!localStorage.getItem(this.KEYS.CHAT_MESSAGES)) {
      const defaultChat = [
        {
          id: 1,
          role: 'ASSISTANT',
          content: 'Namaste Rahul! I am your FinTrack AI Finance Assistant. How can I help you manage your monthly budget, plan savings in Indian Rupees, or review your spending trends today?',
          timestamp: '2026-10-02 14:00'
        }
      ];
      localStorage.setItem(this.KEYS.CHAT_MESSAGES, JSON.stringify(defaultChat));
    }
  },

  getUser() {
    return JSON.parse(localStorage.getItem(this.KEYS.USER) || 'null');
  },

  setUser(user) {
    localStorage.setItem(this.KEYS.USER, JSON.stringify(user));
  },

  getMonthlyPlans() {
    return JSON.parse(localStorage.getItem(this.KEYS.MONTHLY_PLANS) || '[]');
  },

  saveMonthlyPlan(plan) {
    const plans = this.getMonthlyPlans();
    const idx = plans.findIndex(p => p.planMonth === plan.planMonth && p.userId === plan.userId);
    if (idx >= 0) {
      plans[idx] = { ...plans[idx], ...plan, updatedAt: new Date().toISOString() };
    } else {
      plan.id = plan.id || Date.now();
      plans.push(plan);
    }
    localStorage.setItem(this.KEYS.MONTHLY_PLANS, JSON.stringify(plans));
    return plan;
  },

  getTransactions() {
    return JSON.parse(localStorage.getItem(this.KEYS.TRANSACTIONS) || '[]');
  },

  addTransaction(tx) {
    const list = this.getTransactions();
    tx.id = tx.id || Date.now();
    tx.amount = parseFloat(tx.amount);
    list.unshift(tx);
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(list));
    return tx;
  },

  updateTransaction(tx) {
    const list = this.getTransactions();
    const idx = list.findIndex(t => t.id === Number(tx.id));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...tx, amount: parseFloat(tx.amount) };
      localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(list));
      return list[idx];
    }
    return null;
  },

  deleteTransaction(id) {
    let list = this.getTransactions();
    list = list.filter(t => t.id !== Number(id));
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(list));
    return true;
  },

  getSavingsGoals() {
    return JSON.parse(localStorage.getItem(this.KEYS.SAVINGS_GOALS) || '[]');
  },

  saveSavingsGoal(goal) {
    const goals = this.getSavingsGoals();
    const idx = goals.findIndex(g => g.id === Number(goal.id));
    if (idx >= 0) {
      goals[idx] = { ...goals[idx], ...goal };
    } else {
      goal.id = goal.id || Date.now();
      goal.currentAmount = goal.currentAmount || 0;
      goal.status = goal.status || 'ACTIVE';
      goals.push(goal);
    }
    localStorage.setItem(this.KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    return goal;
  },

  addSavingsContribution(contrib) {
    const contribs = JSON.parse(localStorage.getItem(this.KEYS.SAVINGS_CONTRIBUTIONS) || '[]');
    contrib.id = contrib.id || Date.now();
    contrib.amount = parseFloat(contrib.amount);
    contribs.push(contrib);
    localStorage.setItem(this.KEYS.SAVINGS_CONTRIBUTIONS, JSON.stringify(contribs));

    // Update goal accumulated amount
    const goals = this.getSavingsGoals();
    const goal = goals.find(g => g.id === Number(contrib.savingsGoalId));
    if (goal) {
      goal.currentAmount = (goal.currentAmount || 0) + contrib.amount;
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'COMPLETED';
      }
      localStorage.setItem(this.KEYS.SAVINGS_GOALS, JSON.stringify(goals));
    }
    return contrib;
  },

  getSavingsContributions(goalId) {
    const contribs = JSON.parse(localStorage.getItem(this.KEYS.SAVINGS_CONTRIBUTIONS) || '[]');
    if (goalId) {
      return contribs.filter(c => c.savingsGoalId === Number(goalId));
    }
    return contribs;
  },

  getChatMessages() {
    return JSON.parse(localStorage.getItem(this.KEYS.CHAT_MESSAGES) || '[]');
  },

  addChatMessage(msg) {
    const msgs = this.getChatMessages();
    msg.id = msg.id || Date.now();
    msgs.push(msg);
    localStorage.setItem(this.KEYS.CHAT_MESSAGES, JSON.stringify(msgs));
    return msg;
  },

  resetAll() {
    localStorage.clear();
    this.initDefaultData();
  }
};

// Initialize default dataset immediately
FT_STORAGE.initDefaultData();
window.FT_STORAGE = FT_STORAGE;
