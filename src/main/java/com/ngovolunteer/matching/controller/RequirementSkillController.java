package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.RequirementSkill;
import com.ngovolunteer.matching.service.RequirementSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import com.ngovolunteer.matching.repository.RequirementSkillRepository;
import com.ngovolunteer.matching.repository.RequirementRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/requirement-skills")
public class RequirementSkillController {

    private final RequirementSkillService requirementSkillService;
    private final SessionService sessionService;
    private final RequirementSkillRepository requirementSkillRepository;
    private final RequirementRepository requirementRepository;

    public RequirementSkillController(RequirementSkillService requirementSkillService, SessionService sessionService,
            RequirementSkillRepository requirementSkillRepository, RequirementRepository requirementRepository) {
        this.requirementSkillService = requirementSkillService;
        this.sessionService = sessionService; this.requirementSkillRepository = requirementSkillRepository; this.requirementRepository = requirementRepository;
    }

    @PostMapping
    public ResponseEntity<?> createRequirementSkill(@RequestBody RequirementSkill requirementSkill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "NGO") || requirementSkill.getRequirement() == null) return ResponseEntity.status(403).body("Only NGOs can manage their requirement skills");
        var requirement = requirementRepository.findByIdAndNgoUserId(requirementSkill.getRequirement().getId(), sessionService.getLoggedInUserId(session)).orElse(null);
        if (requirement == null) return ResponseEntity.notFound().build();
        requirementSkill.setRequirement(requirement);
        return ResponseEntity.ok(requirementSkillService.createRequirementSkill(requirementSkill));
    }

    @GetMapping
    public List<RequirementSkill> getAllRequirementSkills() {
        return requirementSkillService.getAllRequirementSkills();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequirementSkillById(@PathVariable Long id) {
        RequirementSkill link = requirementSkillService.getRequirementSkillById(id);
        return link == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(link);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequirementSkill(
            @PathVariable Long id,
            @RequestBody RequirementSkill requirementSkill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        RequirementSkill existing = requirementSkillService.getRequirementSkillById(id);
        if (!sessionService.hasRole(session, "NGO") || existing == null || !requirementRepository.existsByIdAndNgoUserId(existing.getRequirement().getId(), sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        requirementSkill.setRequirement(existing.getRequirement());
        return ResponseEntity.ok(requirementSkillService.updateRequirementSkill(id, requirementSkill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequirementSkill(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        RequirementSkill existing = requirementSkillService.getRequirementSkillById(id);
        if (!sessionService.hasRole(session, "NGO") || existing == null || !requirementRepository.existsByIdAndNgoUserId(existing.getRequirement().getId(), sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        requirementSkillService.deleteRequirementSkill(id);
        return ResponseEntity.noContent().build();
    }
}
