package com.fintrack.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for recording a milestone contribution to a savings goal.
 * All monetary amounts are in Indian Rupees (INR).
 */
public record SavingsContributionRequest(
    @NotNull(message = "Savings goal ID is required")
    Long savingsGoalId,

    @NotNull(message = "Contribution amount is required")
    @DecimalMin(value = "0.01", message = "Contribution amount must be strictly positive (> 0.00)")
    BigDecimal amount,

    @NotNull(message = "Contribution date is required")
    LocalDate contributionDate,

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description
) {}
