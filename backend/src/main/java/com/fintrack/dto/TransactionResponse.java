package com.fintrack.dto;

import com.fintrack.entity.Transaction;
import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
    Long id,
    Long userId,
    Long categoryId,
    String categoryName,
    TransactionType transactionType,
    BigDecimal amount,
    String description,
    LocalDate transactionDate,
    PaymentMethod paymentMethod,
    String notes,
    Instant createdAt
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
            t.getId(),
            t.getUser().getId(),
            t.getCategory().getId(),
            t.getCategory().getName(),
            t.getTransactionType(),
            t.getAmount(),
            t.getDescription(),
            t.getTransactionDate(),
            t.getPaymentMethod(),
            t.getNotes(),
            t.getCreatedAt()
        );
    }
}
