package com.barber.booking.appointment.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.barber.booking.appointment.dto.AppointmentRescheduleRequest;
import com.barber.booking.appointment.dto.AppointmentServiceUpdateRequest;
import com.barber.booking.appointment.dto.AppointmentSummaryDto;
import com.barber.booking.appointment.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customer/appointments")
public class CustomerAppointmentController {

	private final AppointmentService appointmentService;

	public CustomerAppointmentController(AppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	@GetMapping
	public List<AppointmentSummaryDto> listByPhone(@RequestParam("phone") String phone) {
		if (!StringUtils.hasText(phone)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarası gerekli");
		}
		return appointmentService.listAppointmentsForCustomer(phone);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void cancelByPhone(@PathVariable Long id, @RequestParam("phone") String phone) {
		if (!StringUtils.hasText(phone)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarası gerekli");
		}
		appointmentService.cancelAppointmentForCustomer(id, phone);
	}

	@PatchMapping("/{id}/service")
	public AppointmentSummaryDto updateService(@PathVariable Long id, @RequestParam("phone") String phone,
			@RequestBody @Valid AppointmentServiceUpdateRequest request) {
		if (!StringUtils.hasText(phone)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarası gerekli");
		}
		return appointmentService.updateAppointmentServiceForCustomer(id, phone, request.serviceId());
	}

	@PatchMapping("/{id}/slot")
	public AppointmentSummaryDto updateSchedule(@PathVariable Long id, @RequestParam("phone") String phone,
			@RequestBody @Valid AppointmentRescheduleRequest request) {
		if (!StringUtils.hasText(phone)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarası gerekli");
		}
		return appointmentService.updateAppointmentScheduleForCustomer(id, phone, request.appointmentDate(),
				request.appointmentTime());
	}
}
