package com.fintrack.entity;

import com.fintrack.enums.CategoryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

/**
 * Income and Expense category taxonomy.
 * System categories have user = null and isSystem = true.
 * Custom categories have user != null and isSystem = false.
 */
@Entity
@Table(
    name = "expense_categories",
    indexes = {
        @Index(name = "idx_expense_cat_user", columnList = "user_id"),
        @Index(name = "idx_expense_cat_type", columnList = "category_type")
    }
)
public class ExpenseCategory extends BaseAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_expense_categories_user"))
    private User user;

    @NotBlank
    @Size(max = 80)
    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", nullable = false, length = 10)
    private CategoryType categoryType;

    @Column(name = "is_system", nullable = false)
    private boolean isSystem = false;

    public ExpenseCategory() {
    }

    public ExpenseCategory(User user, String name, CategoryType categoryType, boolean isSystem) {
        this.user = user;
        this.name = name;
        this.categoryType = categoryType;
        this.isSystem = isSystem;
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

    public CategoryType getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(CategoryType categoryType) {
        this.categoryType = categoryType;
    }

    public boolean isSystem() {
        return isSystem;
    }

    public void setSystem(boolean system) {
        isSystem = system;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExpenseCategory that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
