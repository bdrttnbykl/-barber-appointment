package com.barber.booking.appointment.dto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;

public record AvailabilityResponse(
		@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
		List<AvailabilitySlotDto> slots) {
}
