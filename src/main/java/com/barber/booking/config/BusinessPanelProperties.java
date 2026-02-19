package com.barber.booking.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;

@ConfigurationProperties(prefix = "business.panel")
public class BusinessPanelProperties {

    // Default boş bırakma: config'ten gelecek
    private String username;
    private String password;
    private Duration sessionTtl = Duration.ofHours(8);

    @PostConstruct
    void validate() {
        if (!StringUtils.hasText(username)) {
            throw new IllegalStateException("Missing config: business.panel.username (or env BUSINESS_PANEL_USERNAME)");
        }
        if (!StringUtils.hasText(password)) {
            throw new IllegalStateException("Missing config: business.panel.password (or env BUSINESS_PANEL_PASSWORD)");
        }
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Duration getSessionTtl() {
        return sessionTtl;
    }

    public void setSessionTtl(Duration sessionTtl) {
        this.sessionTtl = sessionTtl;
    }
}

