package com.barber.booking.security.dto;

import jakarta.validation.constraints.NotBlank;

public record BusinessLoginRequest(
		@NotBlank String username,
		@NotBlank String password) {
}
