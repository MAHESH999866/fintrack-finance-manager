/**
 * FinTrack — Global Configuration & Regional Standards
 * Standard: Indian Rupee (INR / ₹)
 */

const FT_CONFIG = {
  // Spring Boot REST API Base URL
  // In development, default to /api or http://localhost:8080/api
  API_BASE_URL: window.FINTRACK_API_URL || '/api',

  // Currency & Locale
  CURRENCY_CODE: 'INR',
  CURRENCY_SYMBOL: '₹',
  LOCALE: 'en-IN',

  // Application Details
  APP_NAME: 'FinTrack',
  VERSION: '1.0.0',

  // Budget Warning Thresholds
  BUDGET_WARNING_PCT: 80, // Amber warning at 80%
  BUDGET_DANGER_PCT: 100, // Red warning at 100%

  // Built-in Standard Categories for Indian Households
  SYSTEM_CATEGORIES: [
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
  ],

  PAYMENT_METHODS: [
    'UPI',
    'CASH',
    'DEBIT_CARD',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'OTHER'
  ]
};

// Export to window for vanilla ES6 script access
window.FT_CONFIG = FT_CONFIG;
