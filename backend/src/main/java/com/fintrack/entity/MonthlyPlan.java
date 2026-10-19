package com.fintrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Monthly financial blueprint for a calendar month.
 * planMonth represents the first day of the calendar month (YYYY-MM-01).
 * Amounts are maintained in Indian Rupees (INR) using BigDecimal.
 */
@Entity
@Table(
    name = "monthly_plans",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_monthly_plan_user_month", columnNames = {"user_id", "plan_month"})
    },
    indexes = {
        @Index(name = "idx_monthly_plans_user_date", columnList = "user_id, plan_month")
    }
)
public class MonthlyPlan extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_monthly_plans_user"))
    private User user;

    @NotNull
    @Column(name = "plan_month", nullable = false)
    private LocalDate planMonth;

    @NotNull
    @DecimalMin(value = "0.00", message = "Expected income cannot be negative")
    @Column(name = "expected_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal expectedIncome = BigDecimal.ZERO.setScale(2);

    @NotNull
    @DecimalMin(value = "0.00", message = "Target savings cannot be negative")
    @Column(name = "target_savings", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetSavings = BigDecimal.ZERO.setScale(2);

    @NotNull
    @Size(min = 3, max = 3)
    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "INR";

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @OneToMany(mappedBy = "monthlyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BudgetCategory> budgetCategories = new ArrayList<>();

    public MonthlyPlan() {
    }

    public MonthlyPlan(User user, LocalDate planMonth, BigDecimal expectedIncome, BigDecimal targetSavings) {
        this.user = user;
        // Normalize to the 1st of the month
        this.planMonth = planMonth != null ? planMonth.withDayOfMonth(1) : null;
        this.expectedIncome = expectedIncome != null ? expectedIncome.setScale(2) : BigDecimal.ZERO.setScale(2);
        this.targetSavings = targetSavings != null ? targetSavings.setScale(2) : BigDecimal.ZERO.setScale(2);
        this.currencyCode = "INR";
    }

    public void addBudgetCategory(BudgetCategory budgetCategory) {
        budgetCategories.add(budgetCategory);
        budgetCategory.setMonthlyPlan(this);
    }

    public void removeBudgetCategory(BudgetCategory budgetCategory) {
        budgetCategories.remove(budgetCategory);
        budgetCategory.setMonthlyPlan(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getPlanMonth() {
        return planMonth;
    }

    public void setPlanMonth(LocalDate planMonth) {
        this.planMonth = planMonth != null ? planMonth.withDayOfMonth(1) : null;
    }

    public BigDecimal getExpectedIncome() {
        return expectedIncome;
    }

    public void setExpectedIncome(BigDecimal expectedIncome) {
        this.expectedIncome = expectedIncome != null ? expectedIncome.setScale(2) : BigDecimal.ZERO.setScale(2);
    }

    public BigDecimal getTargetSavings() {
        return targetSavings;
    }

    public void setTargetSavings(BigDecimal targetSavings) {
        this.targetSavings = targetSavings != null ? targetSavings.setScale(2) : BigDecimal.ZERO.setScale(2);
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<BudgetCategory> getBudgetCategories() {
        return budgetCategories;
    }

    public void setBudgetCategories(List<BudgetCategory> budgetCategories) {
        this.budgetCategories = budgetCategories;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MonthlyPlan that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
