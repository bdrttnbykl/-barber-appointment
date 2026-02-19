package com.barber.booking.security;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.barber.booking.config.BusinessPanelProperties;

@Service
public class BusinessAuthService {

	public record BusinessSession(String token, Instant expiresAt) {
	}

	private final BusinessPanelProperties properties;
	private final Map<String, Instant> activeSessions = new ConcurrentHashMap<>();

	public BusinessAuthService(BusinessPanelProperties properties) {
		this.properties = properties;
	}

	public BusinessSession login(String username, String password) {
		if (!properties.getUsername().equals(username) || !properties.getPassword().equals(password)) {
			return null;
		}
		String token = UUID.randomUUID().toString();
		Instant expiry = Instant.now().plus(properties.getSessionTtl());
		activeSessions.put(token, expiry);
		return new BusinessSession(token, expiry);
	}

	public boolean isTokenValid(String token) {
		if (token == null) {
			return false;
		}
		Instant expiry = activeSessions.get(token);
		if (expiry == null) {
			return false;
		}
		if (expiry.isBefore(Instant.now())) {
			activeSessions.remove(token);
			return false;
		}
		return true;
	}

	public void logout(String token) {
		if (token != null) {
			activeSessions.remove(token);
		}
	}
}
