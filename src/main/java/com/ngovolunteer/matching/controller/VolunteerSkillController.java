package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.VolunteerSkill;
import com.ngovolunteer.matching.service.VolunteerSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import com.ngovolunteer.matching.repository.VolunteerSkillRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import com.ngovolunteer.matching.repository.VolunteerRepository;

@RestController
@RequestMapping("/api/volunteer-skills")
public class VolunteerSkillController {

    private final VolunteerSkillService volunteerSkillService;
    private final SessionService sessionService;
    private final VolunteerSkillRepository volunteerSkillRepository;
    private final VolunteerRepository volunteerRepository;

    public VolunteerSkillController(VolunteerSkillService volunteerSkillService, SessionService sessionService, VolunteerSkillRepository volunteerSkillRepository, VolunteerRepository volunteerRepository) {
        this.volunteerSkillService = volunteerSkillService;
        this.sessionService = sessionService; this.volunteerSkillRepository = volunteerSkillRepository;
        this.volunteerRepository = volunteerRepository;
    }

    @PostMapping
    public ResponseEntity<?> createVolunteerSkill(@RequestBody VolunteerSkill volunteerSkill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "VOLUNTEER") || volunteerSkill.getVolunteer() == null) return ResponseEntity.status(403).body("Can only update your own skills");
        var owner = volunteerRepository.findByUserId(sessionService.getLoggedInUserId(session)).orElse(null);
        if (owner == null || !owner.getId().equals(volunteerSkill.getVolunteer().getId())) return ResponseEntity.status(403).body("Can only update your own skills");
        volunteerSkill.setVolunteer(owner);
        return ResponseEntity.ok(volunteerSkillService.createVolunteerSkill(volunteerSkill));
    }

    @GetMapping
    public ResponseEntity<?> getAllVolunteerSkills(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (sessionService.hasRole(session, "NGO")) return ResponseEntity.ok(volunteerSkillService.getAllVolunteerSkills());
        if (sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.ok(volunteerSkillRepository.findByVolunteerUserId(sessionService.getLoggedInUserId(session)));
        return ResponseEntity.status(403).body("Access denied");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVolunteerSkillById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        VolunteerSkill link = volunteerSkillService.getVolunteerSkillById(id);
        if (link == null) return ResponseEntity.notFound().build();
        if (!sessionService.hasRole(session, "NGO") && !link.getVolunteer().getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(link);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVolunteerSkill(
            @PathVariable Long id,
            @RequestBody VolunteerSkill volunteerSkill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        VolunteerSkill existing = volunteerSkillService.getVolunteerSkillById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!sessionService.hasRole(session, "VOLUNTEER") || !existing.getVolunteer().getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        volunteerSkill.setVolunteer(existing.getVolunteer());
        return ResponseEntity.ok(volunteerSkillService.updateVolunteerSkill(id, volunteerSkill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVolunteerSkill(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        VolunteerSkill existing = volunteerSkillService.getVolunteerSkillById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        if (!sessionService.hasRole(session, "VOLUNTEER") || !existing.getVolunteer().getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        volunteerSkillService.deleteVolunteerSkill(id);
        return ResponseEntity.noContent().build();
    }
}
