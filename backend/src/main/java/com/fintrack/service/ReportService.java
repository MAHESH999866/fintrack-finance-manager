package com.fintrack.service;

import com.fintrack.dto.*;
import com.fintrack.entity.BudgetCategory;
import com.fintrack.entity.MonthlyPlan;
import com.fintrack.enums.CategoryType;
import com.fintrack.enums.TransactionType;
import com.fintrack.repository.MonthlyPlanRepository;
import com.fintrack.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;

    public ReportService(TransactionRepository transactionRepository,
                         MonthlyPlanRepository monthlyPlanRepository) {
        this.transactionRepository = transactionRepository;
        this.monthlyPlanRepository = monthlyPlanRepository;
    }

    /**
     * High-level Monthly Financial Summary
     * Strict Accounting Invariant:
     * - actualSavings = totalRecordedIncome - totalRecordedExpenses
     * - plannedSavings = targetSavings (intended target, NOT real cash)
     * - remainingBudget = totalBudgeted - totalRecordedExpenses
     * - Goal contributions are milestone transfers, NEVER double-subtracted here.
     */
    @Transactional(readOnly = true)
    public MonthlyFinancialSummaryDto getMonthlySummary(Long userId, String monthStr) {
        LocalDate startDate = parseMonthStart(monthStr);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        BigDecimal income = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal expense = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);

        Optional<MonthlyPlan> planOpt = monthlyPlanRepository.findByUserIdAndPlanMonth(userId, startDate);

        BigDecimal expectedIncome = BigDecimal.ZERO;
        BigDecimal targetSavings = BigDecimal.ZERO;
        BigDecimal totalBudgeted = BigDecimal.ZERO;

        if (planOpt.isPresent()) {
            MonthlyPlan plan = planOpt.get();
            expectedIncome = plan.getExpectedIncome() != null ? plan.getExpectedIncome() : BigDecimal.ZERO;
            targetSavings = plan.getTargetSavings() != null ? plan.getTargetSavings() : BigDecimal.ZERO;

            if (plan.getBudgetCategories() != null) {
                totalBudgeted = plan.getBudgetCategories().stream()
                        .map(BudgetCategory::getPlannedAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
        }

        return MonthlyFinancialSummaryDto.compute(
                userId,
                startDate,
                income,
                expense,
                expectedIncome,
                targetSavings,
                totalBudgeted
        );
    }

    /**
     * Budget vs Actual Spending Comparison per Category
     */
    @Transactional(readOnly = true)
    public BudgetUtilizationResponse getBudgetUtilization(Long userId, String monthStr) {
        LocalDate startDate = parseMonthStart(monthStr);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        Optional<MonthlyPlan> planOpt = monthlyPlanRepository.findByUserIdAndPlanMonth(userId, startDate);

        BigDecimal expectedIncome = BigDecimal.ZERO;
        BigDecimal targetSavings = BigDecimal.ZERO;
        BigDecimal totalPlanned = BigDecimal.ZERO;
        BigDecimal totalActual = transactionRepository.sumAmountByUserIdAndTypeAndDateRange(
                userId, TransactionType.EXPENSE, startDate, endDate);

        List<PlannedVsActualBudgetDto> budgetItems = new ArrayList<>();

        if (planOpt.isPresent()) {
            MonthlyPlan plan = planOpt.get();
            expectedIncome = plan.getExpectedIncome() != null ? plan.getExpectedIncome() : BigDecimal.ZERO;
            targetSavings = plan.getTargetSavings() != null ? plan.getTargetSavings() : BigDecimal.ZERO;

            if (plan.getBudgetCategories() != null) {
                for (BudgetCategory bc : plan.getBudgetCategories()) {
                    BigDecimal spent = transactionRepository.sumAmountByUserIdAndCategoryAndDateRange(
                            userId, bc.getCategory().getId(), startDate, endDate);

                    PlannedVsActualBudgetDto item = PlannedVsActualBudgetDto.of(
                            bc.getCategory().getId(),
                            bc.getCategory().getName(),
                            bc.getPlannedAmount(),
                            spent
                    );
                    budgetItems.add(item);
                    totalPlanned = totalPlanned.add(bc.getPlannedAmount());
                }
            }
        }

        BigDecimal remainingTotal = totalPlanned.subtract(totalActual).setScale(2, RoundingMode.HALF_UP);

        return new BudgetUtilizationResponse(
                startDate,
                expectedIncome,
                targetSavings,
                totalPlanned.setScale(2, RoundingMode.HALF_UP),
                totalActual.setScale(2, RoundingMode.HALF_UP),
                remainingTotal,
                budgetItems
        );
    }

    @Transactional(readOnly = true)
    public List<CategorySpendingReportDto> getCategoryBreakdown(Long userId, String monthStr, TransactionType type) {
        LocalDate startDate = parseMonthStart(monthStr);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        TransactionType targetType = type != null ? type : TransactionType.EXPENSE;
        return transactionRepository.findCategorySpendingReport(userId, targetType, startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<DailyExpenseTrendDto> getDailyExpenseTrend(Long userId, String monthStr) {
        LocalDate startDate = parseMonthStart(monthStr);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return transactionRepository.findDailyExpenseTrend(userId, startDate, endDate);
    }

    private LocalDate parseMonthStart(String monthStr) {
        if (monthStr == null || monthStr.isBlank()) {
            return LocalDate.now().withDayOfMonth(1);
        }
        String[] parts = monthStr.split("-");
        if (parts.length >= 2) {
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            return LocalDate.of(year, month, 1);
        }
        return LocalDate.now().withDayOfMonth(1);
    }
}
