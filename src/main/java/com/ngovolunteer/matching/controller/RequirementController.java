package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.service.RequirementService;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementService requirementService;
    private final SessionService sessionService;

    public RequirementController(
            RequirementService requirementService,
            SessionService sessionService) {

        this.requirementService = requirementService;
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> createRequirement(
            @RequestBody Requirement requirement,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can create requirements");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        return ResponseEntity.ok(
                requirementService.createRequirement(
                        requirement,
                        userId
                )
        );
    }

    @GetMapping
    public List<Requirement> getAllRequirements() {
        return requirementService.getAllRequirements();
    }

    @GetMapping("/{id}")
    public Requirement getRequirementById(
            @PathVariable Long id) {

        return requirementService.getRequirementById(id);
    }

    @PutMapping("/{id}")
    public Requirement updateRequirement(
            @PathVariable Long id,
            @RequestBody Requirement requirement) {

        return requirementService.updateRequirement(
                id,
                requirement
        );
    }

    @DeleteMapping("/{id}")
    public void deleteRequirement(
            @PathVariable Long id) {

        requirementService.deleteRequirement(id);
    }
}