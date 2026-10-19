export interface TableColumn {
  name: string;
  type: string;
  javaType: string;
  nullable: boolean;
  isPk?: boolean;
  isFk?: boolean;
  references?: string;
  isUnique?: boolean;
  defaultValue?: string;
  description: string;
}

export interface TableIndex {
  name: string;
  columns: string[];
  isUnique: boolean;
  purpose: string;
}

export interface TableConstraint {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  definition: string;
}

export interface SchemaTable {
  id: string;
  name: string;
  entityName: string;
  description: string;
  category: 'Identity' | 'Classification' | 'Budgeting' | 'Ledger' | 'Goals' | 'Assistant';
  columns: TableColumn[];
  indexes: TableIndex[];
  constraints: TableConstraint[];
  cardinalityNotes: string;
}

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    id: 'users',
    name: 'users',
    entityName: 'User.java',
    category: 'Identity',
    description: 'Core user profile and authentication credentials. Stores BCrypt password hashes; sensitive banking credentials, UPI PINs, or OTPs are strictly forbidden.',
    cardinalityNotes: 'One user owns many monthly plans, transactions, savings goals, custom categories, and chatbot conversations.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'full_name', type: 'VARCHAR(100)', javaType: 'String', nullable: false, description: 'User display name (e.g. Rahul Sharma)' },
      { name: 'email', type: 'VARCHAR(150)', javaType: 'String', nullable: false, isUnique: true, description: 'Unique login email address' },
      { name: 'password_hash', type: 'VARCHAR(255)', javaType: 'String', nullable: false, description: 'BCrypt / Argon2 hashed password (never plaintext)' },
      { name: 'account_status', type: 'VARCHAR(20)', javaType: 'AccountStatus', nullable: false, defaultValue: "'ACTIVE'", description: 'Lifecycle state: ACTIVE, SUSPENDED, DELETED' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit record creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit record modification timestamp' },
    ],
    indexes: [
      { name: 'uk_users_email', columns: ['email'], isUnique: true, purpose: 'Fast authentication lookups and email uniqueness' },
    ],
    constraints: [
      { name: 'pk_users', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'uk_users_email', type: 'UNIQUE', definition: 'UNIQUE (`email`)' },
      { name: 'chk_users_account_status', type: 'CHECK', definition: 'CHECK (`account_status` IN (\'ACTIVE\', \'SUSPENDED\', \'DELETED\'))' },
    ],
  },
  {
    id: 'expense_categories',
    name: 'expense_categories',
    entityName: 'ExpenseCategory.java',
    category: 'Classification',
    description: 'Income and expense classification categories. Built-in categories (user_id IS NULL, is_system = TRUE) are shared across all users. Custom categories (user_id != NULL) belong to specific users.',
    cardinalityNotes: 'Referenced by budget_categories and transactions. ON DELETE RESTRICT prevents deleting categories with transaction history.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'user_id', type: 'BIGINT', javaType: 'User', nullable: true, isFk: true, references: 'users(id)', description: 'NULL for system categories; User ID for user-created custom categories' },
      { name: 'name', type: 'VARCHAR(80)', javaType: 'String', nullable: false, description: 'Category name (e.g. House Rent, Food & Groceries, Salary)' },
      { name: 'category_type', type: 'VARCHAR(10)', javaType: 'CategoryType', nullable: false, description: 'Classification type: INCOME or EXPENSE' },
      { name: 'is_system', type: 'BOOLEAN', javaType: 'boolean', nullable: false, defaultValue: 'FALSE', description: 'TRUE for standard Indian default categories' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit update timestamp' },
    ],
    indexes: [
      { name: 'uk_user_cat_type_name', columns: ['COALESCE(user_id, 0)', 'category_type', 'name'], isUnique: true, purpose: 'Prevents duplicate category names per scope' },
      { name: 'fk_expense_categories_user', columns: ['user_id'], isUnique: false, purpose: 'Foreign key index for user-owned custom categories' },
    ],
    constraints: [
      { name: 'pk_expense_categories', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_expense_categories_user', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT' },
      { name: 'chk_category_type', type: 'CHECK', definition: 'CHECK (`category_type` IN (\'INCOME\', \'EXPENSE\'))' },
    ],
  },
  {
    id: 'monthly_plans',
    name: 'monthly_plans',
    entityName: 'MonthlyPlan.java',
    category: 'Budgeting',
    description: 'Monthly financial master plan for a specific calendar month. Stores expected income and target savings in Indian Rupees (INR).',
    cardinalityNotes: 'One user has at most one monthly plan per calendar month (enforced via unique constraint). Contains many budget_categories.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'user_id', type: 'BIGINT', javaType: 'User', nullable: false, isFk: true, references: 'users(id)', description: 'Owner user ID' },
      { name: 'plan_month', type: 'DATE', javaType: 'LocalDate', nullable: false, description: 'Normalized 1st day of the month (e.g. 2026-10-01)' },
      { name: 'expected_income', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, defaultValue: '0.00', description: 'Projected in-hand income in INR' },
      { name: 'target_savings', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, defaultValue: '0.00', description: 'Target savings allocation in INR' },
      { name: 'currency_code', type: 'CHAR(3)', javaType: 'String', nullable: false, defaultValue: "'INR'", description: 'Currency standard code (INR)' },
      { name: 'notes', type: 'VARCHAR(500)', javaType: 'String', nullable: true, description: 'Optional plan commentary or festival goals' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit update timestamp' },
    ],
    indexes: [
      { name: 'uk_monthly_plan_user_month', columns: ['user_id', 'plan_month'], isUnique: true, purpose: 'Guarantees strictly one plan per user per month' },
      { name: 'idx_monthly_plans_user_date', columns: ['user_id', 'plan_month'], isUnique: false, purpose: 'Fast chronological plan lookups' },
    ],
    constraints: [
      { name: 'pk_monthly_plans', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_monthly_plans_user', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT' },
      { name: 'uk_monthly_plan_user_month', type: 'UNIQUE', definition: 'UNIQUE (`user_id`, `plan_month`)' },
      { name: 'chk_plan_expected_income_non_neg', type: 'CHECK', definition: 'CHECK (`expected_income` >= 0.00)' },
      { name: 'chk_plan_target_savings_non_neg', type: 'CHECK', definition: 'CHECK (`target_savings` >= 0.00)' },
    ],
  },
  {
    id: 'budget_categories',
    name: 'budget_categories',
    entityName: 'BudgetCategory.java',
    category: 'Budgeting',
    description: 'Category-specific planned spending allocations within a monthly plan in Indian Rupees (INR).',
    cardinalityNotes: 'Belongs to one monthly_plan and references one expense_category. Cascades on monthly_plan deletion.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'monthly_plan_id', type: 'BIGINT', javaType: 'MonthlyPlan', nullable: false, isFk: true, references: 'monthly_plans(id)', description: 'Parent monthly plan ID' },
      { name: 'category_id', type: 'BIGINT', javaType: 'ExpenseCategory', nullable: false, isFk: true, references: 'expense_categories(id)', description: 'Expense category budgeted' },
      { name: 'planned_amount', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, defaultValue: '0.00', description: 'Cap amount allocated in INR' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit update timestamp' },
    ],
    indexes: [
      { name: 'uk_budget_plan_category', columns: ['monthly_plan_id', 'category_id'], isUnique: true, purpose: 'Prevents multiple budgets for the same category in one plan' },
      { name: 'idx_budget_categories_plan', columns: ['monthly_plan_id'], isUnique: false, purpose: 'Fast retrieval of all budget items in a plan' },
    ],
    constraints: [
      { name: 'pk_budget_categories', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_budget_cat_plan', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`monthly_plan_id`) REFERENCES `monthly_plans` (`id`) ON DELETE CASCADE' },
      { name: 'fk_budget_cat_category', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE RESTRICT' },
      { name: 'uk_budget_plan_category', type: 'UNIQUE', definition: 'UNIQUE (`monthly_plan_id`, `category_id`)' },
      { name: 'chk_budget_planned_amount_non_neg', type: 'CHECK', definition: 'CHECK (`planned_amount` >= 0.00)' },
    ],
  },
  {
    id: 'transactions',
    name: 'transactions',
    entityName: 'Transaction.java',
    category: 'Ledger',
    description: 'Manually entered actual cash inflows and outflows in Indian Rupees (INR). Strictly positive amounts, with transaction_type indicating sign.',
    cardinalityNotes: 'Belongs to one user and one category. Protected by ON DELETE RESTRICT from user or category deletion.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'user_id', type: 'BIGINT', javaType: 'User', nullable: false, isFk: true, references: 'users(id)', description: 'Authenticated user owner' },
      { name: 'category_id', type: 'BIGINT', javaType: 'ExpenseCategory', nullable: false, isFk: true, references: 'expense_categories(id)', description: 'Category tag' },
      { name: 'transaction_type', type: 'VARCHAR(10)', javaType: 'TransactionType', nullable: false, description: 'INCOME or EXPENSE' },
      { name: 'amount', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, description: 'Monetary value in INR (strictly positive > 0.00)' },
      { name: 'description', type: 'VARCHAR(255)', javaType: 'String', nullable: false, description: 'Transaction summary (e.g. Swiggy, BESCOM bill, Salary)' },
      { name: 'transaction_date', type: 'DATE', javaType: 'LocalDate', nullable: false, description: 'Calendar date when transaction occurred' },
      { name: 'payment_method', type: 'VARCHAR(20)', javaType: 'PaymentMethod', nullable: false, description: 'Classification tag: UPI, CASH, DEBIT_CARD, CREDIT_CARD, etc.' },
      { name: 'notes', type: 'TEXT', javaType: 'String', nullable: true, description: 'Optional user notes or remarks' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit update timestamp' },
    ],
    indexes: [
      { name: 'idx_tx_user_date', columns: ['user_id', 'transaction_date DESC'], isUnique: false, purpose: 'Optimizes user recent transaction feeds' },
      { name: 'idx_tx_user_type_date', columns: ['user_id', 'transaction_type', 'transaction_date'], isUnique: false, purpose: 'Accelerates monthly income & expense total sums' },
      { name: 'idx_tx_user_cat_date', columns: ['user_id', 'category_id', 'transaction_date'], isUnique: false, purpose: 'Powers category breakdown reports and budget actuals' },
    ],
    constraints: [
      { name: 'pk_transactions', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_transactions_user', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT' },
      { name: 'fk_transactions_category', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`) ON DELETE RESTRICT' },
      { name: 'chk_tx_type', type: 'CHECK', definition: 'CHECK (`transaction_type` IN (\'INCOME\', \'EXPENSE\'))' },
      { name: 'chk_tx_amount_positive', type: 'CHECK', definition: 'CHECK (`amount` > 0.00)' },
      { name: 'chk_tx_payment_method', type: 'CHECK', definition: 'CHECK (`payment_method` IN (\'UPI\', \'CASH\', \'DEBIT_CARD\', \'CREDIT_CARD\', \'BANK_TRANSFER\', \'OTHER\'))' },
    ],
  },
  {
    id: 'savings_goals',
    name: 'savings_goals',
    entityName: 'SavingsGoal.java',
    category: 'Goals',
    description: 'Target savings milestones (e.g. 6-Month Emergency Safety Net, House Down Payment) tracked in Indian Rupees (INR).',
    cardinalityNotes: 'One user has many savings goals. Each goal contains multiple savings_contributions.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'user_id', type: 'BIGINT', javaType: 'User', nullable: false, isFk: true, references: 'users(id)', description: 'Goal owner' },
      { name: 'name', type: 'VARCHAR(120)', javaType: 'String', nullable: false, description: 'Goal title (e.g. 6-Month Emergency Safety Net)' },
      { name: 'target_amount', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, description: 'Target milestone sum in INR (> 0.00)' },
      { name: 'current_amount', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, defaultValue: '0.00', description: 'Current accumulated sum in INR' },
      { name: 'target_date', type: 'DATE', javaType: 'LocalDate', nullable: true, description: 'Optional projected completion date' },
      { name: 'status', type: 'VARCHAR(20)', javaType: 'GoalStatus', nullable: false, defaultValue: "'ACTIVE'", description: 'ACTIVE, COMPLETED, PAUSED, CANCELLED' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Audit creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Audit update timestamp' },
    ],
    indexes: [
      { name: 'idx_savings_goals_user_status', columns: ['user_id', 'status'], isUnique: false, purpose: 'Quickly load active goals for user dashboard' },
    ],
    constraints: [
      { name: 'pk_savings_goals', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_savings_goals_user', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT' },
      { name: 'chk_goal_target_amount', type: 'CHECK', definition: 'CHECK (`target_amount` > 0.00)' },
      { name: 'chk_goal_current_amount', type: 'CHECK', definition: 'CHECK (`current_amount` >= 0.00)' },
      { name: 'chk_goal_status', type: 'CHECK', definition: 'CHECK (`status` IN (\'ACTIVE\', \'COMPLETED\', \'PAUSED\', \'CANCELLED\'))' },
    ],
  },
  {
    id: 'savings_contributions',
    name: 'savings_contributions',
    entityName: 'SavingsContribution.java',
    category: 'Goals',
    description: 'Individual deposit and allocation records toward a savings goal in Indian Rupees (INR). Not double-counted as general expenses.',
    cardinalityNotes: 'Belongs to one savings_goal. Cascades upon savings_goal deletion.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'savings_goal_id', type: 'BIGINT', javaType: 'SavingsGoal', nullable: false, isFk: true, references: 'savings_goals(id)', description: 'Associated goal' },
      { name: 'amount', type: 'DECIMAL(15,2)', javaType: 'BigDecimal', nullable: false, description: 'Contribution amount in INR (> 0.00)' },
      { name: 'contribution_date', type: 'DATE', javaType: 'LocalDate', nullable: false, description: 'Date contribution was deposited' },
      { name: 'description', type: 'VARCHAR(255)', javaType: 'String', nullable: true, description: 'Optional memo (e.g. Monthly salary savings)' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Record creation timestamp' },
    ],
    indexes: [
      { name: 'idx_savings_contrib_goal_date', columns: ['savings_goal_id', 'contribution_date'], isUnique: false, purpose: 'Retrieves contribution history for a goal' },
    ],
    constraints: [
      { name: 'pk_savings_contributions', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_savings_contrib_goal', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`savings_goal_id`) REFERENCES `savings_goals` (`id`) ON DELETE CASCADE' },
      { name: 'chk_contrib_amount_positive', type: 'CHECK', definition: 'CHECK (`amount` > 0.00)' },
    ],
  },
  {
    id: 'chatbot_conversations',
    name: 'chatbot_conversations',
    entityName: 'ChatbotConversation.java',
    category: 'Assistant',
    description: 'Conversational sessions with the on-demand AI financial advisor. Completely isolated from transactional ledgers.',
    cardinalityNotes: 'One user has many chatbot conversations. Contains multiple chatbot_messages.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'user_id', type: 'BIGINT', javaType: 'User', nullable: false, isFk: true, references: 'users(id)', description: 'Conversation owner' },
      { name: 'title', type: 'VARCHAR(150)', javaType: 'String', nullable: false, defaultValue: "'Financial Advisory Session'", description: 'Conversation title' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Session created' },
      { name: 'updated_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP ON UPDATE', description: 'Session last active' },
    ],
    indexes: [
      { name: 'idx_chatbot_conv_user', columns: ['user_id', 'updated_at DESC'], isUnique: false, purpose: 'Fetches recent chat sessions for user' },
    ],
    constraints: [
      { name: 'pk_chatbot_conversations', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_chatbot_conv_user', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE' },
    ],
  },
  {
    id: 'chatbot_messages',
    name: 'chatbot_messages',
    entityName: 'ChatbotMessage.java',
    category: 'Assistant',
    description: 'Individual prompt and response messages in an AI chat session. Strictly prohibits storing API keys or tokens.',
    cardinalityNotes: 'Belongs to one chatbot_conversation. Cascades upon conversation deletion.',
    columns: [
      { name: 'id', type: 'BIGINT', javaType: 'Long', nullable: false, isPk: true, description: 'Primary key (AUTO_INCREMENT)' },
      { name: 'conversation_id', type: 'BIGINT', javaType: 'ChatbotConversation', nullable: false, isFk: true, references: 'chatbot_conversations(id)', description: 'Parent conversation ID' },
      { name: 'role', type: 'VARCHAR(15)', javaType: 'MessageRole', nullable: false, description: 'USER, ASSISTANT, or SYSTEM' },
      { name: 'content', type: 'TEXT', javaType: 'String', nullable: false, description: 'Message markdown or prose body' },
      { name: 'metadata_json', type: 'JSON', javaType: 'String', nullable: true, description: 'Optional token counts, model info' },
      { name: 'created_at', type: 'TIMESTAMP', javaType: 'Instant', nullable: false, defaultValue: 'CURRENT_TIMESTAMP', description: 'Timestamp of message' },
    ],
    indexes: [
      { name: 'idx_chatbot_msg_conv_time', columns: ['conversation_id', 'created_at ASC'], isUnique: false, purpose: 'Fetches chronological chat stream' },
    ],
    constraints: [
      { name: 'pk_chatbot_messages', type: 'PRIMARY KEY', definition: 'PRIMARY KEY (`id`)' },
      { name: 'fk_chatbot_msg_conv', type: 'FOREIGN KEY', definition: 'FOREIGN KEY (`conversation_id`) REFERENCES `chatbot_conversations` (`id`) ON DELETE CASCADE' },
      { name: 'chk_msg_role', type: 'CHECK', definition: 'CHECK (`role` IN (\'USER\', \'ASSISTANT\', \'SYSTEM\'))' },
    ],
  },
];
