package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.enums.TransactionType;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/reports", "/api/v1/reports"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<MonthlyFinancialSummaryDto> getSummary(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month) {
        MonthlyFinancialSummaryDto summary = reportService.getMonthlySummary(userPrincipal.getId(), month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/planned-vs-actual")
    public ResponseEntity<BudgetUtilizationResponse> getPlannedVsActual(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month) {
        BudgetUtilizationResponse response = reportService.getBudgetUtilization(userPrincipal.getId(), month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category-spending")
    public ResponseEntity<List<CategorySpendingReportDto>> getCategorySpending(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month,
            @RequestParam(value = "type", required = false) TransactionType type) {
        List<CategorySpendingReportDto> breakdown = reportService.getCategoryBreakdown(userPrincipal.getId(), month, type);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/daily-trends")
    public ResponseEntity<List<DailyExpenseTrendDto>> getDailyTrends(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String month) {
        List<DailyExpenseTrendDto> trends = reportService.getDailyExpenseTrend(userPrincipal.getId(), month);
        return ResponseEntity.ok(trends);
    }
}
