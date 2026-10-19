package com.fintrack.dto;

import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
    @NotNull(message = "Transaction amount is required")
    @DecimalMin(value = "0.01", message = "Transaction amount must be strictly positive (> 0.00)")
    BigDecimal amount,

    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    String description,

    @NotNull(message = "Transaction type is required (INCOME or EXPENSE)")
    TransactionType transactionType,

    @NotNull(message = "Category ID is required")
    Long categoryId,

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod,

    @NotNull(message = "Transaction date is required")
    LocalDate transactionDate,

    String notes
) {}
