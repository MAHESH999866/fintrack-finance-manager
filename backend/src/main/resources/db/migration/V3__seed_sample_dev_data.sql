-- ==============================================================================
-- Flyway Migration: V3__seed_sample_dev_data.sql
-- Project: FinTrack
-- Environment: Development & QA Only
-- Note: Clearly labeled mock financial data in Indian Rupees (INR).
-- Passwords are dummy BCrypt hashes (dummy dev credentials).
-- ==============================================================================

-- 1. Sample User (Labeled explicitly as SAMPLE DEV USER)
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `account_status`, `created_at`, `updated_at`) VALUES
(101, 'Rahul Sharma (Sample Dev User)', 'sample.dev.user@fintrack.in', '$2a$10$wEkgzWw9d3x9jQyB7l8Q.eZ3R1X9a0Qp4uO8jN6V7gB3yC1s2F5y.', 'ACTIVE', '2026-09-01 10:00:00', '2026-09-01 10:00:00');

-- 2. Custom User Category for Rahul (Sample Custom Category)
INSERT INTO `expense_categories` (`id`, `user_id`, `name`, `category_type`, `is_system`, `created_at`, `updated_at`) VALUES
(1001, 101, 'Mutual Fund SIP & Gold', 'EXPENSE', FALSE, '2026-09-01 10:30:00', '2026-09-01 10:30:00');

-- 3. Monthly Financial Plan for October 2026 (Diwali / Festive Month)
-- Expected Income: ₹1,25,000.00 (1.25 Lakhs)
-- Target Savings:  ₹35,000.00  (35K)
-- Total planned expenses: ₹90,000.00
-- Total planned allocations (Expenses + Savings) = ₹1,25,000.00 (Balanced Budget)
INSERT INTO `monthly_plans` (`id`, `user_id`, `plan_month`, `expected_income`, `target_savings`, `currency_code`, `notes`, `created_at`, `updated_at`) VALUES
(501, 101, '2026-10-01', 125000.00, 35000.00, 'INR', 'October Diwali festive budget. Targeting ₹35,000 savings into Emergency Fund.', '2026-09-30 18:00:00', '2026-09-30 18:00:00');

