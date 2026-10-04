package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.dto.ApplicationResponse;
import com.ngovolunteer.matching.entity.Application;
import com.ngovolunteer.matching.repository.ApplicationRepository;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import com.ngovolunteer.matching.service.ApplicationService;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final VolunteerRepository volunteerRepository;
    private final SessionService sessionService;

    public ApplicationController(
            ApplicationService applicationService,
            ApplicationRepository applicationRepository,
            VolunteerRepository volunteerRepository,
            SessionService sessionService) {

        this.applicationService = applicationService;
        this.applicationRepository = applicationRepository;
        this.volunteerRepository = volunteerRepository;
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> apply(
            @RequestBody Application application,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        if (!sessionService.hasRole(session, "VOLUNTEER")) {
            return ResponseEntity.status(403)
                    .body("Only volunteers can apply");
        }

        Long userId =
                sessionService.getLoggedInUserId(session);

        Application savedApplication =
                applicationService.apply(
                        application,
                        userId
                );

        return ResponseEntity.ok(
                toResponse(savedApplication)
        );
    }

    @GetMapping
    public ResponseEntity<?> getApplications(HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        if (sessionService.hasRole(session, "NGO")) {

            List<ApplicationResponse> applications =
                    applicationRepository.findAll()
                            .stream()
                            .map(this::toResponse)
                            .toList();

            return ResponseEntity.ok(applications);
        }

        if (sessionService.hasRole(session, "VOLUNTEER")) {

            Long userId =
                    sessionService.getLoggedInUserId(session);

            var volunteer = volunteerRepository
                    .findByUserId(userId)
                    .orElse(null);

            if (volunteer == null) {
                return ResponseEntity.status(404)
                        .body("Volunteer profile not found");
            }

            List<ApplicationResponse> applications =
                    applicationRepository
                            .findByVolunteerId(volunteer.getId())
                            .stream()
                            .map(this::toResponse)
                            .toList();

            return ResponseEntity.ok(applications);
        }

        return ResponseEntity.status(403)
                .body("Access denied");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can update application status");
        }

        Application updatedApplication =
                applicationService.updateStatus(id, status);

        return ResponseEntity.ok(
                toResponse(updatedApplication)
        );
    }

    private ApplicationResponse toResponse(
            Application application) {

        return new ApplicationResponse(
                application.getId(),
                application.getVolunteer().getId(),
                application.getRequirement().getId(),
                application.getStatus()
        );
    }
}