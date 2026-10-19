package com.fintrack.repository;

import com.fintrack.entity.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    List<BudgetCategory> findByMonthlyPlanId(Long monthlyPlanId);

    Optional<BudgetCategory> findByMonthlyPlanIdAndCategoryId(Long monthlyPlanId, Long categoryId);

    @Query("""
        SELECT COALESCE(SUM(b.plannedAmount), 0.00)
        FROM BudgetCategory b
        WHERE b.monthlyPlan.id = :monthlyPlanId
    """)
    BigDecimal sumPlannedAmountByMonthlyPlanId(@Param("monthlyPlanId") Long monthlyPlanId);
}
