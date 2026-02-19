package com.barber.booking.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "business.panel")
public class BusinessPanelProperties {

	private String username = "admin@barber.local";
	private String password = "admin123";
	private Duration sessionTtl = Duration.ofHours(8);

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
