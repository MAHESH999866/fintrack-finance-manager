package com.fintrack.repository;

import com.fintrack.entity.MonthlyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyPlanRepository extends JpaRepository<MonthlyPlan, Long> {

    Optional<MonthlyPlan> findByUserIdAndPlanMonth(Long userId, LocalDate planMonth);

    boolean existsByUserIdAndPlanMonth(Long userId, LocalDate planMonth);

    List<MonthlyPlan> findByUserIdOrderByPlanMonthDesc(Long userId);

    /**
     * Efficiently loads plan and all its budgeted categories in a single query to eliminate N+1 problem.
     */
    @Query("""
        SELECT DISTINCT p FROM MonthlyPlan p
        LEFT JOIN FETCH p.budgetCategories bc
        LEFT JOIN FETCH bc.category c
        WHERE p.user.id = :userId AND p.planMonth = :planMonth
    """)
    Optional<MonthlyPlan> findByUserIdAndPlanMonthWithBudgets(@Param("userId") Long userId,
                                                             @Param("planMonth") LocalDate planMonth);

    @Query("""
        SELECT p FROM MonthlyPlan p
        WHERE p.user.id = :userId
          AND p.planMonth BETWEEN :startMonth AND :endMonth
        ORDER BY p.planMonth ASC
    """)
    List<MonthlyPlan> findPlansInRange(@Param("userId") Long userId,
                                       @Param("startMonth") LocalDate startMonth,
                                       @Param("endMonth") LocalDate endMonth);
}
