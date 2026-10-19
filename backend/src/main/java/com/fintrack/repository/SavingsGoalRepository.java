package com.fintrack.repository;

import com.fintrack.entity.SavingsGoal;
import com.fintrack.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavingsGoal> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, GoalStatus status);

    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);

    @Query("""
        SELECT COALESCE(SUM(g.targetAmount), 0.00)
        FROM SavingsGoal g
        WHERE g.user.id = :userId AND g.status = 'ACTIVE'
    """)
    BigDecimal sumActiveTargetAmountByUserId(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(g.currentAmount), 0.00)
        FROM SavingsGoal g
        WHERE g.user.id = :userId AND g.status = 'ACTIVE'
    """)
    BigDecimal sumActiveCurrentAmountByUserId(@Param("userId") Long userId);
}
