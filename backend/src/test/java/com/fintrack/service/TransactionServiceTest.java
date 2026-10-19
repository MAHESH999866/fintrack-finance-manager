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
import com.fintrack.exception.UnauthorizedAccessException;
import com.fintrack.repository.ExpenseCategoryRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ExpenseCategoryRepository expenseCategoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User testUser;
    private ExpenseCategory groceryCategory;

    @BeforeEach
    void setUp() {
        testUser = new User("Rahul Sharma", "rahul.sharma@fintrack.in", "hashed_pwd");
        testUser.setId(101L);

        groceryCategory = new ExpenseCategory(null, "Food and Groceries", CategoryType.EXPENSE, true);
        groceryCategory.setId(6L);
    }

    @Test
    @DisplayName("Should successfully record manual transaction with positive BigDecimal amount")
    void testCreateTransactionSuccess() {
        BigDecimal amount = new BigDecimal("2850.50");
        TransactionRequest request = new TransactionRequest(
                amount,
                "Zepto Grocery Delivery",
                TransactionType.EXPENSE,
                6L,
                PaymentMethod.UPI,
                LocalDate.of(2026, 10, 4),
                "Vegetables and milk"
        );

        when(userRepository.findById(101L)).thenReturn(Optional.of(testUser));
        when(expenseCategoryRepository.findById(6L)).thenReturn(Optional.of(groceryCategory));

        Transaction savedTx = new Transaction(testUser, groceryCategory, TransactionType.EXPENSE, amount, "Zepto Grocery Delivery", LocalDate.of(2026, 10, 4), PaymentMethod.UPI);
        savedTx.setId(7001L);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        TransactionResponse response = transactionService.createTransaction(101L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("2850.50"), response.amount());
        assertEquals(TransactionType.EXPENSE, response.transactionType());
        assertEquals(PaymentMethod.UPI, response.paymentMethod());
    }

    @Test
    @DisplayName("Should reject transaction if user attempts to access another user's private category")
    void testRejectUnauthorizedCategoryAccess() {
        User otherUser = new User("Other User", "other@example.com", "hash");
        otherUser.setId(999L);

        ExpenseCategory privateCategory = new ExpenseCategory(otherUser, "Secret Project", CategoryType.EXPENSE, false);
        privateCategory.setId(88L);

        TransactionRequest request = new TransactionRequest(
                new BigDecimal("1000.00"),
                "Private payment",
                TransactionType.EXPENSE,
                88L,
                PaymentMethod.UPI,
                LocalDate.now(),
                null
        );

        when(userRepository.findById(101L)).thenReturn(Optional.of(testUser));
        when(expenseCategoryRepository.findById(88L)).thenReturn(Optional.of(privateCategory));

        assertThrows(UnauthorizedAccessException.class, () ->
                transactionService.createTransaction(101L, request)
        );
    }

    @Test
    @DisplayName("Should reject zero or negative transaction amounts")
    void testRejectZeroOrNegativeAmount() {
        TransactionRequest zeroRequest = new TransactionRequest(
                new BigDecimal("0.00"),
                "Invalid Zero Amount",
                TransactionType.EXPENSE,
                6L,
                PaymentMethod.CASH,
                LocalDate.now(),
                null
        );

        when(userRepository.findById(101L)).thenReturn(Optional.of(testUser));
        when(expenseCategoryRepository.findById(6L)).thenReturn(Optional.of(groceryCategory));

        assertThrows(BusinessValidationException.class, () ->
                transactionService.createTransaction(101L, zeroRequest)
        );
    }
}
