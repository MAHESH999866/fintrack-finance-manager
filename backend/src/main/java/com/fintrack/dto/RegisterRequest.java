package com.fintrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 150, message = "Email cannot exceed 150 characters")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    String password
) {}
