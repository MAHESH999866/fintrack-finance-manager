package com.fintrack.dto;

import com.fintrack.entity.SavingsContribution;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record SavingsContributionResponse(
    Long id,
    Long savingsGoalId,
    String savingsGoalName,
    BigDecimal amount,
    LocalDate contributionDate,
    String description,
    Instant createdAt
) {
    public static SavingsContributionResponse from(SavingsContribution contribution) {
        return new SavingsContributionResponse(
            contribution.getId(),
            contribution.getSavingsGoal().getId(),
            contribution.getSavingsGoal().getName(),
            contribution.getAmount(),
            contribution.getContributionDate(),
            contribution.getDescription(),
            contribution.getCreatedAt()
        );
    }
}
