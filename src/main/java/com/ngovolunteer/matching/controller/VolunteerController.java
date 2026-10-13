package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Volunteer;
import com.ngovolunteer.matching.service.VolunteerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import com.ngovolunteer.matching.repository.VolunteerRepository;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    private final VolunteerService volunteerService;
    private final SessionService sessionService;
    private final VolunteerRepository volunteerRepository;

    public VolunteerController(VolunteerService volunteerService, SessionService sessionService, VolunteerRepository volunteerRepository) {
        this.volunteerService = volunteerService;
        this.sessionService = sessionService;
        this.volunteerRepository = volunteerRepository;
    }

    @PostMapping
    public ResponseEntity<?> createVolunteer(@RequestBody Volunteer volunteer, HttpSession session) {
        return ResponseEntity.status(403).body("Volunteer profiles are created during registration");
    }

    @GetMapping
    public ResponseEntity<?> getAllVolunteers(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (sessionService.hasRole(session, "NGO")) return ResponseEntity.ok(volunteerService.getAllVolunteers());
        if (sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.ok(volunteerRepository.findByUserId(sessionService.getLoggedInUserId(session)).stream().toList());
        return ResponseEntity.status(403).body("Access denied");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVolunteerById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Volunteer v = volunteerService.getVolunteerById(id);
        if (v == null) return ResponseEntity.notFound().build();
        if (!sessionService.hasRole(session, "NGO") && !(sessionService.hasRole(session, "VOLUNTEER") && v.getUser().getId().equals(sessionService.getLoggedInUserId(session)))) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(v);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVolunteer(@PathVariable Long id, @RequestBody Volunteer volunteer, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.status(403).body("Only volunteers can update their profile");
        Volunteer existing = volunteerService.getVolunteerById(id);
        if (existing == null || !existing.getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.notFound().build();
        existing.setLocation(volunteer.getLocation()); existing.setAvailability(volunteer.getAvailability());
        return ResponseEntity.ok(volunteerService.updateVolunteer(id, existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteer(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Profile deletion is not supported");
    }
}
