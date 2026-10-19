package com.fintrack.dto;

import com.fintrack.entity.ExpenseCategory;
import com.fintrack.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryDto(
    Long id,
    @NotBlank(message = "Category name is required")
    @Size(max = 80, message = "Category name cannot exceed 80 characters")
    String name,
    @NotNull(message = "Category type is required (INCOME or EXPENSE)")
    CategoryType categoryType,
    boolean isSystem
) {
    public static CategoryDto from(ExpenseCategory cat) {
        return new CategoryDto(
            cat.getId(),
            cat.getName(),
            cat.getCategoryType(),
            cat.isSystem()
        );
    }
}
