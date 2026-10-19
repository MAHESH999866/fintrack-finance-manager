package com.fintrack.entity;

import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * Core manual financial transaction entry in FinTrack.
 * Represents real historical cash flow in Indian Rupees (INR).
 * Transaction amounts are strictly positive, with transactionType designating flow direction.
 */
@Entity
@Table(
    name = "transactions",
    indexes = {
        @Index(name = "idx_tx_user_date", columnList = "user_id, transaction_date DESC"),
        @Index(name = "idx_tx_user_type_date", columnList = "user_id, transaction_type, transaction_date"),
        @Index(name = "idx_tx_user_cat_date", columnList = "user_id, category_id, transaction_date")
    }
)
public class Transaction extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transactions_user"))
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_transactions_category"))
    private ExpenseCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 10)
    private TransactionType transactionType;

    @NotNull
    @DecimalMin(value = "0.01", message = "Transaction amount must be greater than zero")
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotBlank
    @Size(max = 255)
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @NotNull
    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public Transaction() {
    }

    public Transaction(User user, ExpenseCategory category, TransactionType transactionType,
                       BigDecimal amount, String description, LocalDate transactionDate,
                       PaymentMethod paymentMethod, String notes) {
        this.user = user;
        this.category = category;
        this.transactionType = transactionType;
        this.amount = amount != null ? amount.setScale(2) : null;
        this.description = description;
        this.transactionDate = transactionDate;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
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

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(2) : null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Transaction that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
