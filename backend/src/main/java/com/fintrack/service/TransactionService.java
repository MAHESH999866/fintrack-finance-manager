package com.fintrack.service;

import com.fintrack.dto.TransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.entity.ExpenseCategory;
import com.fintrack.entity.Transaction;
import com.fintrack.entity.User;
import com.fintrack.enums.CategoryType;
import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.UnauthorizedAccessException;
import com.fintrack.repository.ExpenseCategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              ExpenseCategoryRepository expenseCategoryRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(
            Long userId,
            String month,
            TransactionType type,
            Long categoryId,
            PaymentMethod paymentMethod) {

        Specification<Transaction> spec = (root, query, cb) -> {
            var predicates = cb.conjunction();
            predicates = cb.and(predicates, cb.equal(root.get("user").get("id"), userId));

            if (month != null && !month.isBlank()) {
                String[] parts = month.split("-");
                if (parts.length >= 2) {
                    int year = Integer.parseInt(parts[0]);
                    int m = Integer.parseInt(parts[1]);
                    LocalDate start = LocalDate.of(year, m, 1);
                    LocalDate end = start.plusMonths(1).minusDays(1);
                    predicates = cb.and(predicates, cb.between(root.get("transactionDate"), start, end));
                }
            }

            if (type != null) {
                predicates = cb.and(predicates, cb.equal(root.get("transactionType"), type));
            }

            if (categoryId != null) {
                predicates = cb.and(predicates, cb.equal(root.get("category").get("id"), categoryId));
            }

            if (paymentMethod != null) {
                predicates = cb.and(predicates, cb.equal(root.get("paymentMethod"), paymentMethod));
            }

            return predicates;
        };

        Sort sort = Sort.by(Sort.Direction.DESC, "transactionDate", "id");
        return transactionRepository.findAll(spec, sort).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getPaginatedTransactions(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate", "id"));
        return transactionRepository.findByUserIdOrderByTransactionDateDescIdDesc(userId, pageable)
                .map(TransactionResponse::from);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        if (!tx.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to view this transaction.");
        }

        return TransactionResponse.from(tx);
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ExpenseCategory category = expenseCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        // Security check: category must be system-wide or owned by this user
        if (!category.isSystem() && (category.getUser() == null || !category.getUser().getId().equals(userId))) {
            throw new UnauthorizedAccessException("You do not have access to this category.");
        }

        // Validate amount is strictly positive (> 0.00)
        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Transaction amount must be strictly positive (> 0.00).");
        }

        Transaction tx = new Transaction(
                user,
                category,
                request.transactionType(),
                amount,
                request.description().trim(),
                request.transactionDate(),
                request.paymentMethod()
        );
        tx.setNotes(request.notes());

        Transaction savedTx = transactionRepository.save(tx);
        return TransactionResponse.from(savedTx);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, TransactionRequest request) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        if (!tx.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to update this transaction.");
        }

        ExpenseCategory category = expenseCategoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        if (!category.isSystem() && (category.getUser() == null || !category.getUser().getId().equals(userId))) {
            throw new UnauthorizedAccessException("You do not have access to this category.");
        }

        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Transaction amount must be strictly positive (> 0.00).");
        }

        tx.setCategory(category);
        tx.setTransactionType(request.transactionType());
        tx.setAmount(amount);
        tx.setDescription(request.description().trim());
        tx.setTransactionDate(request.transactionDate());
        tx.setPaymentMethod(request.paymentMethod());
        tx.setNotes(request.notes());

        Transaction updated = transactionRepository.save(tx);
        return TransactionResponse.from(updated);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + transactionId));

        if (!tx.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have permission to delete this transaction.");
        }

        transactionRepository.delete(tx);
    }
}
