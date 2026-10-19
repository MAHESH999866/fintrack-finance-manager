# FinTrack Backend Database & Persistence Guide

Welcome to the backend persistence layer for **FinTrack** — the personal finance management platform tailored for Indian users.

---

## 1. Prerequisites

- **Java**: Java 21 LTS (or 23)
- **Spring Boot**: 3.2.x or 3.3.x
- **Database**: MySQL 8.0 or 8.4 LTS
- **Build Tool**: Maven 3.9+ or Gradle 8+
- **Database Migration**: Flyway (bundled with Spring Boot)

---

## 2. MySQL Database Setup

### Step 1: Create Database and User
Log into your MySQL console as root:

```bash
mysql -u root -p
```

Execute the initialization script:

```sql
CREATE DATABASE IF NOT EXISTS fintrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'fintrack_user'@'localhost' IDENTIFIED BY 'fintrack_secure_pass_2026';
CREATE USER IF NOT EXISTS 'fintrack_user'@'%' IDENTIFIED BY 'fintrack_secure_pass_2026';

GRANT ALL PRIVILEGES ON fintrack_db.* TO 'fintrack_user'@'localhost';
GRANT ALL PRIVILEGES ON fintrack_db.* TO 'fintrack_user'@'%';

FLUSH PRIVILEGES;
```

### Docker Quickstart (Recommended for Local Dev)
```bash
docker run -d \
  --name fintrack-mysql \
  -p 3306:3306 \
  -e MYSQL_DATABASE=fintrack_db \
  -e MYSQL_USER=fintrack_user \
  -e MYSQL_PASSWORD=fintrack_secure_pass_2026 \
  -e MYSQL_ROOT_PASSWORD=root_secure_password \
  mysql:8.4 --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci
```

---

## 3. Flyway Migration Strategy

FinTrack organizes schema evolution via strict Flyway versioned scripts in `src/main/resources/db/migration/`:

1. `V1__init_schema.sql`: Creates all 8 normalized tables with foreign keys, checks, and compound indexes.
2. `V2__seed_system_categories.sql`: Seeds 14 built-in system categories (Rent, Groceries, Petrol, BESCOM Bills, Salary, etc.).
3. `V3__seed_sample_dev_data.sql`: (Dev/QA only) Sample Indian financial record set for testing.

To run migrations automatically on Spring Boot launch, keep `spring.flyway.enabled=true` in `application.yml`.

To run manually via Maven:
```bash
./mvnw flyway:migrate
```

---

## 4. Key Rules for Backend Developers

1. **Strict Indian Rupee (INR) Monetary Standards**:
   - In MySQL: Always `DECIMAL(15, 2)`.
   - In Java: Always `java.math.BigDecimal` initialized with `.setScale(2, RoundingMode.HALF_UP)`.
   - **Never** use `float` or `double` for currency amounts.

2. **Indian Number System Formatting**:
   - Use `java.text.NumberFormat.getCurrencyInstance(new Locale("en", "IN"))` when rendering values to frontend.
   - Example: `₹1,25,000.00` (1.25 Lakhs) and `₹1,50,00,000.00` (1.5 Crores).

3. **User Scoping & Isolation**:
   - Every read and write repository method must be scoped to the authenticated user ID (`where user.id = :userId`).
   - Cross-user data leaks are strictly prohibited.

4. **Actual Savings Calculation**:
   $$\text{Actual Savings} = \text{Total Recorded Income} - \text{Total Recorded Expenses}$$
   - **Do NOT** subtract savings goal contributions again! Goal contributions represent internal transfers to savings milestones, not real expense outflows.

5. **Hibernate DDL Configuration**:
   - In production and development, keep `spring.jpa.hibernate.ddl-auto=validate`.
   - Flyway is the single source of truth for database schema migrations.
