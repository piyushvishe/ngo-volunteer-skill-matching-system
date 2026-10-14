package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.User;
import com.ngovolunteer.matching.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ngovolunteer.matching.entity.Volunteer;
import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import com.ngovolunteer.matching.repository.NgoRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VolunteerRepository volunteerRepository;
    private final NgoRepository ngoRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            VolunteerRepository volunteerRepository,
            NgoRepository ngoRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.volunteerRepository = volunteerRepository;
        this.ngoRepository = ngoRepository;
    }

    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public boolean checkPassword(
            String rawPassword,
            String encodedPassword) {

        return passwordEncoder.matches(
                rawPassword,
                encodedPassword
        );
    }

    @Transactional
    public void ensureProfile(User user) {
        if ("VOLUNTEER".equalsIgnoreCase(user.getRole()) && volunteerRepository.findByUserId(user.getId()).isEmpty()) {
            Volunteer v = new Volunteer(); v.setUser(user); volunteerRepository.save(v);
        } else if ("NGO".equalsIgnoreCase(user.getRole()) && ngoRepository.findByUserId(user.getId()).isEmpty()) {
            Ngo ngo = new Ngo(); ngo.setUser(user); ngo.setOrganisationName(user.getName()); ngoRepository.save(ngo);
        }
    }

    public boolean changePassword(
            Long userId,
            String oldPassword,
            String newPassword) {

        User user = userRepository
                .findById(userId)
                .orElse(null);

        if (user == null) {
            return false;
        }

        if (!passwordEncoder.matches(
                oldPassword,
                user.getPassword())) {

            return false;
        }

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        return true;
    }

    @Transactional
    public User register(User user, String location, String availability,
                         String organisationName, String domain) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        String role = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();
        if (!role.equals("VOLUNTEER") && !role.equals("NGO")) {
            throw new IllegalArgumentException("Role must be VOLUNTEER or NGO");
        }
        user.setRole(role);
        User saved = userRepository.save(user);
        if (role.equals("VOLUNTEER")) {
            Volunteer volunteer = new Volunteer();
            volunteer.setUser(saved);
            volunteer.setLocation(location);
            volunteer.setAvailability(availability);
            volunteerRepository.save(volunteer);
        } else {
            Ngo ngo = new Ngo();
            ngo.setUser(saved);
            ngo.setOrganisationName(organisationName == null || organisationName.isBlank() ? saved.getName() : organisationName.trim());
            ngo.setDomain(domain);
            ngoRepository.save(ngo);
        }
        return saved;
    }
}
