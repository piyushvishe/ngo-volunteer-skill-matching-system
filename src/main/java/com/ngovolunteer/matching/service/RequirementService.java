package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.repository.RequirementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;

    public RequirementService(RequirementRepository requirementRepository) {
        this.requirementRepository = requirementRepository;
    }

    public Requirement createRequirement(Requirement requirement) {
        return requirementRepository.save(requirement);
    }

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public Requirement getRequirementById(Long id) {
        return requirementRepository.findById(id).orElse(null);
    }

    public Requirement updateRequirement(Long id, Requirement requirement) {
        Requirement existingRequirement =
                requirementRepository.findById(id).orElse(null);

        if (existingRequirement == null) {
            return null;
        }

        existingRequirement.setTitle(requirement.getTitle());
        existingRequirement.setVolunteersNeeded(requirement.getVolunteersNeeded());
        existingRequirement.setDomain(requirement.getDomain());
        existingRequirement.setLocation(requirement.getLocation());
        existingRequirement.setDate(requirement.getDate());
        existingRequirement.setTime(requirement.getTime());
        existingRequirement.setTaskDescription(requirement.getTaskDescription());
        existingRequirement.setStatus(requirement.getStatus());
        existingRequirement.setNgo(requirement.getNgo());

        return requirementRepository.save(existingRequirement);
    }

    public void deleteRequirement(Long id) {
        requirementRepository.deleteById(id);
    }
}