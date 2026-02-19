package com.barber.booking.appointment.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.barber.booking.appointment.dto.AvailabilityResponse;
import com.barber.booking.appointment.dto.AvailabilitySlotDto;
import com.barber.booking.appointment.repository.AppointmentRepository;
import com.barber.booking.config.BookingProperties;

import jakarta.transaction.Transactional;

@Service
public class AvailabilityService {

	private final AppointmentRepository appointmentRepository;
	private final BookingProperties bookingProperties;

	public AvailabilityService(AppointmentRepository appointmentRepository, BookingProperties bookingProperties) {
		this.appointmentRepository = appointmentRepository;
		this.bookingProperties = bookingProperties;
	}

	@Transactional
	public AvailabilityResponse getAvailability(LocalDate date) {
		var appointments = appointmentRepository.findByBarberIdAndAppointmentDate(
				bookingProperties.getBarberDefaultId(), date);
		Set<LocalTime> bookedSlots = appointments.stream().map(appointment -> appointment.getSlot())
				.collect(Collectors.toSet());

		List<AvailabilitySlotDto> slots = new ArrayList<>();
		for (LocalTime cursor = bookingProperties.getBusinessStartHour(); isSlotStartWithinBusinessHours(cursor); cursor = cursor
				.plus(bookingProperties.getSlotDuration())) {
			if (cursor.equals(LocalTime.NOON)) {
				continue;
			}
			boolean available = !bookedSlots.contains(cursor);
			slots.add(new AvailabilitySlotDto(cursor, available));
		}
		return new AvailabilityResponse(date, slots);
	}

	public boolean isSlotAvailable(LocalDate date, LocalTime slot) {
		return isSlotWithinBusinessHours(slot)
				&& !appointmentRepository.existsByBarberIdAndAppointmentDateAndSlot(
						bookingProperties.getBarberDefaultId(), date, slot);
	}

	public boolean isSlotWithinBusinessHours(LocalTime slot) {
		return isSlotStartWithinBusinessHours(slot);
	}

	private boolean isSlotStartWithinBusinessHours(LocalTime slot) {
		return !slot.isBefore(bookingProperties.getBusinessStartHour())
				&& !slot.isAfter(bookingProperties.getBusinessEndHour());
	}
}
