package com.fintrack.repository;

import com.fintrack.entity.ExpenseCategory;
import com.fintrack.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {

    List<ExpenseCategory> findByIsSystemTrueOrderByCategoryTypeAscNameAsc();

    List<ExpenseCategory> findByUserIdAndIsSystemFalse(Long userId);

    /**
     * Retrieves all categories accessible to a user (both built-in global and custom user categories).
     */
    @Query("""
        SELECT c FROM ExpenseCategory c
        WHERE c.isSystem = true OR (c.user.id = :userId AND c.isSystem = false)
        ORDER BY c.categoryType ASC, c.name ASC
    """)
    List<ExpenseCategory> findAllAvailableForUser(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM ExpenseCategory c
        WHERE (c.isSystem = true OR c.user.id = :userId)
          AND c.categoryType = :categoryType
        ORDER BY c.name ASC
    """)
    List<ExpenseCategory> findAllAvailableForUserAndType(@Param("userId") Long userId,
                                                        @Param("categoryType") CategoryType categoryType);

    /**
     * Check if a category with the same name already exists for the user or among system categories.
     */
    @Query("""
        SELECT COUNT(c) > 0 FROM ExpenseCategory c
        WHERE LOWER(c.name) = LOWER(:name)
          AND c.categoryType = :categoryType
          AND (c.isSystem = true OR c.user.id = :userId)
    """)
    boolean existsByNameAndCategoryTypeForUser(@Param("name") String name,
                                              @Param("categoryType") CategoryType categoryType,
                                              @Param("userId") Long userId);
}
