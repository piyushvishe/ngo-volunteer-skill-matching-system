package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.dto.LoginRequest;
import com.ngovolunteer.matching.dto.LoginResponse;
import com.ngovolunteer.matching.entity.User;
import com.ngovolunteer.matching.service.AuthService;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.ActivityLogService;
import com.ngovolunteer.matching.dto.ChangePasswordRequest;
import com.ngovolunteer.matching.dto.RegisterRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;
    private final ActivityLogService activityLogService;

    public AuthController(AuthService authService,
                          SessionService sessionService,
                          ActivityLogService activityLogService) {
        this.authService = authService;
        this.sessionService = sessionService;
        this.activityLogService = activityLogService;
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpSession session) {

        User user = authService.findUserByEmail(request.getEmail());

        if (user == null) {
            System.out.println(
                    "LOGIN FAILED: Unknown email " + request.getEmail()
            );

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        if (!authService.checkPassword(
                request.getPassword(),
                user.getPassword())) {

            System.out.println(
                    "LOGIN FAILED: Invalid password for " + user.getEmail()
            );

            activityLogService.log(
                    user.getId(),
                    "LOGIN_FAILED",
                    "Invalid password"
            );

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userRole", user.getRole());
        System.out.println("LOGIN SUCCESS: User " + user.getEmail() + " logged in successfully");

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
                        user.getRole()
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }
    @GetMapping("/session")
    public ResponseEntity<?> session(HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        return ResponseEntity.ok(
                "User ID: " + sessionService.getLoggedInUserId(session)
        );
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
            @RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User savedUser = authService.register(user);

        return ResponseEntity.ok(
                new LoginResponse(
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole()
                )
        );
    }
}