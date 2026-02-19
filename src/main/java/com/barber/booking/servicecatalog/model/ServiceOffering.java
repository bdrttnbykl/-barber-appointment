package com.barber.booking.servicecatalog.model;

import java.math.BigDecimal;

import com.barber.booking.appointment.model.ServiceType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_offerings")
public class ServiceOffering {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 160)
	private String name;

	@Column(length = 512)
	private String description;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Enumerated(EnumType.STRING)
	@Column(name = "service_type", nullable = false, length = 32)
	private ServiceType type;

	protected ServiceOffering() {
	}

	public ServiceOffering(String name, String description, BigDecimal price, ServiceType type) {
		this.name = name;
		this.description = description;
		this.price = price;
		this.type = type;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public ServiceType getType() {
		return type;
	}
}
