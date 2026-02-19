package com.barber.booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.barber.booking.security.BusinessAuthInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	private final BusinessAuthInterceptor businessAuthInterceptor;

	public WebMvcConfig(BusinessAuthInterceptor businessAuthInterceptor) {
		this.businessAuthInterceptor = businessAuthInterceptor;
	}

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(businessAuthInterceptor).addPathPatterns("/api/appointments/**");
	}
}
