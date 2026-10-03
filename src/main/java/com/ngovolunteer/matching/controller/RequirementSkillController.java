package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.RequirementSkill;
import com.ngovolunteer.matching.repository.RequirementSkillRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class RequirementSkillController {

    private final RequirementSkillRepository requirementSkillRepository;

    public RequirementSkillController(RequirementSkillRepository requirementSkillRepository) {
        this.requirementSkillRepository = requirementSkillRepository;
    }

    @PostMapping("/requirement-skill")
    public RequirementSkill createRequirementSkill(@RequestBody RequirementSkill requirementSkill) {
        return requirementSkillRepository.save(requirementSkill);
    }

    @GetMapping("/requirement-skills")
    public List<RequirementSkill> getRequirementSkills() {
        return requirementSkillRepository.findAll();
    }
}