package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Requirement;
import com.ngovolunteer.matching.repository.RequirementRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class RequirementController {

    private final RequirementRepository requirementRepository;

    public RequirementController(RequirementRepository requirementRepository) {
        this.requirementRepository = requirementRepository;
    }

    @PostMapping("/requirement")
    public Requirement createRequirement(@RequestBody Requirement requirement) {
        return requirementRepository.save(requirement);
    }

    @GetMapping("/requirements")
    public List<Requirement> getRequirements() {
        return requirementRepository.findAll();
    }
}