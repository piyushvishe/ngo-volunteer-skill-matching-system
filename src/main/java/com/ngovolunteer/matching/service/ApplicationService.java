package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Application;
import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.entity.Volunteer;
import com.ngovolunteer.matching.entity.Assignment;
import com.ngovolunteer.matching.repository.ApplicationRepository;
import com.ngovolunteer.matching.repository.RequirementRepository;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import com.ngovolunteer.matching.repository.AssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final VolunteerRepository volunteerRepository;
    private final RequirementRepository requirementRepository;
    private final AssignmentRepository assignmentRepository;
    private final ActivityLogService activityLogService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            VolunteerRepository volunteerRepository,
            RequirementRepository requirementRepository,
            AssignmentRepository assignmentRepository,
            ActivityLogService activityLogService) {

        this.applicationRepository = applicationRepository;
        this.volunteerRepository = volunteerRepository;
        this.requirementRepository = requirementRepository;
        this.assignmentRepository = assignmentRepository;
        this.activityLogService = activityLogService;
    }

    public Application apply(
            Application application,
            Long loggedInUserId) {

        Volunteer volunteer = volunteerRepository
                .findByUserId(loggedInUserId)
                .orElseThrow(() ->
                        new RuntimeException("Volunteer profile not found"));

        Long requirementId = application
                .getRequirement()
                .getId();

        if (applicationRepository
                .existsByVolunteerIdAndRequirementId(
                        volunteer.getId(),
                        requirementId)) {

            throw new RuntimeException(
                    "You have already applied for this requirement"
            );
        }

        application.setStatus("PENDING");

        application.setVolunteer(volunteer);

        Requirement requirement = requirementRepository
                .findById(application.getRequirement().getId())
                .orElseThrow(() ->
                        new RuntimeException("Requirement not found"));

        application.setRequirement(requirement);

        Application savedApplication =
                applicationRepository.save(application);

        activityLogService.log(
                loggedInUserId,
                "APPLICATION",
                "Volunteer applied for a requirement"
        );

        return savedApplication;
    }

    @Transactional
    public Application updateStatus(Long applicationId, String status, Long ngoUserId) {

        Application application = applicationRepository
                .findByIdAndRequirementNgoUserId(applicationId, ngoUserId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!java.util.Set.of("PENDING", "ACCEPTED", "REJECTED").contains(normalized))
            throw new IllegalArgumentException("Invalid application status");
        if ("ACCEPTED".equalsIgnoreCase(application.getStatus()) && !"ACCEPTED".equals(normalized))
            throw new IllegalArgumentException("An accepted application cannot be reopened or rejected");
        application.setStatus(normalized);

        Application updatedApplication =
                applicationRepository.save(application);

        if ("ACCEPTED".equals(normalized)) {

            Long volunteerId = application.getVolunteer().getId();
            Long requirementId = application.getRequirement().getId();

            boolean assignmentExists =
                    assignmentRepository.existsByVolunteerIdAndRequirementId(
                            volunteerId,
                            requirementId
                    );

            int capacity = Math.max(1, application.getRequirement().getVolunteersNeeded() == null ? 1 : application.getRequirement().getVolunteersNeeded());
            if (!assignmentExists && assignmentRepository.countByRequirementId(requirementId) >= capacity)
                throw new IllegalArgumentException("This requirement has no remaining volunteer slots");

            if (!assignmentExists) {
                Assignment assignment = new Assignment();

                assignment.setRequirement(application.getRequirement());
                assignment.setVolunteer(application.getVolunteer());
                assignment.setStatus("ASSIGNED");
                assignment.setAssignedAt(
                        java.time.LocalDateTime.now().toString()
                );

                assignmentRepository.save(assignment);
            }
        }

        Long userId = application.getVolunteer()
                .getUser()
                .getId();

        activityLogService.log(
                userId,
                "ASSIGNMENT",
            "Application status updated to " + normalized
        );

        return updatedApplication;
    }
}
