package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.RequirementSkill;
import com.ngovolunteer.matching.service.RequirementSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirement-skills")
public class RequirementSkillController {

    private final RequirementSkillService requirementSkillService;

    public RequirementSkillController(RequirementSkillService requirementSkillService) {
        this.requirementSkillService = requirementSkillService;
    }

    @PostMapping
    public RequirementSkill createRequirementSkill(
            @RequestBody RequirementSkill requirementSkill) {
        return requirementSkillService.createRequirementSkill(requirementSkill);
    }

    @GetMapping
    public List<RequirementSkill> getAllRequirementSkills() {
        return requirementSkillService.getAllRequirementSkills();
    }

    @GetMapping("/{id}")
    public RequirementSkill getRequirementSkillById(@PathVariable Long id) {
        return requirementSkillService.getRequirementSkillById(id);
    }

    @PutMapping("/{id}")
    public RequirementSkill updateRequirementSkill(
            @PathVariable Long id,
            @RequestBody RequirementSkill requirementSkill) {
        return requirementSkillService.updateRequirementSkill(id, requirementSkill);
    }

    @DeleteMapping("/{id}")
    public void deleteRequirementSkill(@PathVariable Long id) {
        requirementSkillService.deleteRequirementSkill(id);
    }
}