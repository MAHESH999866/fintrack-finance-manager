package com.fintrack.dto;

import com.fintrack.enums.CategoryType;

import java.math.BigDecimal;

/**
 * Projection DTO representing category-wise aggregated actual expense or income.
 * Amounts are in Indian Rupees (INR).
 */
public record CategorySpendingReportDto(
    Long categoryId,
    String categoryName,
    CategoryType categoryType,
    BigDecimal totalAmount,
    Long transactionCount
) {
    public CategorySpendingReportDto {
        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO.setScale(2);
        }
    }

    public CategorySpendingReportDto(Long categoryId, String categoryName, String typeStr, BigDecimal totalAmount, Long transactionCount) {
        this(categoryId, categoryName, CategoryType.valueOf(typeStr), totalAmount, transactionCount);
    }
}
