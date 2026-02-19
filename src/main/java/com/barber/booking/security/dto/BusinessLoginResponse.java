package com.barber.booking.security.dto;

import java.time.Instant;

public record BusinessLoginResponse(String token, Instant expiresAt) {
}
