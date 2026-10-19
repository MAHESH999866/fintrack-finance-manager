package com.fintrack.controller;

import com.fintrack.dto.TransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.enums.PaymentMethod;
import com.fintrack.enums.TransactionType;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/transactions", "/api/v1/transactions"})
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "type", required = false) TransactionType type,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "paymentMethod", required = false) PaymentMethod paymentMethod) {
        List<TransactionResponse> transactions = transactionService.getTransactions(
                userPrincipal.getId(), month, type, categoryId, paymentMethod);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long id) {
        TransactionResponse tx = transactionService.getTransactionById(userPrincipal.getId(), id);
        return ResponseEntity.ok(tx);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse created = transactionService.createTransaction(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long id,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse updated = transactionService.updateTransaction(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long id) {
        transactionService.deleteTransaction(userPrincipal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
