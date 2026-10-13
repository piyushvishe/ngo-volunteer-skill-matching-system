package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {
    boolean existsByIdAndNgoUserId(Long id, Long userId);
    java.util.Optional<Requirement> findByIdAndNgoUserId(Long id, Long userId);
}
