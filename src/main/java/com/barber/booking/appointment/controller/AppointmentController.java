package com.barber.booking.appointment.controller;

import java.time.LocalDate;

import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.barber.booking.appointment.dto.AppointmentRequest;
import com.barber.booking.appointment.dto.AppointmentResponse;
import com.barber.booking.appointment.dto.AppointmentSummaryDto;
import com.barber.booking.appointment.dto.AvailabilityResponse;
import com.barber.booking.appointment.service.AppointmentService;
import com.barber.booking.appointment.service.AvailabilityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@Validated
public class AppointmentController {

	private final AvailabilityService availabilityService;
	private final AppointmentService appointmentService;

	public AppointmentController(AvailabilityService availabilityService, AppointmentService appointmentService) {
		this.availabilityService = availabilityService;
		this.appointmentService = appointmentService;
	}

	@GetMapping("/availability")
	public AvailabilityResponse getAvailability(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return availabilityService.getAvailability(date);
	}

	@PostMapping("/appointments")
	@ResponseStatus(HttpStatus.CREATED)
	public AppointmentResponse createAppointment(@Valid @RequestBody AppointmentRequest request) {
		return appointmentService.createAppointment(request);
	}

	@GetMapping("/appointments")
	public List<AppointmentSummaryDto> listAppointments(
			@RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		return appointmentService.listAppointments(date);
	}

	@DeleteMapping("/appointments/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void cancelAppointment(@PathVariable Long id) {
		appointmentService.cancelAppointment(id);
	}
}
