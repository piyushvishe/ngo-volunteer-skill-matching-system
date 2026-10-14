package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.SkillMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.SessionService;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import com.ngovolunteer.matching.repository.RequirementRepository;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

@RestController
@RequestMapping("/api/matching")
public class SkillMatchingController {

    private final SkillMatchingService skillMatchingService;
    private final SessionService sessionService;
    private final VolunteerRepository volunteerRepository;
    private final RequirementRepository requirementRepository;

    public SkillMatchingController(SkillMatchingService skillMatchingService, SessionService sessionService, VolunteerRepository volunteerRepository, RequirementRepository requirementRepository) {
        this.skillMatchingService = skillMatchingService;
        this.sessionService = sessionService; this.volunteerRepository = volunteerRepository; this.requirementRepository = requirementRepository;
    }

    @GetMapping("/percentage")
    public ResponseEntity<?> getMatchPercentage(
            @RequestParam Long volunteerId,
            @RequestParam Long requirementId, HttpSession session) {

        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (sessionService.hasRole(session, "VOLUNTEER")) {
            var mine = volunteerRepository.findByUserId(sessionService.getLoggedInUserId(session)).orElse(null);
            if (mine == null || !mine.getId().equals(volunteerId)) return ResponseEntity.status(403).body("Access denied");
        } else if (!sessionService.hasRole(session, "NGO") || !requirementRepository.existsByIdAndNgoUserId(requirementId, sessionService.getLoggedInUserId(session))) {
            return ResponseEntity.status(403).body("Access denied");
        }

        double percentage = skillMatchingService
                .calculateMatchPercentage(volunteerId, requirementId);

        return ResponseEntity.ok(Map.of("volunteerId", volunteerId, "requirementId", requirementId, "matchingPercentage", percentage));
    }
}
