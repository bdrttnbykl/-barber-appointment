package com.barber.booking.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotNull;

public record AppointmentRescheduleRequest(
		@NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate appointmentDate,
		@NotNull @JsonFormat(pattern = "HH:mm") LocalTime appointmentTime) {
}
