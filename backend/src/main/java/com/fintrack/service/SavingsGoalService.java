package com.fintrack.service;

import com.fintrack.dto.SavingsContributionRequest;
import com.fintrack.dto.SavingsContributionResponse;
import com.fintrack.dto.SavingsGoalProgressDto;
import com.fintrack.dto.SavingsGoalRequest;
import com.fintrack.entity.SavingsContribution;
import com.fintrack.entity.SavingsGoal;
import com.fintrack.entity.User;
import com.fintrack.enums.GoalStatus;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.UnauthorizedAccessException;
import com.fintrack.repository.SavingsContributionRepository;
import com.fintrack.repository.SavingsGoalRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsContributionRepository savingsContributionRepository;
    private final UserRepository userRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository,
                              SavingsContributionRepository savingsContributionRepository,
                              UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.savingsContributionRepository = savingsContributionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<SavingsGoalProgressDto> getAllGoalsWithProgress(Long userId) {
        List<SavingsGoal> goals = savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return goals.stream().map(g -> {
            long count = savingsContributionRepository.countBySavingsGoalId(g.getId());
            return SavingsGoalProgressDto.of(
                    g.getId(),
                    g.getName(),
                    g.getTargetAmount(),
                    g.getCurrentAmount(),
                    g.getTargetDate(),
                    g.getStatus(),
                    count
            );
        }).toList();
    }

    @Transactional
    public SavingsGoalProgressDto createGoal(Long userId, SavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        BigDecimal targetAmount = request.targetAmount().setScale(2, RoundingMode.HALF_UP);
        if (targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Target savings amount must be strictly greater than zero (> 0.00).");
        }

        SavingsGoal goal = new SavingsGoal(user, request.name().trim(), targetAmount);
        goal.setTargetDate(request.targetDate());
        goal.setStatus(GoalStatus.ACTIVE);

        SavingsGoal saved = savingsGoalRepository.save(goal);
        return SavingsGoalProgressDto.of(
                saved.getId(),
                saved.getName(),
                saved.getTargetAmount(),
                saved.getCurrentAmount(),
                saved.getTargetDate(),
                saved.getStatus(),
                0L
        );
    }

    @Transactional
    public SavingsContributionResponse addContribution(Long userId, SavingsContributionRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(request.savingsGoalId())
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + request.savingsGoalId()));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have access to this savings goal.");
        }

        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Contribution amount must be strictly positive (> 0.00).");
        }

        SavingsContribution contribution = new SavingsContribution(
                goal,
                amount,
                request.contributionDate(),
                request.description() != null ? request.description().trim() : null
        );

        SavingsContribution savedContribution = savingsContributionRepository.save(contribution);

        // Update goal accumulated balance
        BigDecimal updatedCurrent = goal.getCurrentAmount().add(amount).setScale(2, RoundingMode.HALF_UP);
        goal.setCurrentAmount(updatedCurrent);

        // Auto-complete status if target reached
        if (updatedCurrent.compareTo(goal.getTargetAmount()) >= 0 && goal.getStatus() == GoalStatus.ACTIVE) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        savingsGoalRepository.save(goal);
        return SavingsContributionResponse.from(savedContribution);
    }

    @Transactional(readOnly = true)
    public List<SavingsContributionResponse> getContributionsForGoal(Long userId, Long goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You do not have access to this savings goal.");
        }

        return savingsContributionRepository.findBySavingsGoalIdOrderByContributionDateDesc(goalId).stream()
                .map(SavingsContributionResponse::from)
                .toList();
    }
}
