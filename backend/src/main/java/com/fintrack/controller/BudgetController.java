package com.fintrack.controller;

import com.fintrack.dto.BudgetUtilizationResponse;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/budgets", "/api/v1/budgets"})
public class BudgetController {

    private final ReportService reportService;

    public BudgetController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<BudgetUtilizationResponse> getBudgets(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month) {
        BudgetUtilizationResponse response = reportService.getBudgetUtilization(userPrincipal.getId(), month);
        return ResponseEntity.ok(response);
    }
}
