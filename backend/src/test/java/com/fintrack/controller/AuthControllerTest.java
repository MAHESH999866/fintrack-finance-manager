package com.fintrack.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.dto.UserProfileDto;
import com.fintrack.enums.AccountStatus;
import com.fintrack.security.CustomUserDetailsService;
import com.fintrack.security.JwtTokenProvider;
import com.fintrack.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @DisplayName("POST /api/auth/register should return 201 Created on valid input")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Rahul Sharma", "rahul.sharma@fintrack.in", "StrongPassword123!");
        UserProfileDto profile = new UserProfileDto(101L, "Rahul Sharma", "rahul.sharma@fintrack.in", AccountStatus.ACTIVE, "INR", Instant.now());
        AuthResponse response = new AuthResponse("mock_token_jwt", profile);

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock_token_jwt"))
                .andExpect(jsonPath("$.user.email").value("rahul.sharma@fintrack.in"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 OK on valid credentials")
    void testLoginSuccess() throws Exception {
        LoginRequest request = new LoginRequest("rahul.sharma@fintrack.in", "StrongPassword123!");
        UserProfileDto profile = new UserProfileDto(101L, "Rahul Sharma", "rahul.sharma@fintrack.in", AccountStatus.ACTIVE, "INR", Instant.now());
        AuthResponse response = new AuthResponse("mock_token_jwt", profile);

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock_token_jwt"));
    }
}
