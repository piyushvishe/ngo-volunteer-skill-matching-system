package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    java.util.Optional<Participation> findByAssignmentId(Long assignmentId);
    boolean existsByAssignmentId(Long assignmentId);
    java.util.List<Participation> findByAssignmentVolunteerUserId(Long userId);
    java.util.List<Participation> findByAssignmentRequirementNgoUserId(Long userId);
}
