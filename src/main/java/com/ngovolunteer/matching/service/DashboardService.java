package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.repository.ApplicationRepository;
import com.ngovolunteer.matching.repository.RequirementRepository;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ApplicationRepository applicationRepository;
    private final RequirementRepository requirementRepository;
    private final VolunteerRepository volunteerRepository;

    public DashboardService(
            ApplicationRepository applicationRepository,
            RequirementRepository requirementRepository,
            VolunteerRepository volunteerRepository) {

        this.applicationRepository = applicationRepository;
        this.requirementRepository = requirementRepository;
        this.volunteerRepository = volunteerRepository;
    }

    public long getVolunteerCount() {
        return volunteerRepository.count();
    }

    public long getRequirementCount() {
        return requirementRepository.count();
    }

    public long getApplicationCount() {
        return applicationRepository.count();
    }
}