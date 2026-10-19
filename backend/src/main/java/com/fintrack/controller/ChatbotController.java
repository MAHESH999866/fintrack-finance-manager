package com.fintrack.controller;

import com.fintrack.dto.ChatRequest;
import com.fintrack.dto.ChatResponse;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/chat", "/api/v1/chat"})
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatbotService.processChatMessage(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
