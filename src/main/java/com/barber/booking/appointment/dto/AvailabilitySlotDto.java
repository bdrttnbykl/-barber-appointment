package com.barber.booking.appointment.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record AvailabilitySlotDto(
		@JsonFormat(pattern = "HH:mm") LocalTime time,
		boolean available) {
}
