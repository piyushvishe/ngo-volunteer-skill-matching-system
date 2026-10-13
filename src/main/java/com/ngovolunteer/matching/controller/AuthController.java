package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.dto.LoginRequest;
import com.ngovolunteer.matching.dto.LoginResponse;
import com.ngovolunteer.matching.entity.User;
import com.ngovolunteer.matching.service.AuthService;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.ActivityLogService;
import com.ngovolunteer.matching.dto.ChangePasswordRequest;
import com.ngovolunteer.matching.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;
    private final ActivityLogService activityLogService;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(AuthService authService,
                          SessionService sessionService,
                          ActivityLogService activityLogService,
                          SecurityContextRepository securityContextRepository) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.activityLogService = activityLogService;
        this.securityContextRepository = securityContextRepository;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpSession session, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {

        User user = authService.findUserByEmail(request.getEmail());

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        if (!authService.checkPassword(
                request.getPassword(),
                user.getPassword())) {

            activityLogService.log(
                    user.getId(),
                    "LOGIN_FAILED",
                    "Invalid password"
            );

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        authService.ensureProfile(user);

        session.invalidate();
        HttpSession authenticatedSession = servletRequest.getSession(true);
        authenticatedSession.setAttribute("userId", user.getId());
        authenticatedSession.setAttribute("userEmail", user.getEmail());
        authenticatedSession.setAttribute("userRole", user.getRole());
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                user.getEmail(), null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase())));
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
        securityContextRepository.saveContext(securityContext, servletRequest, servletResponse);

        activityLogService.log(
                user.getId(),
                "LOGIN",
                "User logged in successfully"
        );

        return ResponseEntity.ok(
                new LoginResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(), user.getPhone()
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/csrf")
    public Map<String, String> csrfToken(CsrfToken csrfToken) {
        return Map.of("headerName", csrfToken.getHeaderName(), "token", csrfToken.getToken());
    }

    @GetMapping("/session")
    public ResponseEntity<?> session(HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        User user = authService.findUserByEmail((String) session.getAttribute("userEmail"));
        if (user == null) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone()));
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        boolean changed = authService.changePassword(
                userId,
                request.getOldPassword(),
                request.getNewPassword()
        );

        if (!changed) {
            return ResponseEntity.status(400)
                    .body("Old password is incorrect");
        }

        activityLogService.log(
                userId,
                "PASSWORD_CHANGE",
                "User changed password successfully"
        );

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User savedUser = authService.register(user, request.getLocation(), request.getAvailability(),
                request.getOrganisationName(), request.getDomain());

        return ResponseEntity.ok(
                new LoginResponse(
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole(), savedUser.getPhone()
                )
        );
    }
}
