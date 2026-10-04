package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.repository.RequirementSkillRepository;
import com.ngovolunteer.matching.repository.VolunteerSkillRepository;
import org.springframework.stereotype.Service;

@Service
public class SkillMatchingService {

    private final VolunteerSkillRepository volunteerSkillRepository;
    private final RequirementSkillRepository requirementSkillRepository;

    public SkillMatchingService(
            VolunteerSkillRepository volunteerSkillRepository,
            RequirementSkillRepository requirementSkillRepository) {

        this.volunteerSkillRepository = volunteerSkillRepository;
        this.requirementSkillRepository = requirementSkillRepository;
    }
    public double calculateMatchPercentage(Long volunteerId, Long requirementId) {

        var volunteerSkills = volunteerSkillRepository.findAll()
                .stream()
                .filter(vs -> vs.getVolunteer().getId().equals(volunteerId))
                .toList();

        var requirementSkills = requirementSkillRepository.findAll()
                .stream()
                .filter(rs -> rs.getRequirement().getId().equals(requirementId))
                .toList();

        if (requirementSkills.isEmpty()) {
            return 0.0;
        }

        long matchedSkills = requirementSkills.stream()
                .filter(rs -> volunteerSkills.stream()
                        .anyMatch(vs ->
                                vs.getSkill().getId()
                                        .equals(rs.getSkill().getId())))
                .count();

        return (matchedSkills * 100.0) / requirementSkills.size();
    }
}