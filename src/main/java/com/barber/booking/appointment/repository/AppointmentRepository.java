package com.barber.booking.appointment.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barber.booking.appointment.model.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

	List<Appointment> findByBarberIdAndAppointmentDate(Long barberId, LocalDate appointmentDate);

	boolean existsByBarberIdAndAppointmentDateAndSlot(Long barberId, LocalDate appointmentDate, LocalTime slot);

	List<Appointment> findByAppointmentDateOrderBySlotAsc(LocalDate appointmentDate);

	List<Appointment> findByAppointmentDateGreaterThanEqualOrderByAppointmentDateAscSlotAsc(LocalDate fromDate);

	long deleteByAppointmentDateBefore(LocalDate cutoffDate);

	boolean existsByCustomerPhoneAndAppointmentDateGreaterThanEqual(String customerPhone, LocalDate fromDate);

	List<Appointment> findByCustomerPhoneAndAppointmentDateGreaterThanEqualOrderByAppointmentDateAscSlotAsc(
			String customerPhone, LocalDate fromDate);

	Optional<Appointment> findByIdAndCustomerPhone(Long id, String customerPhone);

	boolean existsByIdAndCustomerPhone(Long id, String customerPhone);

	boolean existsByBarberIdAndAppointmentDateAndSlotAndIdNot(Long barberId, LocalDate appointmentDate,
			LocalTime slot, Long id);
}
