package com.fintrack.enums;

/**
 * Descriptive label for how the user conducted the financial transaction.
 * IMPORTANT: This is an informational classification tag only.
 * It does not imply that the application processed the payment or integrates
 * with any payment gateway, banking API, or UPI switch.
 */
public enum PaymentMethod {
    UPI,
    CASH,
    DEBIT_CARD,
    CREDIT_CARD,
    BANK_TRANSFER,
    OTHER
}
