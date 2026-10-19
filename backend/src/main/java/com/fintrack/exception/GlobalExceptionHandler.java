package com.fintrack.exception;

import com.fintrack.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "One or more input fields failed validation constraints",
                request.getRequestURI(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessValidationException(
            BusinessValidationException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Business Rule Violation",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler({UnauthorizedAccessException.class, AccessDeniedException.class})
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
            Exception ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.FORBIDDEN.value(),
                "Forbidden Access",
                "You do not have permission to access or modify this financial record",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Authentication Required",
                "Invalid credentials or expired session. Please sign in.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        ApiErrorResponse response = ApiErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "An unexpected server error occurred. Please try again later.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
