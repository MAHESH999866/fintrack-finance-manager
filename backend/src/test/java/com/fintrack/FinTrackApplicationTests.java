package com.fintrack;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FinTrackApplicationTests {

    @Test
    @DisplayName("Spring Application Context should boot successfully with H2 test profile")
    void contextLoads() {
        // Verifies full Spring IoC container, entity mappings, and repository configurations
    }
}
