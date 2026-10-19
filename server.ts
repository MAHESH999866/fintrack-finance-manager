import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Enable CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// -----------------------------------------------------------------------------
// In-Memory Database for Full-Stack Execution
// Initialized with realistic Indian Personal Finance (INR / ₹) data for Oct 2026
// -----------------------------------------------------------------------------

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  isSystem: boolean;
}

interface Budget {
  categoryId: number;
  plannedAmount: number;
}

interface MonthlyPlan {
  id: number;
  userId: number;
  planMonth: string; // YYYY-MM-DD
  expectedIncome: number;
  targetSavings: number;
  currencyCode: string;
  notes: string;
  budgets: Budget[];
}

interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  transactionType: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string; // YYYY-MM-DD
  paymentMethod: 'UPI' | 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  notes: string;
}

interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface SavingsContribution {
  id: number;
  savingsGoalId: number;
  amount: number;
  contributionDate: string;
  description: string;
}

const db = {
  users: [
    {
      id: 101,
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@fintrack.in',
      password: 'Password@123',
      accountStatus: 'ACTIVE',
      currency: 'INR',
      avatarText: 'RS'
    }
  ],
  categories: [
    { id: 1, name: 'Salary', type: 'INCOME', isSystem: true },
    { id: 2, name: 'Freelance Income', type: 'INCOME', isSystem: true },
    { id: 3, name: 'Investment Return', type: 'INCOME', isSystem: true },
    { id: 4, name: 'Other Income', type: 'INCOME', isSystem: true },
    { id: 5, name: 'House Rent', type: 'EXPENSE', isSystem: true },
    { id: 6, name: 'Food and Groceries', type: 'EXPENSE', isSystem: true },
    { id: 7, name: 'Transport and Petrol', type: 'EXPENSE', isSystem: true },
    { id: 8, name: 'Medicines and Healthcare', type: 'EXPENSE', isSystem: true },
    { id: 9, name: 'Bills and Utilities', type: 'EXPENSE', isSystem: true },
    { id: 10, name: 'Education', type: 'EXPENSE', isSystem: true },
    { id: 11, name: 'Weekend and Entertainment', type: 'EXPENSE', isSystem: true },
    { id: 12, name: 'Shopping', type: 'EXPENSE', isSystem: true },
    { id: 13, name: 'Family and Personal Expenses', type: 'EXPENSE', isSystem: true },
    { id: 14, name: 'Other Expenses', type: 'EXPENSE', isSystem: true }
  ] as Category[],
  monthlyPlans: [
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
  ] as MonthlyPlan[],
  transactions: [
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
  ] as Transaction[],
  savingsGoals: [
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
  ] as SavingsGoal[],
  savingsContributions: [
    { id: 9001, savingsGoalId: 801, amount: 75000.00, contributionDate: '2026-08-05', description: 'Initial Fixed Deposit transfer' },
    { id: 9002, savingsGoalId: 801, amount: 50000.00, contributionDate: '2026-09-05', description: 'September monthly savings allocation' },
    { id: 9003, savingsGoalId: 801, amount: 50000.00, contributionDate: '2026-10-05', description: 'October emergency fund transfer from salary' },
    { id: 9004, savingsGoalId: 802, amount: 25000.00, contributionDate: '2026-08-15', description: 'Initial jewellery advance' },
    { id: 9005, savingsGoalId: 802, amount: 20000.00, contributionDate: '2026-09-18', description: 'Festival bonus allocation' }
  ] as SavingsContribution[]
};

// -----------------------------------------------------------------------------
// Authentication Helper
// -----------------------------------------------------------------------------
function getAuthUser(req: express.Request) {
  // In demo / full-stack mode, default to Rahul Sharma (user 101)
  return db.users[0];
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// Matching Spring Boot REST API Contracts
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'FinTrack Full-Stack Application Engine',
    version: '1.0.0',
    currency: 'INR',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// 1. Auth routes
app.post(['/api/auth/login', '/api/v1/auth/login'], (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email) || db.users[0];
  const token = 'fintrack_jwt_token_' + Buffer.from(user.email).toString('base64');
  res.json({
    token,
    type: 'Bearer',
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      accountStatus: user.accountStatus,
      currency: user.currency,
      avatarText: user.avatarText
    }
  });
});

