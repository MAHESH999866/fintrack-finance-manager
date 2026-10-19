/**
 * Complete registry of backend code files for FinTrack.
 * These match the files written in /backend/ directory and are available
 * for instant preview, search, copy, and ZIP package export.
 */

export interface BackendFile {
  path: string;
  name: string;
  category: 'Migration' | 'Entity' | 'Repository' | 'Enum' | 'DTO' | 'Config' | 'Documentation';
  language: 'sql' | 'java' | 'yaml' | 'markdown';
  description: string;
  content: string;
}

export const BACKEND_FILES: BackendFile[] = [
  {
    path: 'src/main/resources/db/migration/V1__init_schema.sql',
    name: 'V1__init_schema.sql',
    category: 'Migration',
    language: 'sql',
    description: 'Flyway migration creating all 8 tables with foreign keys, checks, and composite indexes in MySQL 8.x.',
    content: `-- ==============================================================================
-- Flyway Migration: V1__init_schema.sql
-- Project: FinTrack (Personal Finance Management System - Indian Market)
-- Target Database: MySQL 8.x
-- Currency Standard: Indian Rupees (INR) - DECIMAL(15, 2)
-- Collation: utf8mb4_0900_ai_ci / Engine: InnoDB
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: users
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`full_name\` VARCHAR(100) NOT NULL,
    \`email\` VARCHAR(150) NOT NULL,
    \`password_hash\` VARCHAR(255) NOT NULL,
    \`account_status\` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_users\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`uk_users_email\` UNIQUE (\`email\`),
    CONSTRAINT \`chk_users_account_status\` CHECK (\`account_status\` IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Table: expense_categories
DROP TABLE IF EXISTS \`expense_categories\`;
CREATE TABLE \`expense_categories\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT DEFAULT NULL COMMENT 'NULL for system categories; user_id for custom categories',
    \`name\` VARCHAR(80) NOT NULL,
    \`category_type\` VARCHAR(10) NOT NULL,
    \`is_system\` BOOLEAN NOT NULL DEFAULT FALSE,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_expense_categories\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_expense_categories_user\` FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`chk_category_type\` CHECK (\`category_type\` IN ('INCOME', 'EXPENSE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE UNIQUE INDEX \`uk_user_cat_type_name\` ON \`expense_categories\` (
    (COALESCE(\`user_id\`, 0)),
    \`category_type\`,
    \`name\`
);

-- 3. Table: monthly_plans
DROP TABLE IF EXISTS \`monthly_plans\`;
CREATE TABLE \`monthly_plans\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`plan_month\` DATE NOT NULL COMMENT 'First calendar day of the plan month (YYYY-MM-01)',
    \`expected_income\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    \`target_savings\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    \`currency_code\` CHAR(3) NOT NULL DEFAULT 'INR',
    \`notes\` VARCHAR(500) DEFAULT NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_monthly_plans\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_monthly_plans_user\` FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`uk_monthly_plan_user_month\` UNIQUE (\`user_id\`, \`plan_month\`),
    CONSTRAINT \`chk_plan_expected_income_non_neg\` CHECK (\`expected_income\` >= 0.00),
    CONSTRAINT \`chk_plan_target_savings_non_neg\` CHECK (\`target_savings\` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_monthly_plans_user_date\` ON \`monthly_plans\` (\`user_id\`, \`plan_month\`);

-- 4. Table: budget_categories
DROP TABLE IF EXISTS \`budget_categories\`;
CREATE TABLE \`budget_categories\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`monthly_plan_id\` BIGINT NOT NULL,
    \`category_id\` BIGINT NOT NULL,
    \`planned_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_budget_categories\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_budget_cat_plan\` FOREIGN KEY (\`monthly_plan_id\`)
        REFERENCES \`monthly_plans\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`fk_budget_cat_category\` FOREIGN KEY (\`category_id\`)
        REFERENCES \`expense_categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`uk_budget_plan_category\` UNIQUE (\`monthly_plan_id\`, \`category_id\`),
    CONSTRAINT \`chk_budget_planned_amount_non_neg\` CHECK (\`planned_amount\` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_budget_categories_plan\` ON \`budget_categories\` (\`monthly_plan_id\`);
CREATE INDEX \`idx_budget_categories_cat\` ON \`budget_categories\` (\`category_id\`);

-- 5. Table: transactions
DROP TABLE IF EXISTS \`transactions\`;
CREATE TABLE \`transactions\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`category_id\` BIGINT NOT NULL,
    \`transaction_type\` VARCHAR(10) NOT NULL,
    \`amount\` DECIMAL(15, 2) NOT NULL,
    \`description\` VARCHAR(255) NOT NULL,
    \`transaction_date\` DATE NOT NULL,
    \`payment_method\` VARCHAR(20) NOT NULL,
    \`notes\` TEXT DEFAULT NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_transactions\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_transactions_user\` FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`fk_transactions_category\` FOREIGN KEY (\`category_id\`)
        REFERENCES \`expense_categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`chk_tx_type\` CHECK (\`transaction_type\` IN ('INCOME', 'EXPENSE')),
    CONSTRAINT \`chk_tx_amount_positive\` CHECK (\`amount\` > 0.00),
    CONSTRAINT \`chk_tx_payment_method\` CHECK (\`payment_method\` IN (
        'UPI', 'CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_tx_user_date\` ON \`transactions\` (\`user_id\`, \`transaction_date\` DESC);
CREATE INDEX \`idx_tx_user_type_date\` ON \`transactions\` (\`user_id\`, \`transaction_type\`, \`transaction_date\`);
CREATE INDEX \`idx_tx_user_cat_date\` ON \`transactions\` (\`user_id\`, \`category_id\`, \`transaction_date\`);

-- 6. Table: savings_goals
DROP TABLE IF EXISTS \`savings_goals\`;
CREATE TABLE \`savings_goals\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`name\` VARCHAR(120) NOT NULL,
    \`target_amount\` DECIMAL(15, 2) NOT NULL,
    \`current_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    \`target_date\` DATE DEFAULT NULL,
    \`status\` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_savings_goals\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_savings_goals_user\` FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT \`chk_goal_target_amount\` CHECK (\`target_amount\` > 0.00),
    CONSTRAINT \`chk_goal_current_amount\` CHECK (\`current_amount\` >= 0.00),
    CONSTRAINT \`chk_goal_status\` CHECK (\`status\` IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_savings_goals_user_status\` ON \`savings_goals\` (\`user_id\`, \`status\`);

-- 7. Table: savings_contributions
DROP TABLE IF EXISTS \`savings_contributions\`;
CREATE TABLE \`savings_contributions\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`savings_goal_id\` BIGINT NOT NULL,
    \`amount\` DECIMAL(15, 2) NOT NULL,
    \`contribution_date\` DATE NOT NULL,
    \`description\` VARCHAR(255) DEFAULT NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_savings_contributions\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_savings_contrib_goal\` FOREIGN KEY (\`savings_goal_id\`)
        REFERENCES \`savings_goals\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`chk_contrib_amount_positive\` CHECK (\`amount\` > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_savings_contrib_goal_date\` ON \`savings_contributions\` (\`savings_goal_id\`, \`contribution_date\`);

-- 8. Table: chatbot_conversations
DROP TABLE IF EXISTS \`chatbot_conversations\`;
CREATE TABLE \`chatbot_conversations\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`user_id\` BIGINT NOT NULL,
    \`title\` VARCHAR(150) NOT NULL DEFAULT 'Financial Advisory Session',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_chatbot_conversations\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_chatbot_conv_user\` FOREIGN KEY (\`user_id\`)
        REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_chatbot_conv_user\` ON \`chatbot_conversations\` (\`user_id\`, \`updated_at\` DESC);

-- 9. Table: chatbot_messages
DROP TABLE IF EXISTS \`chatbot_messages\`;
CREATE TABLE \`chatbot_messages\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`conversation_id\` BIGINT NOT NULL,
    \`role\` VARCHAR(15) NOT NULL,
    \`content\` TEXT NOT NULL,
    \`metadata_json\` JSON DEFAULT NULL COMMENT 'Optional metadata such as token usage',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`pk_chatbot_messages\` PRIMARY KEY (\`id\`),
    CONSTRAINT \`fk_chatbot_msg_conv\` FOREIGN KEY (\`conversation_id\`)
        REFERENCES \`chatbot_conversations\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`chk_msg_role\` CHECK (\`role\` IN ('USER', 'ASSISTANT', 'SYSTEM'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX \`idx_chatbot_msg_conv_time\` ON \`chatbot_messages\` (\`conversation_id\`, \`created_at\` ASC);

SET FOREIGN_KEY_CHECKS = 1;`
  },
  {
    path: 'src/main/resources/db/migration/V2__seed_system_categories.sql',
    name: 'V2__seed_system_categories.sql',
    category: 'Migration',
    language: 'sql',
    description: 'Flyway migration seeding standard Indian income and expense classification categories.',
    content: `-- Seed standard built-in categories for Indian personal finance
INSERT INTO \`expense_categories\` (\`user_id\`, \`name\`, \`category_type\`, \`is_system\`, \`created_at\`, \`updated_at\`) VALUES
-- Income Categories
(NULL, 'Salary', 'INCOME', TRUE, NOW(), NOW()),
(NULL, 'Freelance Income', 'INCOME', TRUE, NOW(), NOW()),
(NULL, 'Investment Return', 'INCOME', TRUE, NOW(), NOW()),
(NULL, 'Other Income', 'INCOME', TRUE, NOW(), NOW()),

-- Expense Categories
(NULL, 'House Rent', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Food and Groceries', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Transport and Petrol', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Medicines and Healthcare', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Bills and Utilities', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Education', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Weekend and Entertainment', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Shopping', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Family and Personal Expenses', 'EXPENSE', TRUE, NOW(), NOW()),
(NULL, 'Other', 'EXPENSE', TRUE, NOW(), NOW());`
  },
  {
    path: 'src/main/resources/db/migration/V3__seed_sample_dev_data.sql',
    name: 'V3__seed_sample_dev_data.sql',
    category: 'Migration',
    language: 'sql',
    description: 'Dev/QA sample data for Indian user Rahul Sharma in Bengaluru (INR amounts).',
    content: `-- Dev and QA sample dataset in Indian Rupees (INR)
INSERT INTO \`users\` (\`id\`, \`full_name\`, \`email\`, \`password_hash\`, \`account_status\`) VALUES
(101, 'Rahul Sharma (Sample Dev User)', 'sample.dev.user@fintrack.in', '$2a$10$wEkgzWw9d3x9jQyB7l8Q.eZ3R1X9a0Qp4uO8jN6V7gB3yC1s2F5y.', 'ACTIVE');

INSERT INTO \`monthly_plans\` (\`id\`, \`user_id\`, \`plan_month\`, \`expected_income\`, \`target_savings\`, \`currency_code\`, \`notes\`) VALUES
(501, 101, '2026-10-01', 125000.00, 35000.00, 'INR', 'October Diwali festive budget. Targeting ₹35,000 savings into Emergency Fund.');

INSERT INTO \`budget_categories\` (\`monthly_plan_id\`, \`category_id\`, \`planned_amount\`) VALUES
(501, 5, 30000.00), -- House Rent
(501, 6, 18000.00), -- Food and Groceries
(501, 7,  6000.00), -- Transport and Petrol
(501, 8,  3000.00), -- Medicines and Healthcare
(501, 9,  8000.00), -- Bills and Utilities
(501, 11, 10000.00), -- Weekend and Entertainment
(501, 12, 12000.00), -- Shopping
(501, 13,  3000.00); -- Family & Personal`
  },
  {
    path: 'src/main/java/com/fintrack/entity/User.java',
    name: 'User.java',
    category: 'Entity',
    language: 'java',
    description: 'User JPA entity with unique email constraint and secure password hashing protection.',
    content: `package com.fintrack.entity;

import com.fintrack.enums.AccountStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = {"email"})
    }
)
public class User extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    public User() {}

    public User(String fullName, String email, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.accountStatus = AccountStatus.ACTIVE;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }
}`
  },
  {
    path: 'src/main/java/com/fintrack/entity/MonthlyPlan.java',
    name: 'MonthlyPlan.java',
    category: 'Entity',
    language: 'java',
    description: 'MonthlyPlan JPA entity with YYYY-MM-01 normalized date, INR BigDecimal targets, and UK constraint.',
    content: `package com.fintrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "monthly_plans",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_monthly_plan_user_month", columnNames = {"user_id", "plan_month"})
    },
    indexes = {
        @Index(name = "idx_monthly_plans_user_date", columnList = "user_id, plan_month")
    }
)
public class MonthlyPlan extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_monthly_plans_user"))
    private User user;

    @NotNull
    @Column(name = "plan_month", nullable = false)
    private LocalDate planMonth;

    @NotNull
    @DecimalMin(value = "0.00", message = "Expected income cannot be negative")
    @Column(name = "expected_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal expectedIncome = BigDecimal.ZERO.setScale(2);

    @NotNull
    @DecimalMin(value = "0.00", message = "Target savings cannot be negative")
    @Column(name = "target_savings", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetSavings = BigDecimal.ZERO.setScale(2);

    @NotNull
    @Size(min = 3, max = 3)
    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "INR";

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @OneToMany(mappedBy = "monthlyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BudgetCategory> budgetCategories = new ArrayList<>();

    public MonthlyPlan() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDate getPlanMonth() { return planMonth; }
    public void setPlanMonth(LocalDate planMonth) { this.planMonth = planMonth != null ? planMonth.withDayOfMonth(1) : null; }
    public BigDecimal getExpectedIncome() { return expectedIncome; }
    public void setExpectedIncome(BigDecimal expectedIncome) { this.expectedIncome = expectedIncome != null ? expectedIncome.setScale(2) : BigDecimal.ZERO.setScale(2); }
    public BigDecimal getTargetSavings() { return targetSavings; }
    public void setTargetSavings(BigDecimal targetSavings) { this.targetSavings = targetSavings != null ? targetSavings.setScale(2) : BigDecimal.ZERO.setScale(2); }
    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<BudgetCategory> getBudgetCategories() { return budgetCategories; }
    public void setBudgetCategories(List<BudgetCategory> budgetCategories) { this.budgetCategories = budgetCategories; }
}`
  },
  {
    path: 'src/main/java/com/fintrack/entity/Transaction.java',
    name: 'Transaction.java',
    category: 'Entity',
    language: 'java',
    description: 'Transaction JPA entity with strictly positive INR amounts, paymentMethod enum, and analytical indexes.',
    content: `package com.fintrack.entity;

import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(
    name = "transactions",
    indexes = {
        @Index(name = "idx_tx_user_date", columnList = "user_id, transaction_date DESC"),
        @Index(name = "idx_tx_user_type_date", columnList = "user_id, transaction_type, transaction_date"),
        @Index(name = "idx_tx_user_cat_date", columnList = "user_id, category_id, transaction_date")
    }
)
public class Transaction extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transactions_user"))
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transactions_category"))
    private ExpenseCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 10)
    private TransactionType transactionType;

    @NotNull
    @DecimalMin(value = "0.01", message = "Transaction amount must be greater than zero")
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotBlank
    @Size(max = 255)
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public Transaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }
    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount != null ? amount.setScale(2) : null; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}`
  },
  {
    path: 'src/main/java/com/fintrack/repository/TransactionRepository.java',
    name: 'TransactionRepository.java',
    category: 'Repository',
    language: 'java',
    description: 'Spring Data JPA repository containing reporting queries, user-scoped sums, and JPQL DTO projections.',
    content: `package com.fintrack.repository;

import com.fintrack.dto.CategorySpendingReportDto;
import com.fintrack.dto.DailyExpenseTrendDto;
import com.fintrack.entity.Transaction;
import com.fintrack.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT COALESCE(SUM(t.amount), 0.00)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionType = :transactionType
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
    """)
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("transactionType") TransactionType transactionType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT new com.fintrack.dto.CategorySpendingReportDto(
            c.id, c.name, c.categoryType, SUM(t.amount), COUNT(t.id)
        )
        FROM Transaction t
        JOIN t.category c
        WHERE t.user.id = :userId
          AND t.transactionType = :transactionType
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
        GROUP BY c.id, c.name, c.categoryType
        ORDER BY SUM(t.amount) DESC
    """)
    List<CategorySpendingReportDto> findCategorySpendingReport(
        @Param("userId") Long userId,
        @Param("transactionType") TransactionType transactionType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT new com.fintrack.dto.DailyExpenseTrendDto(
            t.transactionDate, SUM(t.amount), COUNT(t.id)
        )
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionType = 'EXPENSE'
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
        GROUP BY t.transactionDate
        ORDER BY t.transactionDate ASC
    """)
    List<DailyExpenseTrendDto> findDailyExpenseTrend(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    List<Transaction> findTop10ByUserIdOrderByTransactionDateDescIdDesc(Long userId);
}`
  },
  {
    path: 'src/main/resources/application.yml',
    name: 'application.yml',
    category: 'Config',
    language: 'yaml',
    description: 'Spring Boot 3.x configuration with MySQL 8.x HikariCP, Flyway, and Hibernate validate mode.',
    content: `spring:
  application:
    name: fintrack-core-api
  datasource:
    url: jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:fintrack_db}?useSSL=false&serverTimezone=Asia/Kolkata&characterEncoding=UTF-8
    username: \${DB_USERNAME:fintrack_user}
    password: \${DB_PASSWORD:fintrack_pass}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 15
      minimum-idle: 5
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
  jpa:
    database: mysql
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 30

fintrack:
  currency:
    default-code: INR
    symbol: "₹"
    decimal-scale: 2
  timezone: Asia/Kolkata`
  },
  {
    path: 'backend/README.md',
    name: 'README.md',
    category: 'Documentation',
    language: 'markdown',
    description: 'Complete MySQL setup instructions, Docker command, Flyway execution, and INR guidelines.',
    content: `# FinTrack Backend Database & Persistence Guide

## Quick MySQL 8 Docker Setup
\`\`\`bash
docker run -d \\
  --name fintrack-mysql \\
  -p 3306:3306 \\
  -e MYSQL_DATABASE=fintrack_db \\
  -e MYSQL_USER=fintrack_user \\
  -e MYSQL_PASSWORD=fintrack_secure_pass_2026 \\
  -e MYSQL_ROOT_PASSWORD=root_secure_password \\
  mysql:8.4 --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci
\`\`\`

## Flyway Migration Order
1. V1__init_schema.sql
2. V2__seed_system_categories.sql
3. V3__seed_sample_dev_data.sql`
  }
];
