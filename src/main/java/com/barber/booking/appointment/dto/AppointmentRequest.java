package com.barber.booking.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AppointmentRequest(
		@NotNull @JsonFormat(pattern = "yyyy-MM-dd") LocalDate appointmentDate,
		@NotNull @JsonFormat(pattern = "HH:mm") LocalTime appointmentTime,
		@NotNull Long serviceId,
		@NotBlank String customerName,
		@NotBlank String customerPhone,
		@NotBlank @Email String customerEmail) {
}
