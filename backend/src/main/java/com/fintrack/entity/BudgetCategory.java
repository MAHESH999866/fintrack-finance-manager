package com.fintrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Objects;

/**
 * Planned expense allowance assigned to a category within a specific monthly plan.
 * Amounts are expressed in Indian Rupees (INR).
 */
@Entity
@Table(
    name = "budget_categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_budget_plan_category", columnNames = {"monthly_plan_id", "category_id"})
    },
    indexes = {
        @Index(name = "idx_budget_categories_plan", columnList = "monthly_plan_id"),
        @Index(name = "idx_budget_categories_cat", columnList = "category_id")
    }
)
public class BudgetCategory extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "monthly_plan_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_cat_plan"))
    private MonthlyPlan monthlyPlan;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_cat_category"))
    private ExpenseCategory category;

    @NotNull
    @DecimalMin(value = "0.00", message = "Planned budget amount cannot be negative")
    @Column(name = "planned_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal plannedAmount = BigDecimal.ZERO.setScale(2);

    public BudgetCategory() {
    }

    public BudgetCategory(MonthlyPlan monthlyPlan, ExpenseCategory category, BigDecimal plannedAmount) {
        this.monthlyPlan = monthlyPlan;
        this.category = category;
        this.plannedAmount = plannedAmount != null ? plannedAmount.setScale(2) : BigDecimal.ZERO.setScale(2);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MonthlyPlan getMonthlyPlan() {
        return monthlyPlan;
    }

    public void setMonthlyPlan(MonthlyPlan monthlyPlan) {
        this.monthlyPlan = monthlyPlan;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public BigDecimal getPlannedAmount() {
        return plannedAmount;
    }

    public void setPlannedAmount(BigDecimal plannedAmount) {
        this.plannedAmount = plannedAmount != null ? plannedAmount.setScale(2) : BigDecimal.ZERO.setScale(2);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BudgetCategory that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
