package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.repository.ApplicationRepository;
import com.ngovolunteer.matching.repository.RequirementRepository;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final ApplicationRepository applicationRepository;
    private final RequirementRepository requirementRepository;
    private final VolunteerRepository volunteerRepository;

    public ReportService(
            ApplicationRepository applicationRepository,
            RequirementRepository requirementRepository,
            VolunteerRepository volunteerRepository) {

        this.applicationRepository = applicationRepository;
        this.requirementRepository = requirementRepository;
        this.volunteerRepository = volunteerRepository;
    }
    public long getTotalVolunteers() {
        return volunteerRepository.count();
    }

    public long getTotalRequirements() {
        return requirementRepository.count();
    }

    public long getTotalApplications() {
        return applicationRepository.count();
    }
}