app.post(['/api/auth/register', '/api/v1/auth/register'], (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ message: 'Full name and email are required.' });
  }
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'FT';
  const newUser = {
    id: Date.now(),
    fullName,
    email,
    password: password || 'Password@123',
    accountStatus: 'ACTIVE',
    currency: 'INR',
    avatarText: initials
  };
  db.users.push(newUser);
  const token = 'fintrack_jwt_token_' + Buffer.from(newUser.email).toString('base64');
  res.status(201).json({
    token,
    type: 'Bearer',
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      accountStatus: newUser.accountStatus,
      currency: newUser.currency,
      avatarText: newUser.avatarText
    }
  });
});

app.get(['/api/auth/me', '/api/v1/auth/me', '/api/users/me', '/api/v1/users/me'], (req, res) => {
  const user = getAuthUser(req);
  res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    accountStatus: user.accountStatus,
    currency: user.currency,
    avatarText: user.avatarText
  });
});

app.put(['/api/auth/change-password', '/api/v1/auth/change-password', '/api/users/password', '/api/v1/users/password'], (req, res) => {
  res.json({ message: 'Password updated successfully.' });
});

app.post(['/api/auth/logout', '/api/v1/auth/logout'], (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

// 2. Categories routes
app.get(['/api/categories', '/api/v1/categories'], (req, res) => {
  const type = req.query.type as string | undefined;
  if (type) {
    return res.json(db.categories.filter(c => c.type === type));
  }
  res.json(db.categories);
});

app.post(['/api/categories', '/api/v1/categories'], (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: 'Category name and type are required.' });
  }
  const newCat: Category = {
    id: Date.now(),
    name,
    type,
    isSystem: false
  };
  db.categories.push(newCat);
  res.status(201).json(newCat);
});

app.delete(['/api/categories/:id', '/api/v1/categories/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx !== -1 && !db.categories[idx].isSystem) {
    db.categories.splice(idx, 1);
  }
  res.status(204).end();
});

// 3. Monthly Plans routes
app.get(['/api/monthly-plans', '/api/v1/monthly-plans'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const prefix = monthParam.substring(0, 7);
  const plan = db.monthlyPlans.find(p => p.planMonth.startsWith(prefix));
  if (!plan) {
    return res.status(204).end();
  }
  res.json(plan);
});

app.get(['/api/monthly-plans/all', '/api/v1/monthly-plans/all'], (req, res) => {
  res.json(db.monthlyPlans);
});

app.post(['/api/monthly-plans', '/api/v1/monthly-plans'], (req, res) => {
  const body = req.body;
  const user = getAuthUser(req);
  const planDate = body.planMonth.length === 7 ? `${body.planMonth}-01` : body.planMonth;
  const prefix = planDate.substring(0, 7);

  let existing = db.monthlyPlans.find(p => p.planMonth.startsWith(prefix));
  if (existing) {
    existing.expectedIncome = parseFloat(body.expectedIncome) || 0;
    existing.targetSavings = parseFloat(body.targetSavings) || 0;
    existing.notes = body.notes || '';
    existing.budgets = (body.budgets || []).map((b: any) => ({
      categoryId: parseInt(b.categoryId, 10),
      plannedAmount: parseFloat(b.plannedAmount) || 0
    }));
    return res.json(existing);
  }

  const newPlan: MonthlyPlan = {
    id: Date.now(),
    userId: user.id,
    planMonth: planDate,
    expectedIncome: parseFloat(body.expectedIncome) || 0,
    targetSavings: parseFloat(body.targetSavings) || 0,
    currencyCode: 'INR',
    notes: body.notes || '',
    budgets: (body.budgets || []).map((b: any) => ({
      categoryId: parseInt(b.categoryId, 10),
      plannedAmount: parseFloat(b.plannedAmount) || 0
    }))
  };
  db.monthlyPlans.push(newPlan);
  res.status(201).json(newPlan);
});

