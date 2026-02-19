package com.barber.booking.servicecatalog.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barber.booking.servicecatalog.dto.ServiceOfferingDto;
import com.barber.booking.servicecatalog.model.ServiceOffering;
import com.barber.booking.servicecatalog.repository.ServiceOfferingRepository;

@RestController
@RequestMapping("/api/services")
public class ServiceOfferingController {

	private final ServiceOfferingRepository repository;

	public ServiceOfferingController(ServiceOfferingRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	public List<ServiceOfferingDto> list() {
		return repository.findAll().stream().map(this::toDto).toList();
	}

	private ServiceOfferingDto toDto(ServiceOffering offering) {
		return new ServiceOfferingDto(offering.getId(), offering.getName(), offering.getDescription(),
				offering.getPrice());
	}
}
