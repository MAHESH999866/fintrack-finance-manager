package com.fintrack;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

/**
 * Main Spring Boot Application entry point for FinTrack Backend.
 * Standardized to Indian Standard Time (IST) and Indian Rupee (INR) financial accounting.
 */
@SpringBootApplication
@EnableJpaAuditing
public class FinTrackApplication {

    @PostConstruct
    public void init() {
        // Enforce Indian Standard Timezone (Asia/Kolkata) across JVM
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(FinTrackApplication.class, args);
    }
}
