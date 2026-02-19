package com.barber.booking.servicecatalog.dto;

import java.math.BigDecimal;

public record ServiceOfferingDto(Long id, String name, String description, BigDecimal price) {
}
