package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Skill;
import com.ngovolunteer.matching.service.SkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;
    private final SessionService sessionService;

    public SkillController(SkillService skillService, SessionService sessionService) {
        this.skillService = skillService;
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> createSkill(@RequestBody Skill skill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        if (!sessionService.hasRole(session, "VOLUNTEER") && !sessionService.hasRole(session, "NGO")) return ResponseEntity.status(403).body("Access denied");
        if (skill.getName() == null || skill.getName().isBlank()) return ResponseEntity.badRequest().body("Skill name is required");
        return ResponseEntity.ok(skillService.createSkill(skill));
    }

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @GetMapping("/{id}")
    public Skill getSkillById(@PathVariable Long id) {
        return skillService.getSkillById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @RequestBody Skill skill, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Shared skills cannot be modified");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("Shared skills cannot be deleted");
    }
}
