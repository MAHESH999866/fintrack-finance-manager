package com.fintrack.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Standard RFC 7807 compliant API error response structure.
 */
public record ApiErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> validationErrors
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, null);
    }

    public static ApiErrorResponse of(int status, String error, String message, String path, Map<String, String> validationErrors) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, validationErrors);
    }
}
