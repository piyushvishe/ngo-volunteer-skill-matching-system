package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}