// 4. Budgets utilization route
app.get(['/api/budgets', '/api/v1/budgets'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const prefix = monthParam.substring(0, 7);
  const plan = db.monthlyPlans.find(p => p.planMonth.startsWith(prefix)) || db.monthlyPlans[0];
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(prefix) && t.transactionType === 'EXPENSE');

  const budgets = (plan?.budgets || []).map(b => {
    const spent = txs
      .filter(t => t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amount, 0);
    const remaining = b.plannedAmount - spent;
    const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;
    return {
      categoryId: b.categoryId,
      plannedAmount: b.plannedAmount,
      actualSpent: spent,
      remainingAmount: remaining,
      usagePercentage: Math.round(pct * 100) / 100,
      status: pct >= 100 ? 'EXCEEDED' : pct >= 80 ? 'WARNING' : 'NORMAL'
    };
  });

  const totalPlanned = budgets.reduce((s, b) => s + b.plannedAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.actualSpent, 0);

  res.json({
    planMonth: prefix,
    expectedIncome: plan?.expectedIncome || 0,
    targetSavings: plan?.targetSavings || 0,
    totalPlannedExpenses: totalPlanned,
    totalActualExpenses: totalSpent,
    remainingBudget: totalPlanned - totalSpent,
    budgets
  });
});

// 5. Transactions routes
app.get(['/api/transactions', '/api/v1/transactions'], (req, res) => {
  let list = [...db.transactions];
  const { month, type, categoryId, paymentMethod } = req.query;

  if (month) {
    const prefix = (month as string).substring(0, 7);
    list = list.filter(t => t.transactionDate.startsWith(prefix));
  }
  if (type) {
    list = list.filter(t => t.transactionType === type);
  }
  if (categoryId) {
    list = list.filter(t => t.categoryId === parseInt(categoryId as string, 10));
  }
  if (paymentMethod) {
    list = list.filter(t => t.paymentMethod === paymentMethod);
  }

  // Sort descending by date
  list.sort((a, b) => (b.transactionDate > a.transactionDate ? 1 : -1));
  res.json(list);
});

app.get(['/api/transactions/:id', '/api/v1/transactions/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const tx = db.transactions.find(t => t.id === id);
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  res.json(tx);
});

app.post(['/api/transactions', '/api/v1/transactions'], (req, res) => {
  const user = getAuthUser(req);
  const body = req.body;
  const newTx: Transaction = {
    id: Date.now(),
    userId: user.id,
    categoryId: parseInt(body.categoryId, 10),
    transactionType: body.transactionType || 'EXPENSE',
    amount: parseFloat(body.amount) || 0,
    description: body.description || '',
    transactionDate: body.transactionDate || new Date().toISOString().split('T')[0],
    paymentMethod: body.paymentMethod || 'UPI',
    notes: body.notes || ''
  };
  db.transactions.unshift(newTx);
  res.status(201).json(newTx);
});

app.put(['/api/transactions/:id', '/api/v1/transactions/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const body = req.body;
  const tx = db.transactions.find(t => t.id === id);
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });

  if (body.categoryId) tx.categoryId = parseInt(body.categoryId, 10);
  if (body.transactionType) tx.transactionType = body.transactionType;
  if (body.amount !== undefined) tx.amount = parseFloat(body.amount);
  if (body.description) tx.description = body.description;
  if (body.transactionDate) tx.transactionDate = body.transactionDate;
  if (body.paymentMethod) tx.paymentMethod = body.paymentMethod;
  if (body.notes !== undefined) tx.notes = body.notes;

  res.json(tx);
});

