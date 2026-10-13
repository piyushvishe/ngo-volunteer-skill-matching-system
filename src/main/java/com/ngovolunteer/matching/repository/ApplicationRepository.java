package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByVolunteerId(Long volunteerId);
    List<Application> findByRequirementNgoUserId(Long userId);
    java.util.Optional<Application> findByIdAndRequirementNgoUserId(Long id, Long userId);
    boolean existsByVolunteerIdAndRequirementIdAndStatusIgnoreCase(Long volunteerId, Long requirementId, String status);

    boolean existsByVolunteerIdAndRequirementId(
            Long volunteerId,
            Long requirementId
    );
}
