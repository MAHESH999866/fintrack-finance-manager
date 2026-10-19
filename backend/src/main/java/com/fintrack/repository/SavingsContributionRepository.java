package com.fintrack.repository;

import com.fintrack.entity.SavingsContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SavingsContributionRepository extends JpaRepository<SavingsContribution, Long> {

    List<SavingsContribution> findBySavingsGoalIdOrderByContributionDateDesc(Long savingsGoalId);

    @Query("""
        SELECT COALESCE(SUM(c.amount), 0.00)
        FROM SavingsContribution c
        WHERE c.savingsGoal.id = :savingsGoalId
    """)
    BigDecimal sumAmountBySavingsGoalId(@Param("savingsGoalId") Long savingsGoalId);

    long countBySavingsGoalId(Long savingsGoalId);
}
