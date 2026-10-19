package com.fintrack.dto;

import java.math.BigDecimal;

public record BudgetCategoryDto(
    Long categoryId,
    String categoryName,
    BigDecimal plannedAmount
) {}
