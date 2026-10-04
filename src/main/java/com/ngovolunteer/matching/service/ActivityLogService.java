package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.ActivityLog;
import com.ngovolunteer.matching.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void log(Long userId, String action, String description) {
        ActivityLog log = new ActivityLog();

        log.setUserId(userId);
        log.setAction(action);
        log.setDescription(description);

        activityLogRepository.save(log);
    }
}