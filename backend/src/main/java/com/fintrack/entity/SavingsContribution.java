package com.fintrack.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

/**
 * An individual deposit/contribution record toward a specific savings goal.
 * Stored in Indian Rupees (INR).
 * Note: Contributions are milestone trackings, not double-counted as general expenses.
 */
@Entity
@Table(
    name = "savings_contributions",
    indexes = {
        @Index(name = "idx_savings_contrib_goal_date", columnList = "savings_goal_id, contribution_date")
    }
)
@EntityListeners(AuditingEntityListener.class)
public class SavingsContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "savings_goal_id", nullable = false, foreignKey = @ForeignKey(name = "fk_savings_contrib_goal"))
    private SavingsGoal savingsGoal;

    @NotNull
    @DecimalMin(value = "0.01", message = "Contribution amount must be greater than zero")
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(name = "contribution_date", nullable = false)
    private LocalDate contributionDate;

    @Size(max = 255)
    @Column(name = "description", length = 255)
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public SavingsContribution() {
    }

    public SavingsContribution(SavingsGoal savingsGoal, BigDecimal amount, LocalDate contributionDate, String description) {
        this.savingsGoal = savingsGoal;
        this.amount = amount != null ? amount.setScale(2) : null;
        this.contributionDate = contributionDate;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SavingsGoal getSavingsGoal() {
        return savingsGoal;
    }

    public void setSavingsGoal(SavingsGoal savingsGoal) {
        this.savingsGoal = savingsGoal;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(2) : null;
    }

    public LocalDate getContributionDate() {
        return contributionDate;
    }

    public void setContributionDate(LocalDate contributionDate) {
        this.contributionDate = contributionDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SavingsContribution that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
