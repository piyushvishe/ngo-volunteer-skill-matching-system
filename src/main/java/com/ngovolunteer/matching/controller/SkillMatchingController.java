package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.SkillMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
public class SkillMatchingController {

    private final SkillMatchingService skillMatchingService;

    public SkillMatchingController(SkillMatchingService skillMatchingService) {
        this.skillMatchingService = skillMatchingService;
    }

    @GetMapping("/percentage")
    public ResponseEntity<?> getMatchPercentage(
            @RequestParam Long volunteerId,
            @RequestParam Long requirementId) {

        double percentage = skillMatchingService
                .calculateMatchPercentage(volunteerId, requirementId);

        return ResponseEntity.ok(percentage);
    }
}