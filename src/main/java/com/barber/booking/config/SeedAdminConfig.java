package com.barber.booking.config;

import com.barber.booking.entity.User;
import com.barber.booking.repository.UserRepository;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedAdminConfig {

    @Bean
    CommandLineRunner seedAdmin(UserRepository userRepository,
                                PasswordEncoder passwordEncoder) {
        return args -> {

            String email = System.getenv().getOrDefault("ADMIN_EMAIL", "admin@barber.local");
            String rawPassword = System.getenv().getOrDefault("ADMIN_PASSWORD", "admin1234");

            userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    System.out.println("Admin already exists.");
                },
                () -> {
                    User admin = new User();
                    admin.setEmail(email);
                    admin.setPassword(passwordEncoder.encode(rawPassword));
                    admin.setRole("ADMIN"); // role alanı sende farklıysa değiştir

                    userRepository.save(admin);
                    System.out.println("Admin user created.");
                }
            );
        };
    }
}
