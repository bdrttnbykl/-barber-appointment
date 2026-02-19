package com.barber.booking.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record AppointmentResponse(
		Long id,
		@JsonFormat(pattern = "yyyy-MM-dd") LocalDate appointmentDate,
		@JsonFormat(pattern = "HH:mm") LocalTime appointmentTime,
		String serviceName,
		String customerName) {
}
