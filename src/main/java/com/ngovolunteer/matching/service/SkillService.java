package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Skill;
import com.ngovolunteer.matching.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public Skill createSkill(Skill skill) {
        return skillRepository.save(skill);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Skill getSkillById(Long id) {
        return skillRepository.findById(id).orElse(null);
    }

    public Skill updateSkill(Long id, Skill skill) {
        Skill existingSkill = skillRepository.findById(id).orElse(null);

        if (existingSkill == null) {
            return null;
        }

        existingSkill.setName(skill.getName());

        return skillRepository.save(existingSkill);
    }

    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }
}