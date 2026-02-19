package com.barber.booking.appointment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.barber.booking.appointment.model.Appointment;

@Service
public class NotificationService {

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final ObjectProvider<JavaMailSender> mailSenderProvider;

	public NotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
		this.mailSenderProvider = mailSenderProvider;
	}

	public void sendBookingConfirmation(Appointment appointment) {
		if (appointment.getCustomerEmail() == null || appointment.getCustomerEmail().isBlank()) {
			log.debug("No customer email provided, skipping notification");
			return;
		}

		JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
		if (mailSender == null) {
			log.debug("MailSender not available, skipping email notification");
			return;
		}
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(appointment.getCustomerEmail());
			message.setSubject("Randevunuz Onaylandı");
			message.setText(buildBody(appointment));
			mailSender.send(message);
		} catch (Exception ex) {
			log.warn("Mail delivery failed: {}", ex.getMessage());
		}
	}

	private String buildBody(Appointment appointment) {
		return """
				Merhaba %s,

				Randevunuz onaylandı.
				Tarih: %s
				Saat: %s
				Hizmet: %s

				Herhangi bir değişiklik için bize yanıt verebilirsiniz.
				Görüşmek üzere!
				""".formatted(appointment.getCustomerName(), appointment.getAppointmentDate(), appointment.getSlot(),
				appointment.getServiceName());
	}
}
