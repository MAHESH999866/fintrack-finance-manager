package com.fintrack.service;

import com.fintrack.dto.ChatRequest;
import com.fintrack.dto.ChatResponse;
import com.fintrack.dto.MonthlyFinancialSummaryDto;
import com.fintrack.entity.ChatbotConversation;
import com.fintrack.entity.ChatbotMessage;
import com.fintrack.entity.User;
import com.fintrack.enums.MessageRole;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.repository.ChatbotConversationRepository;
import com.fintrack.repository.ChatbotMessageRepository;
import com.fintrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class ChatbotService {

    private final ChatbotConversationRepository conversationRepository;
    private final ChatbotMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ReportService reportService;

    public ChatbotService(ChatbotConversationRepository conversationRepository,
                          ChatbotMessageRepository messageRepository,
                          UserRepository userRepository,
                          ReportService reportService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.reportService = reportService;
    }

    @Transactional
    public ChatResponse processChatMessage(Long userId, ChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ChatbotConversation conversation;
        if (request.conversationId() != null) {
            conversation = conversationRepository.findByIdAndUserId(request.conversationId(), userId)
                    .orElseGet(() -> createNewConversation(user, request.message()));
        } else {
            conversation = createNewConversation(user, request.message());
        }

        // Save User Message
        ChatbotMessage userMsg = new ChatbotMessage(conversation, MessageRole.USER, request.message().trim());
        messageRepository.save(userMsg);

        // Fetch user financial context
        String currentMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        MonthlyFinancialSummaryDto summary = reportService.getMonthlySummary(userId, currentMonth);

        // Formulate Grounded Financial Advice
        String reply = generateGroundedAdvice(request.message(), summary, user.getFullName());

        // Save Assistant Message
        ChatbotMessage assistantMsg = new ChatbotMessage(conversation, MessageRole.ASSISTANT, reply);
        messageRepository.save(assistantMsg);

        return ChatResponse.of(reply, conversation.getId());
    }

    private ChatbotConversation createNewConversation(User user, String initialMessage) {
        String title = initialMessage.length() > 40 ? initialMessage.substring(0, 37) + "..." : initialMessage;
        ChatbotConversation convo = new ChatbotConversation(user, title);
        return conversationRepository.save(convo);
    }

    private String generateGroundedAdvice(String query, MonthlyFinancialSummaryDto summary, String userName) {
        String lower = query.toLowerCase();

        if (lower.contains("spent") || lower.contains("expense")) {
            return String.format(
                "Namaste %s! For the current month (%s):\n" +
                "• Total Recorded Expenses: ₹%s\n" +
                "• Total Recorded Income: ₹%s\n" +
                "• Expense Budget Planned: ₹%s\n\n" +
                "You still have ₹%s available in your planned expense budget.",
                userName,
                summary.month().format(DateTimeFormatter.ofPattern("MMMM yyyy")),
                summary.totalRecordedExpenses().toPlainString(),
                summary.totalRecordedIncome().toPlainString(),
                summary.totalBudgetedExpense().toPlainString(),
                summary.totalBudgetedExpense().subtract(summary.totalRecordedExpenses()).max(java.math.BigDecimal.ZERO).toPlainString()
            );
        } else if (lower.contains("savings") || lower.contains("target")) {
            return String.format(
                "Savings Health Check for %s:\n" +
                "• Target Monthly Savings Goal: ₹%s\n" +
                "• Actual Net Savings (Income - Expenses): ₹%s\n" +
                "• Savings Rate: %s%% of recorded income\n\n" +
                "Remember: Planned Savings is your intended allocation, while Actual Savings is the real surplus in your account.",
                summary.month().format(DateTimeFormatter.ofPattern("MMMM yyyy")),
                summary.targetSavings().toPlainString(),
                summary.actualSavings().toPlainString(),
                summary.savingsRatePercentage().toPlainString()
            );
        } else if (lower.contains("budget") || lower.contains("over")) {
            return "FinTrack Budget Guidance:\n" +
                   "• Review categories near 80% threshold (amber alert) to prevent unexpected overspending.\n" +
                   "• Prioritize fixed commitments like House Rent and Utilities before non-essential weekend dining.\n" +
                   "• Need to adjust mid-month? You can update your category allocations in the Budgets section anytime.";
        } else {
            return String.format(
                "Namaste %s! Here is your quick financial overview:\n" +
                "• In-hand Income: ₹%s\n" +
                "• Actual Expenses: ₹%s\n" +
                "• Net Realized Savings: ₹%s (Savings Rate: %s%%)\n\n" +
                "Feel free to ask about your budget warnings, expense breakdowns, or how to reach your savings goals!",
                userName,
                summary.totalRecordedIncome().toPlainString(),
                summary.totalRecordedExpenses().toPlainString(),
                summary.actualSavings().toPlainString(),
                summary.savingsRatePercentage().toPlainString()
            );
        }
    }
}
