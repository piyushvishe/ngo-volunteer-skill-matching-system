package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
}