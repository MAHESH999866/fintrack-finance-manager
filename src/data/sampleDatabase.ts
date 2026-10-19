/**
 * FinTrack In-Memory Mock MySQL 8.x Engine & October 2026 Sample Dataset
 * All monetary values strictly in Indian Rupees (INR).
 */

export interface DbUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: number;
  user_id: number | null;
  name: string;
  category_type: 'INCOME' | 'EXPENSE';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMonthlyPlan {
  id: number;
  user_id: number;
  plan_month: string;
  expected_income: number;
  target_savings: number;
  currency_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DbBudgetCategory {
  id: number;
  monthly_plan_id: number;
  category_id: number;
  planned_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  id: number;
  user_id: number;
  category_id: number;
  transaction_type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transaction_date: string;
  payment_method: 'UPI' | 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';
  notes: string;
  created_at: string;
}

export interface DbSavingsGoal {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface DbSavingsContribution {
  id: number;
  savings_goal_id: number;
  amount: number;
  contribution_date: string;
  description: string;
  created_at: string;
}

export interface DbChatbotConversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbChatbotMessage {
  id: number;
  conversation_id: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata_json: string | null;
  created_at: string;
}

export const SAMPLE_USERS: DbUser[] = [
  {
    id: 101,
    full_name: 'Rahul Sharma (Sample Dev User)',
    email: 'sample.dev.user@fintrack.in',
    password_hash: '$2a$10$wEkgzWw9d3x9jQyB7l8Q.eZ3R1X9a0Qp4uO8jN6V7gB3yC1s2F5y.',
    account_status: 'ACTIVE',
    created_at: '2026-09-01 10:00:00',
    updated_at: '2026-09-01 10:00:00',
  },
];

export const SAMPLE_CATEGORIES: DbCategory[] = [
  // Income
  { id: 1, user_id: null, name: 'Salary', category_type: 'INCOME', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 2, user_id: null, name: 'Freelance Income', category_type: 'INCOME', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 3, user_id: null, name: 'Investment Return', category_type: 'INCOME', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 4, user_id: null, name: 'Other Income', category_type: 'INCOME', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  
  // Expenses
  { id: 5, user_id: null, name: 'House Rent', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 6, user_id: null, name: 'Food and Groceries', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 7, user_id: null, name: 'Transport and Petrol', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 8, user_id: null, name: 'Medicines and Healthcare', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 9, user_id: null, name: 'Bills and Utilities', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 10, user_id: null, name: 'Education', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 11, user_id: null, name: 'Weekend and Entertainment', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 12, user_id: null, name: 'Shopping', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 13, user_id: null, name: 'Family and Personal Expenses', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 14, user_id: null, name: 'Other', category_type: 'EXPENSE', is_system: true, created_at: '2026-08-01', updated_at: '2026-08-01' },
  { id: 1001, user_id: 101, name: 'Mutual Fund SIP & Gold', category_type: 'EXPENSE', is_system: false, created_at: '2026-09-01', updated_at: '2026-09-01' },
];

export const SAMPLE_MONTHLY_PLANS: DbMonthlyPlan[] = [
  {
    id: 501,
    user_id: 101,
    plan_month: '2026-10-01',
    expected_income: 125000.00,
    target_savings: 35000.00,
    currency_code: 'INR',
    notes: 'October Diwali festive budget. Targeting ₹35,000 savings into Emergency Fund.',
    created_at: '2026-09-30 18:00:00',
    updated_at: '2026-09-30 18:00:00',
  },
];

export const SAMPLE_BUDGET_CATEGORIES: DbBudgetCategory[] = [
  { id: 1, monthly_plan_id: 501, category_id: 5, planned_amount: 30000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 2, monthly_plan_id: 501, category_id: 6, planned_amount: 18000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 3, monthly_plan_id: 501, category_id: 7, planned_amount: 6000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 4, monthly_plan_id: 501, category_id: 8, planned_amount: 3000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 5, monthly_plan_id: 501, category_id: 9, planned_amount: 8000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 6, monthly_plan_id: 501, category_id: 11, planned_amount: 10000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 7, monthly_plan_id: 501, category_id: 12, planned_amount: 12000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
  { id: 8, monthly_plan_id: 501, category_id: 13, planned_amount: 3000.00, created_at: '2026-09-30', updated_at: '2026-09-30' },
];

export const SAMPLE_TRANSACTIONS: DbTransaction[] = [
  {
    id: 7001,
    user_id: 101,
    category_id: 1,
    transaction_type: 'INCOME',
    amount: 115000.00,
    description: 'Monthly Corporate Salary Credit',
    transaction_date: '2026-10-01',
    payment_method: 'BANK_TRANSFER',
    notes: 'Net in-hand salary credited to HDFC Bank A/c',
    created_at: '2026-10-01 09:30:00',
  },
  {
    id: 7002,
    user_id: 101,
    category_id: 2,
    transaction_type: 'INCOME',
    amount: 18500.00,
    description: 'Freelance Web Design Retainer',
    transaction_date: '2026-10-04',
    payment_method: 'UPI',
    notes: 'Received via PhonePe UPI',
    created_at: '2026-10-04 14:15:00',
  },
  {
    id: 7003,
    user_id: 101,
    category_id: 5,
    transaction_type: 'EXPENSE',
    amount: 30000.00,
    description: 'Apartment Rent (Indiranagar 2BHK)',
    transaction_date: '2026-10-02',
    payment_method: 'BANK_TRANSFER',
    notes: 'Direct NEFT to landlord',
    created_at: '2026-10-02 10:00:00',
  },
  {
    id: 7004,
    user_id: 101,
    category_id: 9,
    transaction_type: 'EXPENSE',
    amount: 3420.00,
    description: 'BESCOM Electricity Bill',
    transaction_date: '2026-10-03',
    payment_method: 'UPI',
    notes: 'Paid via Google Pay UPI',
    created_at: '2026-10-03 11:20:00',
  },
  {
    id: 7005,
    user_id: 101,
    category_id: 6,
    transaction_type: 'EXPENSE',
    amount: 2850.00,
    description: 'Zepto Grocery & Daily Staples',
    transaction_date: '2026-10-04',
    payment_method: 'UPI',
    notes: 'Vegetables, milk, pulses',
    created_at: '2026-10-04 18:40:00',
  },
  {
    id: 7006,
    user_id: 101,
    category_id: 7,
    transaction_type: 'EXPENSE',
    amount: 2100.00,
    description: 'IndianOil Petrol Fill-up',
    transaction_date: '2026-10-05',
    payment_method: 'UPI',
    notes: 'Full tank for Honda City',
    created_at: '2026-10-05 08:30:00',
  },
  {
    id: 7007,
    user_id: 101,
    category_id: 8,
    transaction_type: 'EXPENSE',
    amount: 1250.00,
    description: 'Apollo Pharmacy Prescriptions',
    transaction_date: '2026-10-06',
    payment_method: 'DEBIT_CARD',
    notes: 'Routine health check supplies',
    created_at: '2026-10-06 16:10:00',
  },
  {
    id: 7008,
    user_id: 101,
    category_id: 11,
    transaction_type: 'EXPENSE',
    amount: 3800.00,
    description: 'Weekend Dinner at Toit Indiranagar',
    transaction_date: '2026-10-07',
    payment_method: 'CREDIT_CARD',
    notes: 'Dine-out with college friends',
    created_at: '2026-10-07 22:30:00',
  },
  {
    id: 7009,
    user_id: 101,
    category_id: 6,
    transaction_type: 'EXPENSE',
    amount: 4600.00,
    description: 'Nature Basket Weekly Gourmet Pantry',
    transaction_date: '2026-10-09',
    payment_method: 'UPI',
    notes: 'Monthly provisions',
    created_at: '2026-10-09 15:00:00',
  },
  {
    id: 7010,
    user_id: 101,
    category_id: 9,
    transaction_type: 'EXPENSE',
    amount: 1199.00,
    description: 'Airtel Xstream Fiber Broadband',
    transaction_date: '2026-10-10',
    payment_method: 'UPI',
    notes: 'Auto-pay via UPI mandate',
    created_at: '2026-10-10 09:00:00',
  },
  {
    id: 7011,
    user_id: 101,
    category_id: 12,
    transaction_type: 'EXPENSE',
    amount: 8499.00,
    description: 'Amazon Great Indian Festival Shopping',
    transaction_date: '2026-10-12',
    payment_method: 'CREDIT_CARD',
    notes: 'Diwali gifts & kitchen appliances',
    created_at: '2026-10-12 17:45:00',
  },
  {
    id: 7012,
    user_id: 101,
    category_id: 6,
    transaction_type: 'EXPENSE',
    amount: 1780.00,
    description: 'Swiggy Instamart Snack & Beverage',
    transaction_date: '2026-10-14',
    payment_method: 'UPI',
    notes: 'Quick delivery',
    created_at: '2026-10-14 20:10:00',
  },
  {
    id: 7013,
    user_id: 101,
    category_id: 7,
    transaction_type: 'EXPENSE',
    amount: 1850.00,
    description: 'Ola & Uber Commutes to Office',
    transaction_date: '2026-10-15',
    payment_method: 'UPI',
    notes: 'Rainy day cab rides',
    created_at: '2026-10-15 19:30:00',
  },
];

export const SAMPLE_SAVINGS_GOALS: DbSavingsGoal[] = [
  {
    id: 801,
    user_id: 101,
    name: '6-Month Emergency Safety Net',
    target_amount: 400000.00,
    current_amount: 175000.00,
    target_date: '2027-03-31',
    status: 'ACTIVE',
    created_at: '2026-08-01 10:00:00',
    updated_at: '2026-10-05 10:15:00',
  },
  {
    id: 802,
    user_id: 101,
    name: 'Diwali Gold Sovereign & Gifting',
    target_amount: 60000.00,
    current_amount: 45000.00,
    target_date: '2026-11-01',
    status: 'ACTIVE',
    created_at: '2026-07-01 10:00:00',
    updated_at: '2026-10-02 12:00:00',
  },
];

export const SAMPLE_SAVINGS_CONTRIBUTIONS: DbSavingsContribution[] = [
  { id: 9001, savings_goal_id: 801, amount: 75000.00, contribution_date: '2026-08-05', description: 'Initial fixed deposit transfer', created_at: '2026-08-05 11:00:00' },
  { id: 9002, savings_goal_id: 801, amount: 50000.00, contribution_date: '2026-09-05', description: 'September monthly savings allocation', created_at: '2026-09-05 10:30:00' },
  { id: 9003, savings_goal_id: 801, amount: 50000.00, contribution_date: '2026-10-05', description: 'October emergency fund transfer from salary', created_at: '2026-10-05 10:15:00' },
  { id: 9004, savings_goal_id: 802, amount: 25000.00, contribution_date: '2026-08-10', description: 'Diwali gold token deposit', created_at: '2026-08-10 14:00:00' },
  { id: 9005, savings_goal_id: 802, amount: 20000.00, contribution_date: '2026-10-02', description: 'Festival jewelry fund addition', created_at: '2026-10-02 12:00:00' },
];

export const SAMPLE_CHAT_CONVERSATIONS: DbChatbotConversation[] = [
  {
    id: 601,
    user_id: 101,
    title: 'October Budget & 50-30-20 Rule in India',
    created_at: '2026-10-02 14:00:00',
    updated_at: '2026-10-02 14:05:00',
  },
];

export const SAMPLE_CHAT_MESSAGES: DbChatbotMessage[] = [
  {
    id: 1,
    conversation_id: 601,
    role: 'USER',
    content: 'Hi FinTrack! With my October in-hand income of ₹1,33,500, how should I balance my ₹30,000 rent and Diwali festival shopping?',
    metadata_json: null,
    created_at: '2026-10-02 14:00:10',
  },
  {
    id: 2,
    conversation_id: 601,
    role: 'ASSISTANT',
    content: 'Namaste Rahul! Your Indiranagar rent of ₹30,000 constitutes roughly 22.5% of your ₹1,33,500 income, which is well below the 30% ceiling recommended by Indian financial planners.\n\nFor October:\n1. Needs (Rent, BESCOM, Groceries, Commute): ~₹55,000 (41%)\n2. Wants & Diwali Shopping: Keep shopping capped at ₹12,000-₹15,000 (11%)\n3. Savings & Emergency Fund: You can comfortably route ₹35,000 to ₹40,000 (30%) to your 6-Month Safety Net goal.\n\nWould you like me to check your current actual spending against this plan?',
    metadata_json: '{"model":"gemini-pro","tokens_in":42,"tokens_out":138}',
    created_at: '2026-10-02 14:00:25',
  },
];
