-- ==============================================================================
-- Flyway Migration: V1__init_schema.sql
-- Project: FinTrack (Personal Finance Management System - Indian Market)
-- Target Database: MySQL 8.x
-- Currency Standard: Indian Rupees (INR) - DECIMAL(15, 2)
-- Collation: utf8mb4_0900_ai_ci / Engine: InnoDB
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Purpose: Primary identity & authentication table.
-- Passwords must ALWAYS be BCrypt/Argon2 hashed by Spring Security.
-- Never store plaintext passwords, banking credentials, UPI PINs or OTPs.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `account_status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_users` PRIMARY KEY (`id`),
    CONSTRAINT `uk_users_email` UNIQUE (`email`),
    CONSTRAINT `chk_users_account_status` CHECK (`account_status` IN ('ACTIVE', 'SUSPENDED', 'DELETED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: expense_categories
-- Purpose: Catalog of income and expense classification tags.
-- Built-in categories: user_id IS NULL and is_system = TRUE.
-- Custom user categories: user_id = <users.id> and is_system = FALSE.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `expense_categories`;
CREATE TABLE `expense_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT DEFAULT NULL COMMENT 'NULL for system-provided built-in categories; user_id for custom categories',
    `name` VARCHAR(80) NOT NULL,
    `category_type` VARCHAR(10) NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_expense_categories` PRIMARY KEY (`id`),
    CONSTRAINT `fk_expense_categories_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_category_type` CHECK (`category_type` IN ('INCOME', 'EXPENSE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Enforce uniqueness of category name per user and category_type.
-- For system categories, user_id is NULL. In MySQL, multiple NULL values in UNIQUE keys are permitted,
-- but to prevent duplicate system categories, we add a generated virtual column or enforce it via application & partial logic.
CREATE UNIQUE INDEX `uk_user_cat_type_name` ON `expense_categories` (
    (COALESCE(`user_id`, 0)),
    `category_type`,
    `name`
);

-- ------------------------------------------------------------------------------
-- 3. Table: monthly_plans
-- Purpose: Financial blueprint for a calendar month.
-- plan_month: DATE normalized to the 1st day of the calendar month (e.g., 2026-10-01).
-- currency_code: 'INR' by default (supports Indian financial planning).
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `monthly_plans`;
CREATE TABLE `monthly_plans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `plan_month` DATE NOT NULL COMMENT 'First calendar day of the plan month (YYYY-MM-01)',
    `expected_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `target_savings` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `currency_code` CHAR(3) NOT NULL DEFAULT 'INR',
    `notes` VARCHAR(500) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_monthly_plans` PRIMARY KEY (`id`),
    CONSTRAINT `fk_monthly_plans_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uk_monthly_plan_user_month` UNIQUE (`user_id`, `plan_month`),
    CONSTRAINT `chk_plan_expected_income_non_neg` CHECK (`expected_income` >= 0.00),
    CONSTRAINT `chk_plan_target_savings_non_neg` CHECK (`target_savings` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_monthly_plans_user_date` ON `monthly_plans` (`user_id`, `plan_month`);

-- ------------------------------------------------------------------------------
-- 4. Table: budget_categories
-- Purpose: Category-level expense budget allocations within a monthly plan.
-- Note: Budget categories apply exclusively to EXPENSE categories.
-- The sum of planned_amount + target_savings should be <= expected_income.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `budget_categories`;
CREATE TABLE `budget_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `monthly_plan_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `planned_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_budget_categories` PRIMARY KEY (`id`),
    CONSTRAINT `fk_budget_cat_plan` FOREIGN KEY (`monthly_plan_id`)
        REFERENCES `monthly_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_budget_cat_category` FOREIGN KEY (`category_id`)
        REFERENCES `expense_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uk_budget_plan_category` UNIQUE (`monthly_plan_id`, `category_id`),
    CONSTRAINT `chk_budget_planned_amount_non_neg` CHECK (`planned_amount` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_budget_categories_plan` ON `budget_categories` (`monthly_plan_id`);
CREATE INDEX `idx_budget_categories_cat` ON `budget_categories` (`category_id`);

-- ------------------------------------------------------------------------------
-- 5. Table: transactions
-- Purpose: Real cash flows manually recorded by the user.
-- Positive amount strictly enforced.
-- payment_method is purely an informational classification label.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(10) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `transaction_date` DATE NOT NULL,
    `payment_method` VARCHAR(20) NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_transactions` PRIMARY KEY (`id`),
    CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`)
        REFERENCES `expense_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_tx_type` CHECK (`transaction_type` IN ('INCOME', 'EXPENSE')),
    CONSTRAINT `chk_tx_amount_positive` CHECK (`amount` > 0.00),
    CONSTRAINT `chk_tx_payment_method` CHECK (`payment_method` IN (
        'UPI', 'CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'
    ))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optimized indexes for high-frequency analytical & dashboard queries
CREATE INDEX `idx_tx_user_date` ON `transactions` (`user_id`, `transaction_date` DESC);
CREATE INDEX `idx_tx_user_type_date` ON `transactions` (`user_id`, `transaction_type`, `transaction_date`);
CREATE INDEX `idx_tx_user_cat_date` ON `transactions` (`user_id`, `category_id`, `transaction_date`);

-- ------------------------------------------------------------------------------
-- 6. Table: savings_goals
-- Purpose: Financial milestones (e.g., Emergency Fund, House Down Payment).
-- current_amount is a managed aggregate maintained via contributions.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `savings_goals`;
CREATE TABLE `savings_goals` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `target_amount` DECIMAL(15, 2) NOT NULL,
    `current_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `target_date` DATE DEFAULT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_savings_goals` PRIMARY KEY (`id`),
    CONSTRAINT `fk_savings_goals_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `chk_goal_target_amount` CHECK (`target_amount` > 0.00),
    CONSTRAINT `chk_goal_current_amount` CHECK (`current_amount` >= 0.00),
    CONSTRAINT `chk_goal_status` CHECK (`status` IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_savings_goals_user_status` ON `savings_goals` (`user_id`, `status`);

-- ------------------------------------------------------------------------------
-- 7. Table: savings_contributions
-- Purpose: Individual milestone deposits toward a savings goal.
-- Does not affect income/expense actual cash flow calculations directly.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `savings_contributions`;
CREATE TABLE `savings_contributions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `savings_goal_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `contribution_date` DATE NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_savings_contributions` PRIMARY KEY (`id`),
    CONSTRAINT `fk_savings_contrib_goal` FOREIGN KEY (`savings_goal_id`)
        REFERENCES `savings_goals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_contrib_amount_positive` CHECK (`amount` > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_savings_contrib_goal_date` ON `savings_contributions` (`savings_goal_id`, `contribution_date`);

-- ------------------------------------------------------------------------------
-- 8. Table: chatbot_conversations
-- Purpose: Root container for on-demand financial assistant chat sessions.
-- Isolated from financial transactions for security, privacy, and modularity.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `chatbot_conversations`;
CREATE TABLE `chatbot_conversations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(150) NOT NULL DEFAULT 'Financial Advisory Session',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `pk_chatbot_conversations` PRIMARY KEY (`id`),
    CONSTRAINT `fk_chatbot_conv_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_chatbot_conv_user` ON `chatbot_conversations` (`user_id`, `updated_at` DESC);

-- ------------------------------------------------------------------------------
-- 9. Table: chatbot_messages
-- Purpose: Individual prompts and model responses within a chat session.
-- Never store API keys, tokens, or credentials here.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `chatbot_messages`;
CREATE TABLE `chatbot_messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT NOT NULL,
    `role` VARCHAR(15) NOT NULL,
    `content` TEXT NOT NULL,
    `metadata_json` JSON DEFAULT NULL COMMENT 'Optional metadata such as token usage, cited categories or suggested actions',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `pk_chatbot_messages` PRIMARY KEY (`id`),
    CONSTRAINT `fk_chatbot_msg_conv` FOREIGN KEY (`conversation_id`)
        REFERENCES `chatbot_conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `chk_msg_role` CHECK (`role` IN ('USER', 'ASSISTANT', 'SYSTEM'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX `idx_chatbot_msg_conv_time` ON `chatbot_messages` (`conversation_id`, `created_at` ASC);

SET FOREIGN_KEY_CHECKS = 1;
