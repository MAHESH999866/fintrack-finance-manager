package com.fintrack.dto;

import com.fintrack.enums.GoalStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/**
 * Progress tracking DTO for Indian Rupee savings goals.
 */
public record SavingsGoalProgressDto(
    Long goalId,
    String goalName,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    BigDecimal remainingAmount,
    BigDecimal progressPercentage,
    LocalDate targetDate,
    GoalStatus status,
    Long contributionCount
) {
    public static SavingsGoalProgressDto of(
        Long goalId,
        String goalName,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        LocalDate targetDate,
        GoalStatus status,
        Long contributionCount
    ) {
        BigDecimal target = targetAmount != null ? targetAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
        BigDecimal current = currentAmount != null ? currentAmount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO.setScale(2);
        }

        BigDecimal progressPct = BigDecimal.ZERO.setScale(2);
        if (target.compareTo(BigDecimal.ZERO) > 0) {
            progressPct = current.multiply(BigDecimal.valueOf(100))
                .divide(target, 2, RoundingMode.HALF_UP);
        }

        return new SavingsGoalProgressDto(
            goalId,
            goalName,
            target,
            current,
            remaining,
            progressPct,
            targetDate,
            status,
            contributionCount != null ? contributionCount : 0L
        );
    }
}
