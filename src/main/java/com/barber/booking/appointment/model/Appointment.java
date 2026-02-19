package com.barber.booking.appointment.model;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "appointments", uniqueConstraints = {
		@UniqueConstraint(name = "uq_barber_date_slot", columnNames = { "barber_id", "appointment_date", "slot" }) })
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "barber_id", nullable = false)
	private Long barberId;

	@Column(name = "appointment_date", nullable = false)
	private LocalDate appointmentDate;

	@Column(name = "slot", nullable = false)
	private LocalTime slot;

	@Column(name = "service_id", nullable = false)
	private Long serviceId;

	@Column(name = "service_name", nullable = false, length = 160)
	private String serviceName;

	@Column(name = "service_price", nullable = false)
	private java.math.BigDecimal servicePrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "service_type", nullable = false, length = 32)
	private ServiceType serviceType;

	@NotBlank
	@Column(name = "customer_name", nullable = false, length = 120)
	private String customerName;

	@NotBlank
	@Column(name = "customer_phone", nullable = false, length = 32)
	private String customerPhone;

	@Email
	@NotBlank
	@Column(name = "customer_email", nullable = false, length = 160)
	private String customerEmail;

	protected Appointment() {
		// for JPA
	}

	public Appointment(Long barberId, LocalDate appointmentDate, LocalTime slot, Long serviceId, String serviceName,
			java.math.BigDecimal servicePrice, ServiceType serviceType, String customerName, String customerPhone,
			String customerEmail) {
		this.barberId = barberId;
		this.appointmentDate = appointmentDate;
		this.slot = slot;
		this.serviceId = serviceId;
		this.serviceName = serviceName;
		this.servicePrice = servicePrice;
		this.serviceType = serviceType;
		this.customerName = customerName;
		this.customerPhone = customerPhone;
		this.customerEmail = customerEmail;
	}

	public void updateService(Long serviceId, String serviceName, java.math.BigDecimal servicePrice,
			ServiceType serviceType) {
		this.serviceId = serviceId;
		this.serviceName = serviceName;
		this.servicePrice = servicePrice;
		this.serviceType = serviceType;
	}

	public void reschedule(LocalDate appointmentDate, LocalTime appointmentTime) {
		this.appointmentDate = appointmentDate;
		this.slot = appointmentTime;
	}

	public Long getId() {
		return id;
	}

	public Long getBarberId() {
		return barberId;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public LocalTime getSlot() {
		return slot;
	}

	public Long getServiceId() {
		return serviceId;
	}

	public String getServiceName() {
		return serviceName;
	}

	public java.math.BigDecimal getServicePrice() {
		return servicePrice;
	}

	public ServiceType getServiceType() {
		return serviceType;
	}

	public String getCustomerName() {
		return customerName;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public String getCustomerEmail() {
		return customerEmail;
	}
}
