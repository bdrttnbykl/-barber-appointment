package com.barber.booking.appointment.dto;

import jakarta.validation.constraints.NotNull;

public record AppointmentServiceUpdateRequest(@NotNull Long serviceId) {
}
