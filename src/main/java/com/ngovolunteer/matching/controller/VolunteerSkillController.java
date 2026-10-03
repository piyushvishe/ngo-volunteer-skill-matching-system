package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.VolunteerSkill;
import com.ngovolunteer.matching.repository.VolunteerSkillRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class VolunteerSkillController {

    private final VolunteerSkillRepository volunteerSkillRepository;

    public VolunteerSkillController(VolunteerSkillRepository volunteerSkillRepository) {
        this.volunteerSkillRepository = volunteerSkillRepository;
    }

    @PostMapping("/volunteer-skill")
    public VolunteerSkill createVolunteerSkill(@RequestBody VolunteerSkill volunteerSkill) {
        return volunteerSkillRepository.save(volunteerSkill);
    }

    @GetMapping("/volunteer-skills")
    public List<VolunteerSkill> getVolunteerSkills() {
        return volunteerSkillRepository.findAll();
    }
}