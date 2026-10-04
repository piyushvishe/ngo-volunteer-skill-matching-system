package com.ngovolunteer.matching.repository;

import com.ngovolunteer.matching.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
}