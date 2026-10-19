package com.fintrack.controller;

import com.fintrack.dto.*;
import com.fintrack.security.UserPrincipal;
import com.fintrack.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileDto profile = authService.getCurrentUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userPrincipal.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}
