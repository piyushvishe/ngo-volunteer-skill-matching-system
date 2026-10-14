package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.repository.RequirementRepository;
import com.ngovolunteer.matching.repository.NgoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final NgoRepository ngoRepository;

    public RequirementService(
            RequirementRepository requirementRepository,
            NgoRepository ngoRepository) {

        this.requirementRepository = requirementRepository;
        this.ngoRepository = ngoRepository;
    }

    public Requirement createRequirement(
            Requirement requirement,
            Long userId) {

        if (requirement.getTitle() == null || requirement.getTitle().isBlank() || requirement.getLocation() == null || requirement.getLocation().isBlank() ||
                requirement.getDate() == null || requirement.getDate().isBlank() || requirement.getTime() == null || requirement.getTime().isBlank() ||
                requirement.getVolunteersNeeded() == null || requirement.getVolunteersNeeded() < 1)
            throw new IllegalArgumentException("Title, location, date, time, and a positive volunteer count are required");

        Ngo ngo = ngoRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("NGO profile not found for this user"));

        requirement.setNgo(ngo);
        requirement.setStatus("OPEN");

        return requirementRepository.save(requirement);
    }

    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    public Requirement getRequirementById(Long id) {
        return requirementRepository
                .findById(id)
                .orElse(null);
    }

    public boolean owns(Long id, Long userId) {
        return requirementRepository.existsByIdAndNgoUserId(id, userId);
    }

    public Requirement updateRequirement(
            Long id,
            Requirement requirement) {

        if (requirement.getTitle() == null || requirement.getTitle().isBlank() || requirement.getVolunteersNeeded() == null || requirement.getVolunteersNeeded() < 1)
            throw new IllegalArgumentException("Title and a positive volunteer count are required");
        if (requirement.getStatus() != null && !java.util.Set.of("OPEN", "CLOSED").contains(requirement.getStatus().trim().toUpperCase()))
            throw new IllegalArgumentException("Invalid requirement status");

        Requirement existingRequirement =
                requirementRepository
                        .findById(id)
                        .orElse(null);

        if (existingRequirement == null) {
            return null;
        }

        existingRequirement.setTitle(requirement.getTitle());
        existingRequirement.setVolunteersNeeded(
                requirement.getVolunteersNeeded());
        existingRequirement.setDomain(
                requirement.getDomain());
        existingRequirement.setLocation(
                requirement.getLocation());
        existingRequirement.setDate(
                requirement.getDate());
        existingRequirement.setTime(
                requirement.getTime());
        existingRequirement.setTaskDescription(
                requirement.getTaskDescription());
        if (requirement.getStatus() != null) existingRequirement.setStatus(requirement.getStatus().trim().toUpperCase());

        return requirementRepository.save(existingRequirement);
    }

    public void deleteRequirement(Long id) {
        requirementRepository.deleteById(id);
    }
}
