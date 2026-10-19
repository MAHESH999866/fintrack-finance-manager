package com.fintrack.service;

import com.fintrack.dto.BudgetCategoryDto;
import com.fintrack.dto.MonthlyPlanRequest;
import com.fintrack.dto.MonthlyPlanResponse;
import com.fintrack.entity.ExpenseCategory;
import com.fintrack.entity.MonthlyPlan;
import com.fintrack.entity.User;
import com.fintrack.enums.CategoryType;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.repository.BudgetCategoryRepository;
import com.fintrack.repository.ExpenseCategoryRepository;
import com.fintrack.repository.MonthlyPlanRepository;
import com.fintrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MonthlyPlanServiceTest {

    @Mock
    private MonthlyPlanRepository monthlyPlanRepository;

    @Mock
    private BudgetCategoryRepository budgetCategoryRepository;

    @Mock
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MonthlyPlanService monthlyPlanService;

    private User testUser;
    private ExpenseCategory rentCategory;

    @BeforeEach
    void setUp() {
        testUser = new User("Rahul Sharma", "rahul.sharma@fintrack.in", "hashed_pwd");
        testUser.setId(101L);

        rentCategory = new ExpenseCategory(null, "House Rent", CategoryType.EXPENSE, true);
        rentCategory.setId(5L);
    }

    @Test
    @DisplayName("Should correctly separate planned savings, expected income, and calculate unallocated income using BigDecimal")
    void testMonthlyPlanCalculationSeparation() {
        LocalDate month = LocalDate.of(2026, 10, 1);
        BigDecimal expectedIncome = new BigDecimal("125000.00");
        BigDecimal targetSavings = new BigDecimal("35000.00");
        BigDecimal rentBudget = new BigDecimal("30000.00");

        MonthlyPlanRequest request = new MonthlyPlanRequest(
                month,
                expectedIncome,
                targetSavings,
                "October Diwali Budget",
                List.of(new BudgetCategoryDto(5L, "House Rent", rentBudget))
        );

        when(userRepository.findById(101L)).thenReturn(Optional.of(testUser));
        when(monthlyPlanRepository.findByUserIdAndPlanMonth(101L, month)).thenReturn(Optional.empty());
        when(expenseCategoryRepository.findById(5L)).thenReturn(Optional.of(rentCategory));

        MonthlyPlan savedPlan = new MonthlyPlan(testUser, month, expectedIncome, targetSavings);
        savedPlan.setId(501L);
        when(monthlyPlanRepository.save(any(MonthlyPlan.class))).thenReturn(savedPlan);

        MonthlyPlanResponse response = monthlyPlanService.saveOrUpdatePlan(101L, request);

        assertNotNull(response);
        assertEquals(expectedIncome.setScale(2, RoundingMode.HALF_UP), response.expectedIncome());
        assertEquals(targetSavings.setScale(2, RoundingMode.HALF_UP), response.targetSavings());
        assertEquals(rentBudget.setScale(2, RoundingMode.HALF_UP), response.totalPlannedExpenses());

        // unallocated = expectedIncome (125,000) - [plannedExpenses (30,000) + targetSavings (35,000)] = 60,000
        BigDecimal expectedUnallocated = new BigDecimal("60000.00");
        assertEquals(expectedUnallocated, response.unallocatedIncome());
    }

    @Test
    @DisplayName("Should reject negative expected income or target savings")
    void testRejectNegativeAmounts() {
        MonthlyPlanRequest negativeIncomeRequest = new MonthlyPlanRequest(
                LocalDate.of(2026, 10, 1),
                new BigDecimal("-5000.00"),
                new BigDecimal("10000.00"),
                null,
                List.of()
        );

        when(userRepository.findById(101L)).thenReturn(Optional.of(testUser));

        assertThrows(BusinessValidationException.class, () ->
                monthlyPlanService.saveOrUpdatePlan(101L, negativeIncomeRequest)
        );
    }
}