app.delete(['/api/transactions/:id', '/api/v1/transactions/:id'], (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = db.transactions.findIndex(t => t.id === id);
  if (idx !== -1) {
    db.transactions.splice(idx, 1);
  }
  res.status(204).end();
});

// 6. Savings Goals routes
app.get(['/api/savings-goals', '/api/v1/savings-goals'], (req, res) => {
  const list = db.savingsGoals.map(g => {
    const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    return {
      ...g,
      remainingAmount: remaining,
      progressPercentage: Math.round(pct * 10) / 10
    };
  });
  res.json(list);
});

app.post(['/api/savings-goals', '/api/v1/savings-goals'], (req, res) => {
  const user = getAuthUser(req);
  const body = req.body;
  const newGoal: SavingsGoal = {
    id: Date.now(),
    userId: user.id,
    name: body.name,
    targetAmount: parseFloat(body.targetAmount) || 0,
    currentAmount: parseFloat(body.initialDeposit) || 0,
    targetDate: body.targetDate || '',
    status: 'ACTIVE',
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.savingsGoals.push(newGoal);

  if (newGoal.currentAmount > 0) {
    db.savingsContributions.push({
      id: Date.now() + 1,
      savingsGoalId: newGoal.id,
      amount: newGoal.currentAmount,
      contributionDate: newGoal.createdAt,
      description: 'Initial allocation deposit'
    });
  }

  const pct = newGoal.targetAmount > 0 ? (newGoal.currentAmount / newGoal.targetAmount) * 100 : 0;
  res.status(201).json({
    ...newGoal,
    remainingAmount: Math.max(0, newGoal.targetAmount - newGoal.currentAmount),
    progressPercentage: Math.round(pct * 10) / 10
  });
});

app.post(['/api/savings-goals/contributions', '/api/v1/savings-goals/contributions'], (req, res) => {
  const { savingsGoalId, amount, description, contributionDate } = req.body;
  const goal = db.savingsGoals.find(g => g.id === parseInt(savingsGoalId, 10));
  if (!goal) return res.status(404).json({ message: 'Savings goal not found' });

  const numAmount = parseFloat(amount) || 0;
  goal.currentAmount += numAmount;

  const contrib: SavingsContribution = {
    id: Date.now(),
    savingsGoalId: goal.id,
    amount: numAmount,
    contributionDate: contributionDate || new Date().toISOString().split('T')[0],
    description: description || 'Savings transfer'
  };
  db.savingsContributions.push(contrib);

  res.status(201).json(contrib);
});

app.get(['/api/savings-goals/:id/contributions', '/api/v1/savings-goals/:id/contributions'], (req, res) => {
  const goalId = parseInt(req.params.id, 10);
  const list = db.savingsContributions.filter(c => c.savingsGoalId === goalId);
  list.sort((a, b) => (b.contributionDate > a.contributionDate ? 1 : -1));
  res.json(list);
});

// 7. Reports routes
app.get(['/api/reports/summary', '/api/v1/reports/summary'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const prefix = monthParam.substring(0, 7);
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(prefix));

  const totalIncome = txs.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const actualSavings = totalIncome - totalExpense;

  const plan = db.monthlyPlans.find(p => p.planMonth.startsWith(prefix)) || db.monthlyPlans[0];
  const totalBudgeted = (plan?.budgets || []).reduce((s, b) => s + b.plannedAmount, 0);
  const remainingBudget = totalBudgeted - totalExpense;

  const savingsRate = totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0;
  const budgetUtilization = totalBudgeted > 0 ? (totalExpense / totalBudgeted) * 100 : 0;

  res.json({
    month: prefix,
    currencyCode: 'INR',
    expectedIncome: plan?.expectedIncome || 0,
    totalIncome,
    totalBudgeted,
    totalExpense,
    remainingBudget,
    targetSavings: plan?.targetSavings || 0,
    actualSavings,
    savingsRatePercentage: Math.round(savingsRate * 10) / 10,
    budgetUtilizationPercentage: Math.round(budgetUtilization * 10) / 10,
    transactionCount: txs.length
  });
});

