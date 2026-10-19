# FinTrack — Personal Finance & Savings Management System (Frontend)

> A polished, professional personal finance dashboard designed for Indian users.  
> **Currency Standard**: Indian Rupees (`₹` / `INR`) with Indian numbering formatting (Lakhs & Crores).  
> **Tech Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+), Bootstrap 5.3, Chart.js 4.4, Fetch API.  
> **Backend Integration Target**: Java 21, Spring Boot 3.x, MySQL 8.x.  

---

## 1. Project Overview

FinTrack is an engineering-grade personal finance application that enables users to:
1. **Plan Monthly Budgets**: Set expected income, target savings, and category expense caps (Step 1–4 wizard).
2. **Track Actual Cash Flow**: Record manual transactions with Indian payment methods (UPI, Cash, Debit/Credit Cards, Bank Transfer).
3. **Monitor Budgets**: Live comparison of planned budget caps vs. actual outflows with 80% amber warnings and 100% overspending alerts.
4. **Track Savings Goals**: Milestones (e.g. *6-Month Emergency Safety Net*, *Diwali Gold Sovereign*) with dedicated contribution logs.
5. **Analyze Financial Reports**: Responsive Chart.js charts for Income vs. Expense, Category Breakdown, and 3-Month Savings Trends.
6. **On-Demand AI Assistant**: Chatbot panel for natural-language budgeting queries and financial literacy advice in INR.

---

## 2. Frontend Folder Structure

```
/
├── index.html                   # Primary entry point & Financial Health Dashboard
├── login.html                   # Authentication login screen with demo credentials helper
├── register.html                # User registration page with client validation
├── dashboard.html               # Main dashboard with 4 KPI widgets, charts, recent transactions
├── monthly-plan.html            # 4-step monthly budgeting wizard with live balance arithmetic
├── transactions.html            # Full searchable, filterable transaction table with pagination
├── budgets.html                 # Category budget utilization cards with warning badges
├── savings-goals.html           # Savings milestones in INR with contribution deposits
├── reports.html                 # Visual analytics with Chart.js and CSV export
├── profile.html                 # User profile settings, password update, and demo reset
├── css/
│   └── style.css                # Clean SaaS theme, deep blue palette (#1e40af), responsive layouts
├── js/
│   ├── config.js                # Global configuration, INR currency standard, system categories
│   ├── storage.js               # Mock state persistence & October 2026 default dataset
│   ├── ui.js                    # INR currency formatter (formatINR), toast alerts, date utilities
│   ├── api.js                   # Central Fetch API client with automatic offline mock failover
│   ├── navbar.js                # Sidebar navigation active state, mobile drawer, quick-add modal
│   ├── auth.js                  # Login and register form validation and token management
│   ├── dashboard.js             # Dashboard metrics, Chart.js graphs, budget alerts
│   ├── monthly-plan.js          # Monthly plan form and live allocation surplus/deficit calculator
│   ├── transactions.js          # Transaction filtering, search, pagination, add/edit/delete
│   ├── budgets.js               # Category budget progress bars and utilization calculation
│   ├── savings-goals.js         # Milestone tracking and contribution deposit logs
│   ├── reports.js               # Chart.js multi-chart reports and CSV export
│   ├── chatbot.js               # On-demand AI assistant panel with Enter/Shift+Enter support
│   └── profile.js               # User profile updater and data reset action
├── API_SPECIFICATION.md         # Complete REST API endpoint contract for Spring Boot backend
└── backend/                     # MySQL 8 Flyway migrations, Java 21 JPA entities & repositories
```

---

## 3. How to Run the Frontend

### Option A: Local Dev Server (Vite)
The project is configured with Vite serving multi-page HTML:
```bash
# 1. Install dependencies
npm install

# 2. Start dev server on port 3000
npm run dev

# 3. Open in browser:
http://localhost:3000
```

### Option B: Zero-Build Static Server / Direct Browser
Because the application uses clean HTML5, CSS3, ES6 JavaScript, and CDN-backed Bootstrap 5.3 + Chart.js, you can run it with any static server:
```bash
# Using Python:
python3 -m http.server 8000

# Using Node http-server:
npx http-server -p 8000

# Or simply open index.html or dashboard.html directly in Google Chrome / Edge!
```

### Option C: Drop Directly into Spring Boot
Copy the HTML, `css/`, and `js/` files directly into your Spring Boot project's:
```
src/main/resources/static/
```
Spring Boot will automatically serve them from `http://localhost:8080/`.

---

## 4. Configuring Spring Boot API Base URL

The API client in `js/config.js` defaults to `/api`. To configure an external Spring Boot backend URL, define `window.FINTRACK_API_URL` prior to loading scripts or edit `js/config.js`:

```javascript
// js/config.js
const FT_CONFIG = {
  API_BASE_URL: 'http://localhost:8080/api', // Point to your Spring Boot REST API
  CURRENCY_CODE: 'INR',
  CURRENCY_SYMBOL: '₹',
  LOCALE: 'en-IN',
  ...
};
```

### Seamless Offline / Online Resilience
When your Spring Boot backend is offline, `js/api.js` automatically fails over to `js/storage.js` with the October 2026 Indian dataset. Once your Spring Boot backend is started, `js/api.js` automatically executes live `fetch()` calls with Bearer tokens!

---

## 5. Indian Rupee (INR) Formatting & Accounting Invariants

1. **Format**: Every monetary amount is formatted using `en-IN` standards:
   - Examples: `₹ 1,25,000.00` (1.25 Lakhs), `₹ 35,000.00` (35K), `₹ 4,00,000.00` (4 Lakhs).
2. **Actual Savings Equation**:
   $$\text{Actual Savings} = \text{Total Recorded Income} - \text{Total Recorded Expenses}$$
   *Rule: Goal contributions are internal milestone transfers and are NOT double-subtracted from monthly actual savings.*
3. **Positive Amounts**: Manual transactions must have positive amounts ($> 0.00$), with `transactionType` determining inflow vs outflow.
