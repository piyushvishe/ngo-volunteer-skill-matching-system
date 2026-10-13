package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.VolunteerSkill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VolunteerSkillRepository extends JpaRepository<VolunteerSkill, Long> {
    java.util.List<VolunteerSkill> findByVolunteerUserId(Long userId);
}
