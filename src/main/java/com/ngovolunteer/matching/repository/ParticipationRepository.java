package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {
}