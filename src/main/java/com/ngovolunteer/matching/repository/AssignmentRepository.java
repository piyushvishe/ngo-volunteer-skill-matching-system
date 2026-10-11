
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
}
