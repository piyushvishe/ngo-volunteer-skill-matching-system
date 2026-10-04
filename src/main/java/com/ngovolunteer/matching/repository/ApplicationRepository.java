package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByVolunteerId(Long volunteerId);

    boolean existsByVolunteerIdAndRequirementId(
            Long volunteerId,
            Long requirementId
    );
}