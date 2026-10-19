package com.fintrack.dto;

import com.fintrack.enums.AccountStatus;

public record UserProfileDto(
    Long id,
    String fullName,
    String email,
    AccountStatus accountStatus,
    String currency,
    String avatarText
) {
    public static UserProfileDto from(com.fintrack.entity.User user) {
        String initials = "U";
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            String[] parts = user.getFullName().trim().split("\\s+");
            if (parts.length >= 2) {
                initials = ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
            } else if (parts.length == 1 && !parts[0].isEmpty()) {
                initials = ("" + parts[0].charAt(0)).toUpperCase();
            }
        }
        return new UserProfileDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getAccountStatus(),
            "INR",
            initials
        );
    }
}
