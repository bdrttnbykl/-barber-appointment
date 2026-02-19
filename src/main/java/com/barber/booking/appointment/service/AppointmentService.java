package com.barber.booking.appointment.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barber.booking.appointment.dto.AppointmentRequest;
import com.barber.booking.appointment.dto.AppointmentResponse;
import com.barber.booking.appointment.dto.AppointmentSummaryDto;
import com.barber.booking.appointment.model.Appointment;
import com.barber.booking.appointment.repository.AppointmentRepository;
import com.barber.booking.config.BookingProperties;
import com.barber.booking.servicecatalog.model.ServiceOffering;
import com.barber.booking.servicecatalog.repository.ServiceOfferingRepository;

import jakarta.transaction.Transactional;

@Service
public class AppointmentService {

	private final AppointmentRepository appointmentRepository;
	private final AvailabilityService availabilityService;
	private final NotificationService notificationService;
	private final BookingProperties bookingProperties;
	private final ServiceOfferingRepository serviceOfferingRepository;

	public AppointmentService(AppointmentRepository appointmentRepository, AvailabilityService availabilityService,
			NotificationService notificationService, BookingProperties bookingProperties,
			ServiceOfferingRepository serviceOfferingRepository) {
		this.appointmentRepository = appointmentRepository;
		this.availabilityService = availabilityService;
		this.notificationService = notificationService;
		this.bookingProperties = bookingProperties;
		this.serviceOfferingRepository = serviceOfferingRepository;
	}

	@Transactional
	public AppointmentResponse createAppointment(AppointmentRequest request) {
		LocalDate date = request.appointmentDate();
		LocalTime slot = request.appointmentTime();

		if (!availabilityService.isSlotWithinBusinessHours(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot is outside working hours");
		}

		if (!availabilityService.isSlotAvailable(date, slot)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu saat dolu");
		}

		if (appointmentRepository.existsByCustomerPhoneAndAppointmentDateGreaterThanEqual(request.customerPhone(),
				LocalDate.now())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu telefon için aktif bir randevu zaten var");
		}

		ServiceOffering offering = serviceOfferingRepository.findById(request.serviceId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service not found"));

		Appointment appointment = new Appointment(bookingProperties.getBarberDefaultId(), date, slot,
				offering.getId(), offering.getName(), offering.getPrice(), offering.getType(), request.customerName(),
				request.customerPhone(), request.customerEmail());

		Appointment saved = appointmentRepository.save(appointment);

		notificationService.sendBookingConfirmation(saved);

		return new AppointmentResponse(saved.getId(), saved.getAppointmentDate(), saved.getSlot(),
				saved.getServiceName(), saved.getCustomerName());
	}

	@Transactional
	public List<AppointmentSummaryDto> listAppointments(LocalDate date) {
		List<Appointment> appointments;
		if (date != null) {
			appointments = appointmentRepository.findByAppointmentDateOrderBySlotAsc(date);
		} else {
			appointments = appointmentRepository
					.findByAppointmentDateGreaterThanEqualOrderByAppointmentDateAscSlotAsc(LocalDate.now());
		}
		return appointments.stream().map(this::toSummary).toList();
	}

	@Transactional
	public List<AppointmentSummaryDto> listAppointmentsForCustomer(String customerPhone) {
		var appointments = appointmentRepository
				.findByCustomerPhoneAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscSlotAsc(customerPhone,
						LocalDate.now());
		return appointments.stream().map(this::toSummary).toList();
	}

	@Transactional
	public AppointmentSummaryDto updateAppointmentServiceForCustomer(Long appointmentId, String customerPhone,
			Long serviceId) {
		Appointment appointment = appointmentRepository.findByIdAndCustomerPhone(appointmentId, customerPhone)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Bu numaraya ait randevu bulunamadı"));
		ServiceOffering offering = serviceOfferingRepository.findById(serviceId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hizmet bulunamadı"));
		appointment.updateService(offering.getId(), offering.getName(), offering.getPrice(), offering.getType());
		Appointment saved = appointmentRepository.save(appointment);
		return toSummary(saved);
	}

	@Transactional
	public AppointmentSummaryDto updateAppointmentScheduleForCustomer(Long appointmentId, String customerPhone,
			LocalDate appointmentDate, LocalTime appointmentTime) {
		if (!availabilityService.isSlotWithinBusinessHours(appointmentTime)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slot is outside working hours");
		}
		Appointment appointment = appointmentRepository.findByIdAndCustomerPhone(appointmentId, customerPhone)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Bu numaraya ait randevu bulunamadı"));
		boolean changed = !appointment.getAppointmentDate().equals(appointmentDate)
				|| !appointment.getSlot().equals(appointmentTime);
		if (changed && appointmentRepository.existsByBarberIdAndAppointmentDateAndSlotAndIdNot(
				appointment.getBarberId(), appointmentDate, appointmentTime, appointment.getId())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Bu saat dolu");
		}
		appointment.reschedule(appointmentDate, appointmentTime);
		Appointment saved = appointmentRepository.save(appointment);
		return toSummary(saved);
	}

	@Transactional
	public void cancelAppointmentForCustomer(Long appointmentId, String customerPhone) {
		if (!appointmentRepository.existsByIdAndCustomerPhone(appointmentId, customerPhone)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bu numaraya ait randevu bulunamadı");
		}
		appointmentRepository.deleteById(appointmentId);
	}

	@Transactional
	public void cancelAppointment(Long appointmentId) {
		if (!appointmentRepository.existsById(appointmentId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
		}
		appointmentRepository.deleteById(appointmentId);
	}

	private AppointmentSummaryDto toSummary(Appointment appointment) {
		return new AppointmentSummaryDto(appointment.getId(), appointment.getServiceId(),
				appointment.getAppointmentDate(), appointment.getSlot(), appointment.getServiceName(),
				appointment.getServiceType(), appointment.getServicePrice(), appointment.getCustomerName(),
				appointment.getCustomerPhone(), appointment.getCustomerEmail());
	}
}
