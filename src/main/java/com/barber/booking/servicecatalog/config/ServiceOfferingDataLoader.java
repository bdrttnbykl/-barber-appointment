package com.barber.booking.servicecatalog.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.barber.booking.appointment.model.ServiceType;
import com.barber.booking.servicecatalog.model.ServiceOffering;
import com.barber.booking.servicecatalog.repository.ServiceOfferingRepository;

@Component
public class ServiceOfferingDataLoader implements CommandLineRunner {

	private final ServiceOfferingRepository repository;

	public ServiceOfferingDataLoader(ServiceOfferingRepository repository) {
		this.repository = repository;
	}

	@Override
	public void run(String... args) {
		if (repository.count() > 0) {
			return;
		}

		List<ServiceOffering> services = List.of(
				new ServiceOffering("Saç & Sakal + Yıkama + Fön",
						"Klasik saç ve sakal bakımı, sıcak havlu ve fön ile birlikte.", new BigDecimal("600"),
						ServiceType.HAIR_AND_BEARD),
				new ServiceOffering("Saç Kesimi + Yıkama + Fön", "Şekillendirme ve yıkama dahil modern saç kesimi.",
						new BigDecimal("500"), ServiceType.HAIRCUT),
				new ServiceOffering("VIP Hizmet",
						"Cilt bakımı, keratinli saç bakımı maskesi ve profesyonel masaj içeren lüks paket.",
						new BigDecimal("2500"), ServiceType.VIP_PACKAGE),
				new ServiceOffering("Profesyonel Buharlı Cilt Bakımı",
						"Derinlemesine temizlik ve nemlendirme sağlayan buharlı bakım seansı.",
						new BigDecimal("900"), ServiceType.VIP_PACKAGE),
				new ServiceOffering("Buharlı Keratinli Saç Bakım Maskesi",
						"Keratin destekli maske ile saçları güçlendiren özel bakım.", new BigDecimal("800"),
						ServiceType.VIP_PACKAGE),
				new ServiceOffering("VIP House Tıraş", "Yerinde hizmet ile premium tıraş ve bakım deneyimi.",
						new BigDecimal("5000"), ServiceType.VIP_PACKAGE));

		repository.saveAll(services);
	}
}
