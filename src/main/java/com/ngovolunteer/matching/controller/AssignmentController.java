package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Assignment;
import com.ngovolunteer.matching.dto.AssignmentResponseDTO;
import com.ngovolunteer.matching.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

import java.util.List;
import com.ngovolunteer.matching.repository.RequirementRepository;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import com.ngovolunteer.matching.repository.ApplicationRepository;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SessionService sessionService;
    private final RequirementRepository requirementRepository;
    private final VolunteerRepository volunteerRepository;
    private final ApplicationRepository applicationRepository;

    public AssignmentController(
            AssignmentService assignmentService,
            SessionService sessionService, RequirementRepository requirementRepository,
            VolunteerRepository volunteerRepository, ApplicationRepository applicationRepository) {
        this.assignmentService = assignmentService;
        this.sessionService = sessionService;
        this.requirementRepository = requirementRepository; this.volunteerRepository = volunteerRepository; this.applicationRepository = applicationRepository;
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

        if (assignment.getRequirement() == null || assignment.getVolunteer() == null) return ResponseEntity.badRequest().body("Requirement and volunteer are required");
        var requirement = requirementRepository.findByIdAndNgoUserId(assignment.getRequirement().getId(), userId).orElse(null);
        var volunteer = volunteerRepository.findById(assignment.getVolunteer().getId()).orElse(null);
        if (requirement == null || volunteer == null) return ResponseEntity.notFound().build();
        if (!applicationRepository.existsByVolunteerIdAndRequirementIdAndStatusIgnoreCase(volunteer.getId(), requirement.getId(), "ACCEPTED")) return ResponseEntity.status(409).body("Volunteer must have an accepted application");
        if (assignmentService.getAssignmentsByNgoUserId(userId).stream().anyMatch(a -> a.getRequirement().getId().equals(requirement.getId()) && a.getVolunteer().getId().equals(volunteer.getId()))) return ResponseEntity.status(409).body("Volunteer is already assigned");
        if (assignmentService.getAssignmentsByNgoUserId(userId).stream().filter(a -> a.getRequirement().getId().equals(requirement.getId())).count() >= Math.max(1, requirement.getVolunteersNeeded() == null ? 1 : requirement.getVolunteersNeeded())) return ResponseEntity.status(409).body("Requirement is full");
        assignment.setRequirement(requirement); assignment.setVolunteer(volunteer); assignment.setStatus("ASSIGNED"); assignment.setAssignedAt(java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(new AssignmentResponseDTO(assignmentService.createAssignment(assignment)));
    }

    @GetMapping
    public ResponseEntity<?> getAllAssignments(
            jakarta.servlet.http.HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401).body("Not logged in");
        }

        Long userId = sessionService.getLoggedInUserId(session);
        if (sessionService.hasRole(session, "NGO"))
            return ResponseEntity.ok(assignmentService.getAssignmentsByNgoUserId(userId).stream().map(AssignmentResponseDTO::new).toList());
        if (sessionService.hasRole(session, "VOLUNTEER"))
            return ResponseEntity.ok(assignmentService.getAssignmentsByVolunteerUserId(userId).stream().map(AssignmentResponseDTO::new).toList());
        return ResponseEntity.status(403).body("Access denied");
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
                new AssignmentResponseDTO(assignmentService.getAssignmentById(id))
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

        return ResponseEntity.status(409).body("Assignments are retained for participation history");
    }
}
