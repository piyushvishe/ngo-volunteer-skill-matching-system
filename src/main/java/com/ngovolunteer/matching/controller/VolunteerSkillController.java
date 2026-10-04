package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.VolunteerSkill;
import com.ngovolunteer.matching.service.VolunteerSkillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteer-skills")
public class VolunteerSkillController {

    private final VolunteerSkillService volunteerSkillService;

    public VolunteerSkillController(VolunteerSkillService volunteerSkillService) {
        this.volunteerSkillService = volunteerSkillService;
    }

    @PostMapping
    public VolunteerSkill createVolunteerSkill(@RequestBody VolunteerSkill volunteerSkill) {
        return volunteerSkillService.createVolunteerSkill(volunteerSkill);
    }

    @GetMapping
    public List<VolunteerSkill> getAllVolunteerSkills() {
        return volunteerSkillService.getAllVolunteerSkills();
    }

    @GetMapping("/{id}")
    public VolunteerSkill getVolunteerSkillById(@PathVariable Long id) {
        return volunteerSkillService.getVolunteerSkillById(id);
    }

    @PutMapping("/{id}")
    public VolunteerSkill updateVolunteerSkill(
            @PathVariable Long id,
            @RequestBody VolunteerSkill volunteerSkill) {
        return volunteerSkillService.updateVolunteerSkill(id, volunteerSkill);
    }

    @DeleteMapping("/{id}")
    public void deleteVolunteerSkill(@PathVariable Long id) {
        volunteerSkillService.deleteVolunteerSkill(id);
    }
}