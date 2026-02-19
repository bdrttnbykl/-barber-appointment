package com.barber.booking.appointment.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.barber.booking.appointment.model.ServiceType;
import com.fasterxml.jackson.annotation.JsonFormat;

public record AppointmentSummaryDto(
		Long id,
		Long serviceId,
		@JsonFormat(pattern = "yyyy-MM-dd") LocalDate appointmentDate,
		@JsonFormat(pattern = "HH:mm") LocalTime appointmentTime,
		String serviceName,
		ServiceType serviceType,
		BigDecimal servicePrice,
		String customerName,
		String customerPhone,
		String customerEmail) {
}
