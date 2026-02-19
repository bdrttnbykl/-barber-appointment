package com.barber.booking.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barber.booking.security.BusinessAuthService.BusinessSession;
import com.barber.booking.security.dto.BusinessLoginRequest;
import com.barber.booking.security.dto.BusinessLoginResponse;

@RestController
@RequestMapping("/admin")
@Validated
public class BusinessAuthController {

	public static final String TOKEN_HEADER = "X-Business-Token";
	private final BusinessAuthService authService;

	public BusinessAuthController(BusinessAuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<BusinessLoginResponse> login(@RequestBody BusinessLoginRequest request) {
		BusinessSession session = authService.login(request.username(), request.password());
		if (session == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(new BusinessLoginResponse(session.token(), session.expiresAt()));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(@RequestHeader(value = TOKEN_HEADER, required = false) String token) {
		authService.logout(token);
		return ResponseEntity.noContent().build();
	}
}
