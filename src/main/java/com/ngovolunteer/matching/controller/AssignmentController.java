package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Assignment;
import com.ngovolunteer.matching.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SessionService sessionService;

    public AssignmentController(
            AssignmentService assignmentService,
            SessionService sessionService) {
        this.assignmentService = assignmentService;
        this.sessionService = sessionService;
    }
    @PostMapping
    public ResponseEntity<?> createAssignment(
            @RequestBody Assignment assignment,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can create assignments");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        if (assignment.getRequirement() == null
                || assignment.getRequirement().getNgo() == null
                || assignment.getRequirement().getNgo().getUser() == null
                || !userId.equals(
                assignment.getRequirement().getNgo().getUser().getId())) {
            return ResponseEntity.status(403)
                    .body("You can only assign volunteers to your own requirements");
        }

        return ResponseEntity.ok(
                assignmentService.createAssignment(assignment)
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllAssignments(
            jakarta.servlet.http.HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403).body("Only NGOs can view NGO assignments");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        return ResponseEntity.ok(
                assignmentService.getAssignmentsByNgoUserId(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssignmentById(
            @PathVariable Long id,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can view assignment details");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        boolean ownsAssignment = assignmentService
                .getAssignmentsByNgoUserId(userId)
                .stream()
                .anyMatch(a -> a.getId().equals(id));

        if (!ownsAssignment) {
            return ResponseEntity.status(404)
                    .body("Assignment not found");
        }

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(id)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment assignment,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403).body("Only NGOs can update assignments");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        boolean ownsAssignment = assignmentService
                .getAssignmentsByNgoUserId(userId)
                .stream()
                .anyMatch(a -> a.getId().equals(id));

        if (!ownsAssignment) {
            return ResponseEntity.status(404).body("Assignment not found");
        }

        return ResponseEntity.ok(
                assignmentService.updateAssignment(id, assignment)
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(
            @PathVariable Long id,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can delete assignments");
        }

        Long userId = sessionService.getLoggedInUserId(session);

        boolean ownsAssignment = assignmentService
                .getAssignmentsByNgoUserId(userId)
                .stream()
                .anyMatch(a -> a.getId().equals(id));

        if (!ownsAssignment) {
            return ResponseEntity.status(404)
                    .body("Assignment not found");
        }

        assignmentService.deleteAssignment(id);

        return ResponseEntity.noContent().build();
    }
}