-- 4. Budget Categories for October 2026 Plan (ID: 501)
-- Resolving category IDs from V2 (Salary=1, Freelance=2, Inv=3, OtherInc=4, Rent=5, Food=6, Transport=7, Meds=8, Bills=9, Edu=10, Weekend=11, Shopping=12, Family=13, Other=14)
INSERT INTO `budget_categories` (`monthly_plan_id`, `category_id`, `planned_amount`, `created_at`, `updated_at`) VALUES
(501, 5, 30000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- House Rent
(501, 6, 18000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Food and Groceries
(501, 7,  6000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Transport and Petrol
(501, 8,  3000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Medicines and Healthcare
(501, 9,  8000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Bills and Utilities
(501, 11, 10000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Weekend and Entertainment
(501, 12, 12000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'), -- Shopping (Festive)
(501, 13,  3000.00, '2026-09-30 18:05:00', '2026-09-30 18:05:00'); -- Family & Personal

-- 5. Real Transactions Recorded in October 2026 (In Indian Rupees ₹)
INSERT INTO `transactions` (`id`, `user_id`, `category_id`, `transaction_type`, `amount`, `description`, `transaction_date`, `payment_method`, `notes`, `created_at`) VALUES
-- Income
(7001, 101, 1, 'INCOME', 115000.00, 'Monthly Corporate Salary Credit', '2026-10-01', 'BANK_TRANSFER', 'Net in-hand salary credited to HDFC Bank A/c', '2026-10-01 09:30:00'),
(7002, 101, 2, 'INCOME', 18500.00, 'Freelance Web Design Retainer', '2026-10-04', 'UPI', 'Received via PhonePe UPI', '2026-10-04 14:15:00'),

-- Expenses
(7003, 101, 5, 'EXPENSE', 30000.00, 'Apartment Rent (Indiranagar 2BHK)', '2026-10-02', 'BANK_TRANSFER', 'Direct NEFT to landlord', '2026-10-02 10:00:00'),
(7004, 101, 9, 'EXPENSE', 3420.00, 'BESCOM Electricity Bill', '2026-10-03', 'UPI', 'Paid via Google Pay UPI', '2026-10-03 11:20:00'),
(7005, 101, 6, 'EXPENSE', 2850.00, 'Zepto Grocery & Daily Staples', '2026-10-04', 'UPI', 'Vegetables, milk, pulses', '2026-10-04 18:40:00'),
(7006, 101, 7, 'EXPENSE', 2100.00, 'IndianOil Petrol Fill-up', '2026-10-05', 'UPI', 'Full tank for Honda City', '2026-10-05 08:30:00'),
(7007, 101, 8, 'EXPENSE', 1250.00, 'Apollo Pharmacy Prescriptions', '2026-10-06', 'DEBIT_CARD', 'Routine health check supplies', '2026-10-06 16:10:00'),
(7008, 101, 11, 'EXPENSE', 3800.00, 'Weekend Dinner at Toit Indiranagar', '2026-10-07', 'CREDIT_CARD', 'Dine-out with college friends', '2026-10-07 22:30:00'),
(7009, 101, 6, 'EXPENSE', 4600.00, 'Nature Basket Weekly Gourmet Pantry', '2026-10-09', 'UPI', 'Monthly provisions', '2026-10-09 15:00:00'),
(7010, 101, 9, 'EXPENSE', 1199.00, 'Airtel Xstream Fiber Broadband', '2026-10-10', 'UPI', 'Auto-pay via UPI mandate', '2026-10-10 09:00:00'),
(7011, 101, 12, 'EXPENSE', 8499.00, 'Amazon Great Indian Festival Shopping', '2026-10-12', 'CREDIT_CARD', 'Diwali gifts & kitchen appliances', '2026-10-12 17:45:00'),
(7012, 101, 6, 'EXPENSE', 1780.00, 'Swiggy Instamart Snack & Beverage', '2026-10-14', 'UPI', 'Quick delivery', '2026-10-14 20:10:00'),
(7013, 101, 7, 'EXPENSE', 1850.00, 'Ola & Uber Commutes to Office', '2026-10-15', 'UPI', 'Rainy day cab rides', '2026-10-15 19:30:00');

-- 6. Savings Goals (Indian Context: Emergency Fund in INR)
INSERT INTO `savings_goals` (`id`, `user_id`, `name`, `target_amount`, `current_amount`, `target_date`, `status`, `created_at`, `updated_at`) VALUES
(801, 101, '6-Month Emergency Safety Net', 400000.00, 175000.00, '2027-03-31', 'ACTIVE', '2026-08-01 10:00:00', '2026-10-05 10:15:00'),
(802, 101, 'Diwali Gold Sovereign & Gifting', 60000.00, 45000.00, '2026-11-01', 'ACTIVE', '2026-07-01 10:00:00', '2026-10-02 12:00:00');

-- 7. Savings Contributions toward Goals
INSERT INTO `savings_contributions` (`id`, `savings_goal_id`, `amount`, `contribution_date`, `description`, `created_at`) VALUES
(9001, 801, 75000.00, '2026-08-05', 'Initial fixed deposit transfer', '2026-08-05 11:00:00'),
(9002, 801, 50000.00, '2026-09-05', 'September monthly savings allocation', '2026-09-05 10:30:00'),
(9003, 801, 50000.00, '2026-10-05', 'October emergency fund transfer from salary', '2026-10-05 10:15:00'),
(9004, 802, 25000.00, '2026-08-10', 'Diwali gold token deposit', '2026-08-10 14:00:00'),
(9005, 802, 20000.00, '2026-10-02', 'Festival jewelry fund addition', '2026-10-02 12:00:00');

-- 8. Chatbot Persistent Conversation (Independent from transactions)
INSERT INTO `chatbot_conversations` (`id`, `user_id`, `title`, `created_at`, `updated_at`) VALUES
(601, 101, 'October Budget & 50-30-20 Rule in India', '2026-10-02 14:00:00', '2026-10-02 14:05:00');

-- 9. Chatbot Messages
INSERT INTO `chatbot_messages` (`conversation_id`, `role`, `content`, `metadata_json`, `created_at`) VALUES
(601, 'USER', 'Hi FinTrack! With my October in-hand income of ₹1,33,500, how should I balance my ₹30,000 rent and Diwali festival shopping?', NULL, '2026-10-02 14:00:10'),
(601, 'ASSISTANT', 'Namaste Rahul! Your Indiranagar rent of ₹30,000 constitutes roughly 22.5% of your ₹1,33,500 income, which is well below the 30% ceiling recommended by Indian financial planners. \n\nFor October: \n1. Needs (Rent, BESCOM, Groceries, Commute): ~₹55,000 (41%)\n2. Wants & Diwali Shopping: Keep shopping capped at ₹12,000-₹15,000 (11%)\n3. Savings & Emergency Fund: You can comfortably route ₹35,000 to ₹40,000 (30%) to your 6-Month Safety Net goal.\n\nWould you like me to check your current actual spending against this plan?', '{"model":"gemini-pro","tokens_in":42,"tokens_out":138}', '2026-10-02 14:00:25');
