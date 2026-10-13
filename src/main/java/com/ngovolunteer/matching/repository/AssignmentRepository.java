
package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    boolean existsByVolunteerIdAndRequirementId(
            Long volunteerId,
            Long requirementId
    );
    List<Assignment> findByRequirementNgoUserId(Long userId);
    List<Assignment> findByVolunteerUserId(Long userId);
    java.util.Optional<Assignment> findByIdAndVolunteerUserId(Long id, Long userId);
    long countByRequirementId(Long requirementId);
}
