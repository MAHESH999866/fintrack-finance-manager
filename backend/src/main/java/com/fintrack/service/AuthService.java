package com.fintrack.service;

import com.fintrack.dto.*;
import com.fintrack.entity.User;
import com.fintrack.enums.AccountStatus;
import com.fintrack.exception.BusinessValidationException;
import com.fintrack.exception.ResourceNotFoundException;
import com.fintrack.exception.UnauthorizedAccessException;
import com.fintrack.repository.UserRepository;
import com.fintrack.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new BusinessValidationException("An account with email " + request.email().trim() + " already exists.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.fullName().trim(), request.email().trim().toLowerCase(), encodedPassword);
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateTokenForUser(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());

        return new AuthResponse(token, UserProfileDto.from(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedAccessException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new UnauthorizedAccessException("Account is suspended. Please contact FinTrack support.");
        }

        String token = tokenProvider.generateTokenForUser(user.getId(), user.getEmail(), user.getFullName());
        return new AuthResponse(token, UserProfileDto.from(user));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserProfileDto.from(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessValidationException("Current password does not match.");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new BusinessValidationException("New password cannot be the same as the current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
