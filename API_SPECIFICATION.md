# FinTrack — Spring Boot REST API Endpoint Specification

> **Base URL**: `/api` (or configured via `window.FINTRACK_API_URL`)  
> **Authentication**: `Authorization: Bearer <JWT_TOKEN>`  
> **Content-Type**: `application/json; charset=UTF-8`  
> **Currency Standard**: Indian Rupee (`INR` / `₹`), `DECIMAL(15, 2)` / `BigDecimal(scale=2)`  

---

## 1. Authentication & User Management

### 1.1 User Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul.sharma@fintrack.in",
  "password": "SecurePassword123"
}
```
- **Response `201 Created`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 101,
    "fullName": "Rahul Sharma",
    "email": "rahul.sharma@fintrack.in",
    "accountStatus": "ACTIVE",
    "currency": "INR",
    "createdAt": "2026-10-01T10:00:00Z"
  }
}
```

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "rahul.sharma@fintrack.in",
  "password": "SecurePassword123"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 101,
    "fullName": "Rahul Sharma",
    "email": "rahul.sharma@fintrack.in",
    "accountStatus": "ACTIVE",
    "currency": "INR"
  }
}
```

### 1.3 Get Current User Profile
- **Endpoint**: `GET /api/users/me`
- **Response `200 OK`**:
```json
{
  "id": 101,
  "fullName": "Rahul Sharma",
  "email": "rahul.sharma@fintrack.in",
  "accountStatus": "ACTIVE",
  "currency": "INR"
}
```

---

## 2. Monthly Financial Plans & Budgets

### 2.1 Get Monthly Plan
- **Endpoint**: `GET /api/monthly-plans?month=2026-10`
- **Response `200 OK`**:
```json
{
  "id": 501,
  "userId": 101,
  "planMonth": "2026-10-01",
  "expectedIncome": 125000.00,
  "targetSavings": 35000.00,
  "currencyCode": "INR",
  "notes": "October Diwali festive plan. Targeting ₹35,000 savings towards Emergency Fund.",
  "budgets": [
    { "categoryId": 5, "plannedAmount": 30000.00 },
    { "categoryId": 6, "plannedAmount": 18000.00 },
    { "categoryId": 7, "plannedAmount": 6000.00 },
    { "categoryId": 8, "plannedAmount": 3000.00 },
    { "categoryId": 9, "plannedAmount": 8000.00 },
    { "categoryId": 11, "plannedAmount": 10000.00 },
    { "categoryId": 12, "plannedAmount": 12000.00 },
    { "categoryId": 13, "plannedAmount": 3000.00 }
  ]
}
```

### 2.2 Create or Update Monthly Plan
- **Endpoint**: `POST /api/monthly-plans`
- **Request Body**:
```json
{
  "planMonth": "2026-10-01",
  "expectedIncome": 125000.00,
  "targetSavings": 35000.00,
  "currencyCode": "INR",
  "notes": "October festive plan.",
  "budgets": [
    { "categoryId": 5, "plannedAmount": 30000.00 },
    { "categoryId": 6, "plannedAmount": 18000.00 }
  ]
}
```
- **Response `200 OK`**: (Returns created/updated MonthlyPlan entity)

### 2.3 Get Budget Utilization
- **Endpoint**: `GET /api/budgets?month=2026-10`
- **Response `200 OK`**:
```json
{
  "planMonth": "2026-10-01",
  "expectedIncome": 125000.00,
  "targetSavings": 35000.00,
  "budgets": [
    {
      "categoryId": 5,
      "categoryName": "House Rent",
      "plannedAmount": 30000.00,
      "actualSpent": 30000.00,
      "remainingAmount": 0.00,
      "usagePercentage": 100.00
    },
    {
      "categoryId": 6,
      "categoryName": "Food and Groceries",
      "plannedAmount": 18000.00,
      "actualSpent": 9230.00,
      "remainingAmount": 8770.00,
      "usagePercentage": 51.28
    }
  ]
}
```

---

## 3. Financial Transactions

### 3.1 Get All User Transactions
- **Endpoint**: `GET /api/transactions`
- **Query Parameters**: `?month=2026-10&type=EXPENSE&categoryId=5`
- **Response `200 OK`**:
```json
[
  {
    "id": 7001,
    "userId": 101,
    "categoryId": 1,
    "transactionType": "INCOME",
    "amount": 115000.00,
    "description": "Monthly Corporate Salary Credit",
    "transactionDate": "2026-10-01",
    "paymentMethod": "BANK_TRANSFER",
    "notes": "Net in-hand salary credited to HDFC Bank A/c"
  },
  {
    "id": 7003,
    "userId": 101,
    "categoryId": 5,
    "transactionType": "EXPENSE",
    "amount": 30000.00,
    "description": "Apartment Rent (Indiranagar 2BHK)",
    "transactionDate": "2026-10-02",
    "paymentMethod": "BANK_TRANSFER",
    "notes": "Direct NEFT to landlord"
  }
]
```

### 3.2 Create Manual Transaction
- **Endpoint**: `POST /api/transactions`
- **Request Body**:
```json
{
  "amount": 2850.00,
  "description": "Zepto Grocery Staples",
  "transactionType": "EXPENSE",
  "categoryId": 6,
  "paymentMethod": "UPI",
  "transactionDate": "2026-10-04",
  "notes": "Vegetables, milk, pulses"
}
```
- **Response `201 Created`**: Returns created Transaction JSON with generated `id`.

### 3.3 Delete Transaction
- **Endpoint**: `DELETE /api/transactions/{id}`
- **Response `204 No Content`**

---

## 4. Savings Goals & Contributions

### 4.1 Get All Goals
- **Endpoint**: `GET /api/savings-goals`
- **Response `200 OK`**:
```json
[
  {
    "id": 801,
    "userId": 101,
    "name": "6-Month Emergency Safety Net",
    "targetAmount": 400000.00,
    "currentAmount": 175000.00,
    "targetDate": "2027-03-31",
    "status": "ACTIVE"
  }
]
```

### 4.2 Record Milestone Deposit / Contribution
- **Endpoint**: `POST /api/savings-goals/contributions`
- **Request Body**:
```json
{
  "savingsGoalId": 801,
  "amount": 50000.00,
  "contributionDate": "2026-10-05",
  "description": "October emergency fund transfer from salary"
}
```
- **Response `201 Created`**

---

## 5. Reports Summary

### 5.1 Monthly High-Level Aggregate Summary
- **Endpoint**: `GET /api/reports/summary?month=2026-10`
- **Response `200 OK`**:
```json
{
  "month": "2026-10",
  "totalIncome": 133500.00,
  "totalExpense": 57599.00,
  "actualSavings": 75901.00,
  "expectedIncome": 125000.00,
  "targetSavings": 35000.00,
  "totalBudgeted": 90000.00
}
```
*Note: `actualSavings` = `totalIncome` - `totalExpense`. Contributions are NOT double-subtracted.*

---

## 6. On-Demand AI Finance Assistant

### 6.1 Send Query to AI Advisory Service
- **Endpoint**: `POST /api/chat`
- **Request Body**:
```json
{
  "message": "How much have I spent this month and how is my grocery budget?"
}
```
- **Response `200 OK`**:
```json
{
  "message": "In October 2026, your total recorded expenses are ₹57,599.00. Your grocery spending is ₹9,230.00 (51.3% of your ₹18,000 cap). You are pacing well within budget limits.",
  "timestamp": "02:15 PM"
}
```

---

## 7. Error Format Specification

All non-2xx error responses must follow RFC 7807 problem details:
```json
{
  "timestamp": "2026-10-16T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Transaction amount must be strictly positive (> 0.00)",
  "path": "/api/transactions"
}
```