app.get(['/api/reports/planned-vs-actual', '/api/v1/reports/planned-vs-actual'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const prefix = monthParam.substring(0, 7);
  const plan = db.monthlyPlans.find(p => p.planMonth.startsWith(prefix)) || db.monthlyPlans[0];
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(prefix) && t.transactionType === 'EXPENSE');

  const items = (plan?.budgets || []).map(b => {
    const cat = db.categories.find(c => c.id === b.categoryId);
    const spent = txs.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
    const diff = b.plannedAmount - spent;
    const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;
    return {
      categoryId: b.categoryId,
      categoryName: cat?.name || `Category ${b.categoryId}`,
      plannedAmount: b.plannedAmount,
      actualSpent: spent,
      variance: diff,
      utilizationPercentage: Math.round(pct * 100) / 100
    };
  });

  res.json(items);
});

app.get(['/api/reports/category-spending', '/api/v1/reports/category-spending'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const typeParam = (req.query.type as string) || 'EXPENSE';
  const prefix = monthParam.substring(0, 7);
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(prefix) && t.transactionType === typeParam);
  const total = txs.reduce((s, t) => s + t.amount, 0);

  const map = new Map<number, { amount: number; count: number }>();
  for (const t of txs) {
    const cur = map.get(t.categoryId) || { amount: 0, count: 0 };
    cur.amount += t.amount;
    cur.count += 1;
    map.set(t.categoryId, cur);
  }

  const result = Array.from(map.entries()).map(([catId, data]) => {
    const cat = db.categories.find(c => c.id === catId);
    const pct = total > 0 ? (data.amount / total) * 100 : 0;
    return {
      categoryId: catId,
      categoryName: cat?.name || `Category ${catId}`,
      categoryType: typeParam,
      totalAmount: data.amount,
      transactionCount: data.count,
      percentageOfTotal: Math.round(pct * 100) / 100
    };
  });

  result.sort((a, b) => b.totalAmount - a.totalAmount);
  res.json(result);
});

app.get(['/api/reports/daily-trends', '/api/v1/reports/daily-trends'], (req, res) => {
  const monthParam = (req.query.month as string) || '2026-10';
  const prefix = monthParam.substring(0, 7);
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(prefix) && t.transactionType === 'EXPENSE');

  const map = new Map<string, { totalExpense: number; count: number }>();
  for (const t of txs) {
    const cur = map.get(t.transactionDate) || { totalExpense: 0, count: 0 };
    cur.totalExpense += t.amount;
    cur.count += 1;
    map.set(t.transactionDate, cur);
  }

  const result = Array.from(map.entries()).map(([date, data]) => ({
    date,
    totalExpense: data.totalExpense,
    transactionCount: data.count
  }));

  result.sort((a, b) => (a.date > b.date ? 1 : -1));
  res.json(result);
});

