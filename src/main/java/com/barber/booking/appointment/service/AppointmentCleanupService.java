package com.barber.booking.appointment.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.barber.booking.appointment.repository.AppointmentRepository;

@Component
public class AppointmentCleanupService {

	private static final Logger log = LoggerFactory.getLogger(AppointmentCleanupService.class);

	private final AppointmentRepository appointmentRepository;

	public AppointmentCleanupService(AppointmentRepository appointmentRepository) {
		this.appointmentRepository = appointmentRepository;
	}

	private static final int RETENTION_DAYS = 10;

	/**
	 * Deletes all appointments whose date is older than the retention window. Runs once
	 * per day at 02:00.
	 */
	@Scheduled(cron = "0 0 2 * * *")
	public void purgePastAppointments() {
		LocalDate cutoff = LocalDate.now().minusDays(RETENTION_DAYS);
		long deleted = appointmentRepository.deleteByAppointmentDateBefore(cutoff);
		if (deleted > 0) {
			log.info("Deleted {} past appointments older than {}", deleted, cutoff);
		}
	}
}
