package com.fintrack.dto;

import java.time.Instant;

public record ChatResponse(
    String message,
    Long conversationId,
    Instant timestamp
) {
    public static ChatResponse of(String message, Long conversationId) {
        return new ChatResponse(message, conversationId, Instant.now());
    }
}
