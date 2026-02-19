package com.barber.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.barber.booking.config.BookingProperties;
import com.barber.booking.config.BusinessPanelProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({ BookingProperties.class, BusinessPanelProperties.class })
public class BarberBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(BarberBookingApplication.class, args);
	}

}
