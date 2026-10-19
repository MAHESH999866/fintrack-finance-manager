package com.fintrack.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * High-level monthly financial health summary for a user.
 * 
 * Strict FinTrack Business Rules Enforced:
 * 1. actualSavings = totalRecordedIncome - totalRecordedExpenses.
 * 2. Planned savings are an intended target, NOT real savings.
 * 3. Savings goal contributions are milestone transfers and are NOT double-subtracted here.
 */
public record MonthlyFinancialSummaryDto(
    Long userId,
    LocalDate month,
    BigDecimal totalRecordedIncome,
    BigDecimal totalRecordedExpenses,
    BigDecimal actualSavings,
    BigDecimal expectedIncome,
    BigDecimal targetSavings,
    BigDecimal totalBudgetedExpense,
    BigDecimal savingsRatePercentage
) {
    public static MonthlyFinancialSummaryDto compute(
        Long userId,
        LocalDate month,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal expectedIncome,
        BigDecimal targetSavings,
        BigDecimal totalBudgetedExpense
    ) {
        BigDecimal inc = income != null ? income.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal exp = expense != null ? expense.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal actualSav = inc.subtract(exp);

        BigDecimal rate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (inc.compareTo(BigDecimal.ZERO) > 0) {
            rate = actualSav.multiply(BigDecimal.valueOf(100))
                .divide(inc, 2, RoundingMode.HALF_UP);
        }

        return new MonthlyFinancialSummaryDto(
            userId,
            month,
            inc,
            exp,
            actualSav,
            expectedIncome != null ? expectedIncome.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
            targetSavings != null ? targetSavings.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
            totalBudgetedExpense != null ? totalBudgetedExpense.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
            rate
        );
    }
}
