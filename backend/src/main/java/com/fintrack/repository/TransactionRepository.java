package com.fintrack.repository;

import com.fintrack.dto.CategorySpendingReportDto;
import com.fintrack.dto.DailyExpenseTrendDto;
import com.fintrack.entity.Transaction;
import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    // --------------------------------------------------------------------------
    // 1. Core Scoped Fetching & Paginated Recent Transactions
    // --------------------------------------------------------------------------

    Page<Transaction> findByUserIdOrderByTransactionDateDescIdDesc(Long userId, Pageable pageable);

    List<Transaction> findTop10ByUserIdOrderByTransactionDateDescIdDesc(Long userId);

    Page<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDescIdDesc(
        Long userId, LocalDate startDate, LocalDate endDate, Pageable pageable
    );

    // --------------------------------------------------------------------------
    // 2. High-Performance Aggregate Totals (User Scoped)
    // --------------------------------------------------------------------------

    /**
     * Calculates total income or total expense for a specific date range.
     * Guaranteed non-null return via COALESCE.
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0.00)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionType = :transactionType
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
    """)
    BigDecimal sumAmountByUserIdAndTypeAndDateRange(
        @Param("userId") Long userId,
        @Param("transactionType") TransactionType transactionType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Calculates total spent in a specific category for a date window (used for budget utilization).
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0.00)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.category.id = :categoryId
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
    """)
    BigDecimal sumAmountByUserIdAndCategoryAndDateRange(
        @Param("userId") Long userId,
        @Param("categoryId") Long categoryId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // --------------------------------------------------------------------------
    // 3. Category-Wise Breakdown Reporting
    // --------------------------------------------------------------------------

    @Query("""
        SELECT new com.fintrack.dto.CategorySpendingReportDto(
            c.id,
            c.name,
            c.categoryType,
            SUM(t.amount),
            COUNT(t.id)
        )
        FROM Transaction t
        JOIN t.category c
        WHERE t.user.id = :userId
          AND t.transactionType = :transactionType
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
        GROUP BY c.id, c.name, c.categoryType
        ORDER BY SUM(t.amount) DESC
    """)
    List<CategorySpendingReportDto> findCategorySpendingReport(
        @Param("userId") Long userId,
        @Param("transactionType") TransactionType transactionType,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // --------------------------------------------------------------------------
    // 4. Daily Spending Trend Reporting
    // --------------------------------------------------------------------------

    @Query("""
        SELECT new com.fintrack.dto.DailyExpenseTrendDto(
            t.transactionDate,
            SUM(t.amount),
            COUNT(t.id)
        )
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.transactionType = 'EXPENSE'
          AND t.transactionDate >= :startDate
          AND t.transactionDate <= :endDate
        GROUP BY t.transactionDate
        ORDER BY t.transactionDate ASC
    """)
    List<DailyExpenseTrendDto> findDailyExpenseTrend(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // --------------------------------------------------------------------------
    // 5. Referential Integrity & Deletion Safety Checks
    // --------------------------------------------------------------------------

    boolean existsByCategoryId(Long categoryId);

    long countByUserId(Long userId);
}
