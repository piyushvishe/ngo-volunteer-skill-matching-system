package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}