package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.dto.LoginResponse;
import com.ngovolunteer.matching.entity.User;
import com.ngovolunteer.matching.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TestController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/user")
    public LoginResponse createUser(@RequestBody User user) {

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @GetMapping("/users")
    public List<LoginResponse> getUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> new LoginResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }
}