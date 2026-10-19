# FinTrack — VS Code Execution & Developer Setup Guide

A complete step-by-step developer guide for running and testing **FinTrack** (Spring Boot 3 REST Backend + MySQL 8.x + HTML5/Bootstrap 5 Frontend) in **Visual Studio Code**.

---

## 1. Prerequisites Checklist

Ensure the following tools are installed on your machine:
- **Java Development Kit (JDK)**: Java 21 LTS (Oracle JDK 21 or Eclipse Temurin 21)
- **Apache Maven**: Version 3.9+ (or use the Maven wrapper)
- **MySQL Server**: MySQL 8.0 or 8.4 (running locally on port 3306)
- **Node.js**: Node 18+ or 20+ LTS (with npm)
- **Visual Studio Code**: Latest version

### Recommended VS Code Extensions:
1. **Extension Pack for Java** (Microsoft) — includes Language Support, Debugger, Maven for Java, Project Manager
2. **Spring Boot Extension Pack** (VMware) — includes Spring Boot Tools, Spring Initializr Java Support
3. **Live Server** (Ritwick Dey) — for launching static HTML frontend (optional if running Vite)
4. **Database Client** or **MySQL** (cweijan) — for querying MySQL directly within VS Code

---

## 2. Step 1: Clone & Open in VS Code

1. Open VS Code.
2. Select **File > Open Folder...** and choose the root directory of the FinTrack project.
3. Open a terminal inside VS Code: ``Ctrl + ` `` (or `Cmd + \`` on macOS).

---

## 3. Step 2: MySQL Database Setup

1. Open your terminal or MySQL Workbench:
```bash
mysql -u root -p
```

2. Run the following SQL setup script to create the database and user:
```sql
CREATE DATABASE IF NOT EXISTS fintrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'fintrack_user'@'localhost' IDENTIFIED BY 'fintrack_pass';
GRANT ALL PRIVILEGES ON fintrack_db.* TO 'fintrack_user'@'localhost';
FLUSH PRIVILEGES;
```

*(Note: Flyway will automatically execute migrations `V1__init_schema.sql`, `V2__seed_system_categories.sql`, and `V3__seed_sample_dev_data.sql` upon Spring Boot startup).*

---

## 4. Step 3: Run the Spring Boot Backend

### Option A: From VS Code Terminal
1. Navigate to the `backend` folder:
```bash
cd backend
```
2. Build and run automated tests:
```bash
mvn clean test
```
3. Start the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`.
The REST API endpoints are available under `http://localhost:8080/api`.

### Option B: Using VS Code Spring Boot Dashboard
1. Click the **Spring Boot Dashboard** icon in the VS Code Activity Bar (left sidebar).
2. Right-click **fintrack-backend** (or `FinTrackApplication`).
3. Click **Run** or **Debug**.

---

## 5. Step 4: Run the Frontend

1. Open a second terminal tab in VS Code (root directory).
2. Start the Vite development server:
```bash
npm run dev
```
3. Open your browser and navigate to:
```
http://localhost:3000
```
*(Or `http://localhost:3000/dashboard.html` / `login.html`)*

### Seamless Dual-Mode Operation:
- **With Backend Online**: The frontend makes standard Bearer JWT fetch calls to `http://localhost:8080/api`.
- **Offline / Standalone Mode**: If the Spring Boot backend is not yet started, `js/api.js` automatically activates local client persistence and realistic Indian Rupee simulation so you can explore all features with zero friction.

---

## 6. Pre-Configured Demo Credentials

Use these credentials to sign in immediately:
- **Email**: `sample.dev.user@fintrack.in` (or click "Use Demo Account" on login)
- **Password**: `SampleDevPass#2026`
- **Default Currency**: Indian Rupees (`INR` / `₹`)
- **Default Budget Month**: October 2026 (Diwali Festive Financial Plan)

---

## 7. Running Backend Unit & Integration Tests

From the `backend` directory in VS Code terminal:
```bash
# Run all unit and integration tests
mvn test

# Run a specific test class
mvn test -Dtest=MonthlyPlanServiceTest
mvn test -Dtest=TransactionServiceTest
mvn test -Dtest=AuthControllerTest
```

### Key Business Invariants Tested:
1. **Separation of Metrics**: Planned Savings, Actual Savings (`Recorded Income - Recorded Expenses`), and Remaining Budgets are strictly computed separately.
2. **Monetary Precision**: All currency calculations use `BigDecimal` with `HALF_UP` rounding at 2 decimal places.
3. **Validation**: Zero or negative transaction amounts and negative budget allocations are rejected.
4. **User Isolation**: Users can never view, mutate, or record against another user's private categories or transactions.
