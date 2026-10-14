package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.dto.UserRequestDTO;
import com.ngovolunteer.matching.dto.UserResponseDTO;
import com.ngovolunteer.matching.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/users")
public class TestController {

    private final UserService userService;
    private final SessionService sessionService;

    public TestController(UserService userService, SessionService sessionService) {
        this.userService = userService;
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.status(403).body("Use /api/auth/register");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.status(403).body("User listing is not available");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!id.equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.status(403).body("Use role-specific profile update endpoints");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.status(403).body("Account deletion is not supported");
    }
}
