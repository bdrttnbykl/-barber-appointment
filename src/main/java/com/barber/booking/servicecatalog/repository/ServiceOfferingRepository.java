package com.barber.booking.servicecatalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barber.booking.servicecatalog.model.ServiceOffering;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {
}
