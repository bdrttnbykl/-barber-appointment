package com.barber.booking.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.barber.booking.security.BusinessAuthController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class BusinessAuthInterceptor implements HandlerInterceptor {

	private final BusinessAuthService authService;

	public BusinessAuthInterceptor(BusinessAuthService authService) {
		this.authService = authService;
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		String method = request.getMethod();
		if ("GET".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
			String token = request.getHeader(BusinessAuthController.TOKEN_HEADER);
			if (!authService.isTokenValid(token)) {
				response.sendError(HttpStatus.UNAUTHORIZED.value(), "Invalid or missing business token");
				return false;
			}
		}
		return true;
	}
}
