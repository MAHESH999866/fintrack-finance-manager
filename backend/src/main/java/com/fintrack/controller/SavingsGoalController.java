package com.fintrack.controller;

import com.fintrack.dto.SavingsContributionRequest;
import com.fintrack.dto.SavingsContributionResponse;
import com.fintrack.dto.SavingsGoalProgressDto;
import com.fintrack.dto.SavingsGoalRequest;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/savings-goals", "/api/v1/savings-goals"})
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalProgressDto>> getGoals(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SavingsGoalProgressDto> goals = savingsGoalService.getAllGoalsWithProgress(userPrincipal.getId());
        return ResponseEntity.ok(goals);
    }

    @PostMapping
    public ResponseEntity<SavingsGoalProgressDto> createGoal(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SavingsGoalRequest request) {
        SavingsGoalProgressDto created = savingsGoalService.createGoal(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/contributions")
    public ResponseEntity<SavingsContributionResponse> addContribution(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SavingsContributionRequest request) {
        SavingsContributionResponse response = savingsGoalService.addContribution(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<List<SavingsContributionResponse>> getContributions(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") Long id) {
        List<SavingsContributionResponse> list = savingsGoalService.getContributionsForGoal(userPrincipal.getId(), id);
        return ResponseEntity.ok(list);
    }
}
