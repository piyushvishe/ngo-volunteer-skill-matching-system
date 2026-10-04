package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.RequirementSkill;
import com.ngovolunteer.matching.repository.RequirementSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequirementSkillService {

    private final RequirementSkillRepository requirementSkillRepository;

    public RequirementSkillService(RequirementSkillRepository requirementSkillRepository) {
        this.requirementSkillRepository = requirementSkillRepository;
    }

    public RequirementSkill createRequirementSkill(RequirementSkill requirementSkill) {
        return requirementSkillRepository.save(requirementSkill);
    }

    public List<RequirementSkill> getAllRequirementSkills() {
        return requirementSkillRepository.findAll();
    }

    public RequirementSkill getRequirementSkillById(Long id) {
        return requirementSkillRepository.findById(id).orElse(null);
    }

    public RequirementSkill updateRequirementSkill(
            Long id, RequirementSkill requirementSkill) {

        RequirementSkill existingRequirementSkill =
                requirementSkillRepository.findById(id).orElse(null);

        if (existingRequirementSkill == null) {
            return null;
        }

        existingRequirementSkill.setRequirement(requirementSkill.getRequirement());
        existingRequirementSkill.setSkill(requirementSkill.getSkill());

        return requirementSkillRepository.save(existingRequirementSkill);
    }

    public void deleteRequirementSkill(Long id) {
        requirementSkillRepository.deleteById(id);
    }
}