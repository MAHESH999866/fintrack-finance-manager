package com.fintrack.service;

import com.fintrack.dto.BudgetCategoryDto;
import com.fintrack.dto.MonthlyPlanRequest;
import com.fintrack.dto.MonthlyPlanResponse;
import com.fintrack.entity.BudgetCategory;
import com.fintrack.entity.ExpenseCategory;
import com.fintrack.entity.MonthlyPlan;
import com.fintrack.entity.User;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.BudgetCategoryRepository;
import com.fintrack.repository.ExpenseCategoryRepository;
import com.fintrack.repository.MonthlyPlanRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MonthlyPlanService {

    private final MonthlyPlanRepository monthlyPlanRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final UserRepository userRepository;

    public MonthlyPlanService(MonthlyPlanRepository monthlyPlanRepository,
                              BudgetCategoryRepository budgetCategoryRepository,
                              ExpenseCategoryRepository expenseCategoryRepository,
                              UserRepository userRepository) {
        this.monthlyPlanRepository = monthlyPlanRepository;
        this.budgetCategoryRepository = budgetCategoryRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Optional<MonthlyPlanResponse> getPlanForMonth(Long userId, LocalDate date) {
        LocalDate normalizedMonth = date.withDayOfMonth(1);
        return monthlyPlanRepository.findByUserIdAndPlanMonth(userId, normalizedMonth)
                .map(MonthlyPlanResponse::from);
    }

    @Transactional(readOnly = true)
    public List<MonthlyPlanResponse> getAllPlans(Long userId) {
        return monthlyPlanRepository.findByUserIdOrderByPlanMonthDesc(userId).stream()
                .map(MonthlyPlanResponse::from)
                .toList();
    }

    @Transactional
    public MonthlyPlanResponse saveOrUpdatePlan(Long userId, MonthlyPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Enforce canonical first of month
        LocalDate planMonth = request.planMonth().withDayOfMonth(1);

        // Monetary validations
        BigDecimal expectedIncome = request.expectedIncome().setScale(2, RoundingMode.HALF_UP);
        BigDecimal targetSavings = request.targetSavings().setScale(2, RoundingMode.HALF_UP);

        if (expectedIncome.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessValidationException("Expected income cannot be negative.");
        }
        if (targetSavings.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessValidationException("Target savings cannot be negative.");
        }

        // Check if an existing plan exists for this user and month
        Optional<MonthlyPlan> existingOpt = monthlyPlanRepository.findByUserIdAndPlanMonth(userId, planMonth);
        MonthlyPlan plan;
        if (existingOpt.isPresent()) {
            plan = existingOpt.get();
            plan.setExpectedIncome(expectedIncome);
            plan.setTargetSavings(targetSavings);
            plan.setNotes(request.notes());
            plan.getBudgetCategories().clear();
        } else {
            plan = new MonthlyPlan(user, planMonth, expectedIncome, targetSavings);
            plan.setNotes(request.notes());
        }

        MonthlyPlan savedPlan = monthlyPlanRepository.save(plan);

        // Process budget category allocations
        if (request.budgets() != null && !request.budgets().isEmpty()) {
            List<BudgetCategory> budgetList = new ArrayList<>();
            for (BudgetCategoryDto bDto : request.budgets()) {
                ExpenseCategory category = expenseCategoryRepository.findById(bDto.categoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + bDto.categoryId()));

                BigDecimal plannedAmount = bDto.plannedAmount() != null
                        ? bDto.plannedAmount().setScale(2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

                if (plannedAmount.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessValidationException("Planned budget amount cannot be negative.");
                }

                BudgetCategory budgetCategory = new BudgetCategory(savedPlan, category, plannedAmount);
                budgetList.add(budgetCategory);
            }
            budgetCategoryRepository.saveAll(budgetList);
            savedPlan.setBudgetCategories(budgetList);
        }

        return MonthlyPlanResponse.from(savedPlan);
    }
}
