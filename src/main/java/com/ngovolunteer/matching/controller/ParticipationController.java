package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Participation;
import com.ngovolunteer.matching.service.ParticipationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/participations")
public class ParticipationController {

    private final ParticipationService participationService;
    private final com.ngovolunteer.matching.repository.ParticipationRepository participationRepository;
    private final SessionService sessionService;

    public ParticipationController(ParticipationService participationService,
            com.ngovolunteer.matching.repository.ParticipationRepository participationRepository,
            SessionService sessionService) {
        this.participationService = participationService;
        this.participationRepository = participationRepository;
        this.sessionService = sessionService;
    }

    @PostMapping("/assignments/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, @RequestParam Integer hours, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.status(403).body("Only volunteers can complete assignments");
        return ResponseEntity.ok(participationService.complete(id, sessionService.getLoggedInUserId(session), hours));
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<?> rate(@PathVariable Long id, @RequestParam Integer rating, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "NGO")) return ResponseEntity.status(403).body("Only NGOs can rate participation");
        return ResponseEntity.ok(participationService.rate(id, sessionService.getLoggedInUserId(session), rating));
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Long userId = sessionService.getLoggedInUserId(session);
        if (sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.ok(participationRepository.findByAssignmentVolunteerUserId(userId));
        if (sessionService.hasRole(session, "NGO")) return ResponseEntity.ok(participationRepository.findByAssignmentRequirementNgoUserId(userId));
        return ResponseEntity.status(403).body("Access denied");
    }

    @PostMapping
    public ResponseEntity<?> createParticipation(@RequestBody Participation participation, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Participation is recorded through assignment completion");
    }

    @GetMapping
    public ResponseEntity<?> getAllParticipations(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Long userId = sessionService.getLoggedInUserId(session);
        if (sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.ok(participationRepository.findByAssignmentVolunteerUserId(userId));
        if (sessionService.hasRole(session, "NGO")) return ResponseEntity.ok(participationRepository.findByAssignmentRequirementNgoUserId(userId));
        return ResponseEntity.status(403).body("Access denied");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getParticipationById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Participation p = participationService.getParticipationById(id);
        if (p == null) return ResponseEntity.notFound().build();
        Long userId = sessionService.getLoggedInUserId(session);
        boolean owner = sessionService.hasRole(session, "VOLUNTEER") && p.getAssignment().getVolunteer().getUser().getId().equals(userId)
                || sessionService.hasRole(session, "NGO") && p.getAssignment().getRequirement().getNgo().getUser().getId().equals(userId);
        return owner ? ResponseEntity.ok(p) : ResponseEntity.status(403).body("Access denied");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParticipation(
            @PathVariable Long id,
            @RequestBody Participation participation, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Participation records are immutable");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteParticipation(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Participation records cannot be deleted");
    }
}
