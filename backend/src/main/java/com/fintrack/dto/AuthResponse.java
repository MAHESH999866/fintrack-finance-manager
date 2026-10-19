package com.fintrack.dto;

public record AuthResponse(
    String token,
    UserProfileDto user
) {}
