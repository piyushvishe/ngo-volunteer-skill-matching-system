package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.VolunteerSkill;
import com.ngovolunteer.matching.repository.VolunteerSkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VolunteerSkillService {

    private final VolunteerSkillRepository volunteerSkillRepository;

    public VolunteerSkillService(VolunteerSkillRepository volunteerSkillRepository) {
        this.volunteerSkillRepository = volunteerSkillRepository;
    }

    public VolunteerSkill createVolunteerSkill(VolunteerSkill volunteerSkill) {
        return volunteerSkillRepository.save(volunteerSkill);
    }

    public List<VolunteerSkill> getAllVolunteerSkills() {
        return volunteerSkillRepository.findAll();
    }

    public VolunteerSkill getVolunteerSkillById(Long id) {
        return volunteerSkillRepository.findById(id).orElse(null);
    }

    public VolunteerSkill updateVolunteerSkill(Long id, VolunteerSkill volunteerSkill) {
        VolunteerSkill existingVolunteerSkill =
                volunteerSkillRepository.findById(id).orElse(null);

        if (existingVolunteerSkill == null) {
            return null;
        }

        existingVolunteerSkill.setVolunteer(volunteerSkill.getVolunteer());
        existingVolunteerSkill.setSkill(volunteerSkill.getSkill());

        return volunteerSkillRepository.save(existingVolunteerSkill);
    }

    public void deleteVolunteerSkill(Long id) {
        volunteerSkillRepository.deleteById(id);
    }
}