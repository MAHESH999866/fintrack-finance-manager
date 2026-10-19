package com.fintrack.controller;

import com.fintrack.dto.MonthlyPlanRequest;
import com.fintrack.dto.MonthlyPlanResponse;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.MonthlyPlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/monthly-plans", "/api/v1/monthly-plans"})
public class MonthlyPlanController {

    private final MonthlyPlanService monthlyPlanService;

    public MonthlyPlanController(MonthlyPlanService monthlyPlanService) {
        this.monthlyPlanService = monthlyPlanService;
    }

    @GetMapping
    public ResponseEntity<MonthlyPlanResponse> getPlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "month", required = false) String monthStr) {
        LocalDate date = LocalDate.now();
        if (monthStr != null && !monthStr.isBlank()) {
            String[] parts = monthStr.split("-");
            if (parts.length >= 2) {
                date = LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), 1);
            }
        }
        return monthlyPlanService.getPlanForMonth(userPrincipal.getId(), date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<MonthlyPlanResponse> savePlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody MonthlyPlanRequest request) {
        MonthlyPlanResponse plan = monthlyPlanService.saveOrUpdatePlan(userPrincipal.getId(), request);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/all")
    public ResponseEntity<List<MonthlyPlanResponse>> getAllPlans(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MonthlyPlanResponse> list = monthlyPlanService.getAllPlans(userPrincipal.getId());
        return ResponseEntity.ok(list);
    }
}
