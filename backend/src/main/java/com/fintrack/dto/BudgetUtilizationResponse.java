package com.fintrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BudgetUtilizationResponse(
    LocalDate planMonth,
    BigDecimal expectedIncome,
    BigDecimal targetSavings,
    BigDecimal totalPlannedExpenses,
    BigDecimal totalActualExpenses,
    BigDecimal remainingBudgetTotal,
    List<PlannedVsActualBudgetDto> budgets
) {}
