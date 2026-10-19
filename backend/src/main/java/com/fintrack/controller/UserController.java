package com.fintrack.controller;

import com.fintrack.dto.ChangePasswordRequest;
import com.fintrack.dto.UserProfileDto;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/users", "/api/v1/users"})
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileDto profile = authService.getCurrentUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}
