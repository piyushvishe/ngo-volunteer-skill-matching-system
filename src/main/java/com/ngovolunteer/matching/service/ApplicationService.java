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

    public Application updateStatus(
            Long applicationId,
            String status) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        application.setStatus(status);

        Application updatedApplication =
                applicationRepository.save(application);

        if ("ACCEPTED".equalsIgnoreCase(status)) {

            Assignment assignment = new Assignment();

            assignment.setRequirement(application.getRequirement());
            assignment.setVolunteer(application.getVolunteer());
            assignment.setStatus("ASSIGNED");
            assignment.setAssignedAt(java.time.LocalDateTime.now().toString());
            assignmentRepository.save(assignment);
        }

        Long userId = application.getVolunteer()
                .getUser()
                .getId();

        activityLogService.log(
                userId,
                "ASSIGNMENT",
                "Application status updated to " + status
        );

        return updatedApplication;
    }
}