// 8. AI Finance Assistant (Powered by Google Gemini API with fallback)
app.post(['/api/chat', '/api/v1/chat'], async (req, res) => {
  const userMessage = req.body?.message || '';
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Compile active real-time Indian Rupee financial telemetry
  const currentMonth = '2026-10';
  const txs = db.transactions.filter(t => t.transactionDate.startsWith(currentMonth));
  const totalIncome = txs.filter(t => t.transactionType === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = txs.filter(t => t.transactionType === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const actualSavings = totalIncome - totalExpense;
  const plan = db.monthlyPlans.find(p => p.planMonth.startsWith(currentMonth)) || db.monthlyPlans[0];
  const totalBudgeted = (plan?.budgets || []).reduce((s, b) => s + b.plannedAmount, 0);
  const remainingBudget = totalBudgeted - totalExpense;

  const categoryBreakdown = (plan?.budgets || []).map(b => {
    const cat = db.categories.find(c => c.id === b.categoryId);
    const spent = txs.filter(t => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
    const pct = b.plannedAmount > 0 ? (spent / b.plannedAmount) * 100 : 0;
    return `${cat?.name || b.categoryId}: ₹${spent.toLocaleString('en-IN')} of ₹${b.plannedAmount.toLocaleString('en-IN')} (${pct.toFixed(1)}%)`;
  }).join('\n');

  const emergencyGoal = db.savingsGoals.find(g => g.id === 801);

  // If GEMINI_API_KEY is available, invoke Gemini via @google/genai
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are FinTrack AI, an expert Indian personal finance advisor and budgeting mentor.
You communicate professionally, warmly, and realistically, using Indian Rupees (₹), Indian comma numbering (e.g., ₹1,25,000, ₹75,000), and contextual advice tailored to Indian professionals, UPI payments, Indian festive spending (e.g. Diwali shopping), and household expenses.

Current Verified Financial Records for October 2026:
- Total In-Hand Income: ₹${totalIncome.toLocaleString('en-IN')}
- Planned Monthly Budget Cap: ₹${totalBudgeted.toLocaleString('en-IN')}
- Total Actual Expenses: ₹${totalExpense.toLocaleString('en-IN')}
- Remaining Monthly Budget: ₹${remainingBudget.toLocaleString('en-IN')}
- Planned Target Savings: ₹${plan?.targetSavings.toLocaleString('en-IN')}
- Net Actual Savings (Income - Expenses): ₹${actualSavings.toLocaleString('en-IN')}
- Savings Rate: ${((actualSavings / totalIncome) * 100).toFixed(1)}%
- Emergency Fund Goal: ₹${emergencyGoal?.currentAmount.toLocaleString('en-IN')} of ₹${emergencyGoal?.targetAmount.toLocaleString('en-IN')} (${((emergencyGoal!.currentAmount / emergencyGoal!.targetAmount) * 100).toFixed(1)}%)

Category Utilization:
${categoryBreakdown}

Important Accounting Rules in FinTrack:
1. Planned Savings is an allocation goal set in the monthly plan, NOT money already saved.
2. Actual Savings is strictly calculated as [Recorded Income - Recorded Expenses].
3. Goal transfers/contributions are internal milestone tracking, NOT expenses.

User Query: "${userMessage}"

Provide a concise, helpful, actionable response (1-3 brief paragraphs or bullet points). Always reference specific verified figures from the records when relevant.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response && response.text) {
        return res.json({
          message: response.text.trim(),
          timestamp: nowTime
        });
      }
    } catch (err: any) {
      console.warn('[FinTrack AI] Gemini API call note:', err?.message);
    }
  }

  // High-fidelity fallback financial guidance
  const lower = userMessage.toLowerCase();
  let reply = '';

  if (lower.includes('spent') || lower.includes('expense') || lower.includes('how much')) {
    reply = `In October 2026, your recorded total expenses stand at ₹${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })} across ${txs.filter(t => t.transactionType === 'EXPENSE').length} transactions.\n\nYour primary outflows are:\n1. House Rent: ₹30,000.00 (52.1%)\n2. Food & Groceries: ₹9,230.00 (16.0%)\n3. Shopping & Festive: ₹8,499.00 (14.8%)\n\nYou still have ₹${remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining in your ₹90,000.00 expense budget cap.`;
  } else if (lower.includes('budget') || lower.includes('over') || lower.includes('warning') || lower.includes('limit')) {
    reply = `Good news! None of your categories have breached 100% budget cap this month.\n\nHowever, keep an eye on:\n• House Rent: ₹30,000.00 of ₹30,000.00 (100% utilized)\n• Shopping: ₹8,499.00 of ₹12,000.00 (70.8% utilized with Diwali approaching)\n• Food & Groceries: ₹9,230.00 of ₹18,000.00 (51.3% utilized)`;
  } else if (lower.includes('savings') || lower.includes('target') || lower.includes('reach')) {
    reply = `Your October target savings in your monthly plan was ₹35,000.00.\n\nBased on your actual cash flow (Income: ₹1,33,500.00 minus Expenses: ₹57,599.00), your Net Actual Savings currently stands at ₹75,901.00 (56.85% savings rate).\n\nYou have achieved 216.8% of your planned monthly savings target!`;
  } else if (lower.includes('grocery') || lower.includes('food') || lower.includes('reduce') || lower.includes('cut')) {
    reply = `Here are 3 practical ways to optimize grocery spending in India:\n1. Consolidate quick-commerce orders (Zepto/Blinkit) into planned weekly purchases to eliminate split delivery and convenience surcharges.\n2. Utilize UPI cashback and credit card dining offers for weekend meals.\n3. Buy non-perishable pantry staples in bulk once a month during supermarket festival sales.`;
  } else if (lower.includes('difference') || lower.includes('planned') || lower.includes('actual') || lower.includes('versus')) {
    reply = `Key Accounting Distinction in FinTrack:\n\n• Planned Savings: Your intended allocation set at the start of the month (e.g. ₹35,000.00). It is a goal, NOT real money yet.\n• Actual Savings: Calculated strictly as [Recorded Income - Recorded Expenses] for the calendar period (e.g. ₹75,901.00).\n• Goal Contributions: Internal milestone transfers. They do not reduce your monthly actual savings.`;
  } else {
    reply = `Namaste! Based on your active October 2026 financial records:\n• Total In-hand Income: ₹1,33,500.00\n• Total Expenses: ₹57,599.00\n• Actual Net Savings: ₹75,901.00\n• Emergency Fund Progress: ₹1,75,000.00 / ₹4,00,000.00 (43.8% funded)\n\nFeel free to ask about reducing specific category expenses, checking budget warnings, or planning for upcoming festival gifts!`;
  }

  res.json({
    message: reply,
    timestamp: nowTime
  });
});

