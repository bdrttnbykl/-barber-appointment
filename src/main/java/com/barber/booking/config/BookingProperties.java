package com.barber.booking.config;

import java.time.Duration;
import java.time.LocalTime;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booking")
public class BookingProperties {

	private LocalTime businessStartHour = LocalTime.of(8, 0);
	private LocalTime businessEndHour = LocalTime.of(20, 0);
	private int slotLengthMinutes = 60;
	private long barberDefaultId = 1L;

	public LocalTime getBusinessStartHour() {
		return businessStartHour;
	}

	public void setBusinessStartHour(LocalTime businessStartHour) {
		this.businessStartHour = businessStartHour;
	}

	public LocalTime getBusinessEndHour() {
		return businessEndHour;
	}

	public void setBusinessEndHour(LocalTime businessEndHour) {
		this.businessEndHour = businessEndHour;
	}

	public int getSlotLengthMinutes() {
		return slotLengthMinutes;
	}

	public void setSlotLengthMinutes(int slotLengthMinutes) {
		this.slotLengthMinutes = slotLengthMinutes;
	}

	public long getBarberDefaultId() {
		return barberDefaultId;
	}

	public void setBarberDefaultId(long barberDefaultId) {
		this.barberDefaultId = barberDefaultId;
	}

	public Duration getSlotDuration() {
		return Duration.ofMinutes(slotLengthMinutes);
	}
}
