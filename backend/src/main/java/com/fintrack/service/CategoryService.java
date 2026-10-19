package com.fintrack.service;

import com.fintrack.dto.CategoryDto;
import com.fintrack.entity.ExpenseCategory;
import com.fintrack.entity.User;
import com.fintrack.enums.CategoryType;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.UnauthorizedAccessException;
import com.fintrack.repository.ExpenseCategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public CategoryService(ExpenseCategoryRepository expenseCategoryRepository,
                           TransactionRepository transactionRepository,
                           UserRepository userRepository) {
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesForUser(Long userId) {
        return expenseCategoryRepository.findAllAccessibleCategories(userId).stream()
                .map(CategoryDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategoriesByType(Long userId, CategoryType type) {
        return expenseCategoryRepository.findByCategoryType(type).stream()
                .filter(c -> c.isSystem() || (c.getUser() != null && c.getUser().getId().equals(userId)))
                .map(CategoryDto::from)
                .toList();
    }

    @Transactional
    public CategoryDto createCustomCategory(Long userId, String name, CategoryType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (expenseCategoryRepository.existsByUserIdAndNameIgnoreCase(userId, name.trim())) {
            throw new BusinessValidationException("A category with name '" + name.trim() + "' already exists.");
        }

        ExpenseCategory cat = new ExpenseCategory(user, name.trim(), type, false);
        ExpenseCategory saved = expenseCategoryRepository.save(cat);
        return CategoryDto.from(saved);
    }

    @Transactional
    public void deleteCustomCategory(Long userId, Long categoryId) {
        ExpenseCategory cat = expenseCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        if (cat.isSystem()) {
            throw new BusinessValidationException("System built-in categories cannot be deleted.");
        }

        if (cat.getUser() == null || !cat.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this category.");
        }

        if (transactionRepository.existsByCategoryId(categoryId)) {
            throw new BusinessValidationException("Cannot delete category because transactions are recorded under it.");
        }

        expenseCategoryRepository.delete(cat);
    }
}