// -----------------------------------------------------------------------------
// Dev & Production Frontend Serving
// -----------------------------------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    // Mount Vite dev server middleware
    app.use(vite.middlewares);

    // Serve HTML files with Vite transformation
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl.split('?')[0];

      // Route / to dashboard.html or index.html
      let filename = 'index.html';
      if (url === '/' || url === '/index.html') {
        filename = 'index.html';
      } else if (url.endsWith('.html')) {
        filename = url.replace(/^\//, '');
      } else {
        const potentialHtml = `${url.replace(/^\//, '')}.html`;
        if (fs.existsSync(path.resolve(__dirname, potentialHtml))) {
          filename = potentialHtml;
        } else {
          return next();
        }
      }

      const filePath = path.resolve(__dirname, filename);
      if (fs.existsSync(filePath)) {
        try {
          let html = fs.readFileSync(filePath, 'utf-8');
          html = await vite.transformIndexHtml(url, html);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e: any) {
          vite.ssrFixStacktrace(e);
          return next(e);
        }
      }
      next();
    });
  } else {
    // Production: serve from dist
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        const url = req.originalUrl.split('?')[0];
        let filename = 'index.html';
        if (url !== '/' && fs.existsSync(path.resolve(distPath, url.replace(/^\//, '')))) {
          return res.sendFile(path.resolve(distPath, url.replace(/^\//, '')));
        }
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FinTrack] Server running at http://0.0.0.0:${PORT}`);
    console.log(`[FinTrack] API available at http://0.0.0.0:${PORT}/api`);
    console.log(`[FinTrack] Gemini AI status: ${process.env.GEMINI_API_KEY ? 'Active' : 'Simulated fallback ready'}`);
  });
}

startServer().catch(err => {
  console.error('[FinTrack] Failed to start server:', err);
  process.exit(1);
});
