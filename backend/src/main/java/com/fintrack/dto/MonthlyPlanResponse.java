package com.fintrack.dto;

import com.fintrack.entity.MonthlyPlan;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

public record MonthlyPlanResponse(
    Long id,
    Long userId,
    LocalDate planMonth,
    BigDecimal expectedIncome,
    BigDecimal targetSavings,
    BigDecimal totalPlannedExpenses,
    BigDecimal unallocatedIncome,
    BigDecimal plannedSavingsPercentage,
    String currencyCode,
    String notes,
    List<BudgetCategoryDto> budgets
) {
    public static MonthlyPlanResponse from(MonthlyPlan plan) {
        BigDecimal totalExpenses = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        List<BudgetCategoryDto> budgetDtos = List.of();

        if (plan.getBudgetCategories() != null && !plan.getBudgetCategories().isEmpty()) {
            budgetDtos = plan.getBudgetCategories().stream()
                .map(b -> new BudgetCategoryDto(
                    b.getCategory().getId(),
                    b.getCategory().getName(),
                    b.getPlannedAmount()
                ))
                .toList();

            totalExpenses = budgetDtos.stream()
                .map(BudgetCategoryDto::plannedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal expected = plan.getExpectedIncome() != null ? plan.getExpectedIncome().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
        BigDecimal savings = plan.getTargetSavings() != null ? plan.getTargetSavings().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
        BigDecimal totalAllocated = totalExpenses.add(savings);
        BigDecimal unallocated = expected.subtract(totalAllocated);

        BigDecimal savingsRate = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (expected.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings.multiply(BigDecimal.valueOf(100)).divide(expected, 2, RoundingMode.HALF_UP);
        }

        return new MonthlyPlanResponse(
            plan.getId(),
            plan.getUser().getId(),
            plan.getPlanMonth(),
            expected,
            savings,
            totalExpenses,
            unallocated,
            savingsRate,
            plan.getCurrencyCode(),
            plan.getNotes(),
            budgetDtos
        );
    }
}
