package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection DTO for day-by-day expense totals in Indian Rupees (INR).
 */
public record DailyExpenseTrendDto(
    LocalDate date,
    BigDecimal totalExpense,
    Long transactionCount
) {
    public DailyExpenseTrendDto {
        if (totalExpense == null) {
            totalExpense = BigDecimal.ZERO.setScale(2);
        }
    }
}
