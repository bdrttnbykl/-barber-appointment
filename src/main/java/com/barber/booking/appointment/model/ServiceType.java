package com.barber.booking.appointment.model;

public enum ServiceType {

	HAIRCUT("Sac Kesimi"),
	BEARD_TRIM("Sakal"),
	VIP_PACKAGE("VIP Paket"),
	HAIR_AND_BEARD("Sac + Sakal");

	private final String displayName;

	ServiceType(String displayName) {
		this.displayName = displayName;
	}

	public String getDisplayName() {
		return displayName;
	}
}
