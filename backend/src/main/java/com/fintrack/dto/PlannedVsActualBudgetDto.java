package com.fintrack.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Compares planned budget vs actual manual spending per expense category.
 * Calculates variance and percentage utilization.
 * All financial amounts are in Indian Rupees (INR).
 */
public record PlannedVsActualBudgetDto(
    Long categoryId,
    String categoryName,
    BigDecimal plannedAmount,
    BigDecimal actualSpent,
    BigDecimal remainingAmount,
    BigDecimal usagePercentage
) {
    public static PlannedVsActualBudgetDto of(
        Long categoryId,
        String categoryName,
        BigDecimal plannedAmount,
        BigDecimal actualSpent
    ) {
        BigDecimal planned = plannedAmount != null ? plannedAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal actual = actualSpent != null ? actualSpent.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = planned.subtract(actual);
        
        BigDecimal usagePct = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (planned.compareTo(BigDecimal.ZERO) > 0) {
            usagePct = actual.multiply(BigDecimal.valueOf(100))
                .divide(planned, 2, RoundingMode.HALF_UP);
        }

        return new PlannedVsActualBudgetDto(categoryId, categoryName, planned, actual, remaining, usagePct);
    }
}
