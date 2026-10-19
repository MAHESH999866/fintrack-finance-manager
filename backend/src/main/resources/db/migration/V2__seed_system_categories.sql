-- ==============================================================================
-- Flyway Migration: V2__seed_system_categories.sql
-- Project: FinTrack
-- Purpose: Seed standard built-in categories for Indian personal finance.
-- Built-in categories have user_id = NULL and is_system = TRUE.
-- All users share access to these categories.
-- ==============================================================================

INSERT INTO `expense_categories` (`user_id`, `name`, `category_type`, `is_system`, `created_at`, `updated_at`) VALUES
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
(NULL, 'Other', 'EXPENSE', TRUE, NOW(), NOW());
