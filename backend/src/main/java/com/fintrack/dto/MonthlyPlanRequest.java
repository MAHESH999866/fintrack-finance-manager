package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record MonthlyPlanRequest(
    @NotNull(message = "Plan month is required")
    LocalDate planMonth,

    @NotNull(message = "Expected income is required")
    @DecimalMin(value = "0.00", message = "Expected income cannot be negative")
    BigDecimal expectedIncome,

    @NotNull(message = "Target savings is required")
    @DecimalMin(value = "0.00", message = "Target savings cannot be negative")
    BigDecimal targetSavings,

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    String notes,

    List<BudgetCategoryDto> budgets
) {}
