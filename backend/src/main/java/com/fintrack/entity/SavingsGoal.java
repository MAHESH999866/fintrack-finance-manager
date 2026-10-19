package com.fintrack.entity;

import com.fintrack.enums.GoalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Long-term savings target milestone (e.g. Emergency Fund, House Down Payment).
 * All financial targets are maintained in Indian Rupees (INR).
 */
@Entity
@Table(
    name = "savings_goals",
    indexes = {
        @Index(name = "idx_savings_goals_user_status", columnList = "user_id, status")
    }
)
public class SavingsGoal extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_savings_goals_user"))
    private User user;

    @NotBlank
    @Size(max = 120)
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @NotNull
    @DecimalMin(value = "0.01", message = "Target amount must be positive")
    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;

    @NotNull
    @DecimalMin(value = "0.00", message = "Current amount cannot be negative")
    @Column(name = "current_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentAmount = BigDecimal.ZERO.setScale(2);

    @Column(name = "target_date")
    private LocalDate targetDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GoalStatus status = GoalStatus.ACTIVE;

    @OneToMany(mappedBy = "savingsGoal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavingsContribution> contributions = new ArrayList<>();

    public SavingsGoal() {
    }

    public SavingsGoal(User user, String name, BigDecimal targetAmount, LocalDate targetDate) {
        this.user = user;
        this.name = name;
        this.targetAmount = targetAmount != null ? targetAmount.setScale(2) : null;
        this.currentAmount = BigDecimal.ZERO.setScale(2);
        this.targetDate = targetDate;
        this.status = GoalStatus.ACTIVE;
    }

    public void addContribution(SavingsContribution contribution) {
        contributions.add(contribution);
        contribution.setSavingsGoal(this);
        // Atomically increment currentAmount
        if (contribution.getAmount() != null) {
            this.currentAmount = this.currentAmount.add(contribution.getAmount()).setScale(2);
        }
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount != null ? targetAmount.setScale(2) : null;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(BigDecimal currentAmount) {
        this.currentAmount = currentAmount != null ? currentAmount.setScale(2) : BigDecimal.ZERO.setScale(2);
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }

    public List<SavingsContribution> getContributions() {
        return contributions;
    }

    public void setContributions(List<SavingsContribution> contributions) {
        this.contributions = contributions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SavingsGoal that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
