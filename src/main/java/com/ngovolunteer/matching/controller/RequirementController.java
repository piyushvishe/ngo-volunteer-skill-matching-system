package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.service.RequirementService;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

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
    public ResponseEntity<?> getAllRequirements(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "NGO") && !sessionService.hasRole(session, "VOLUNTEER")) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(requirementService.getAllRequirements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequirementById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Requirement requirement = requirementService.getRequirementById(id);
        return requirement == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(requirement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequirement(
            @PathVariable Long id,
            @RequestBody Requirement requirement,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "NGO")) return ResponseEntity.status(403).body("Only NGOs can update requirements");
        if (!requirementService.owns(id, sessionService.getLoggedInUserId(session))) return ResponseEntity.notFound().build();

        return ResponseEntity.ok(requirementService.updateRequirement(
                id,
                requirement
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequirement(
            @PathVariable Long id, HttpSession session) {

        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "NGO")) return ResponseEntity.status(403).body("Only NGOs can delete requirements");
        if (!requirementService.owns(id, sessionService.getLoggedInUserId(session))) return ResponseEntity.notFound().build();

        requirementService.deleteRequirement(id);
        return ResponseEntity.noContent().build();
    }
}
