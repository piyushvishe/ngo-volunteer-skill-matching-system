package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.ActivityLog;
import com.ngovolunteer.matching.repository.ActivityLogRepository;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class ActivityLogController {

    private final ActivityLogRepository activityLogRepository;
    private final SessionService sessionService;

    public ActivityLogController(
            ActivityLogRepository activityLogRepository,
            SessionService sessionService) {

        this.activityLogRepository = activityLogRepository;
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<?> getLogs(HttpSession session) {

        if (!sessionService.isLoggedIn(session)) {
            return ResponseEntity.status(401)
                    .body("Not logged in");
        }

        if (!sessionService.hasRole(session, "NGO")) {
            return ResponseEntity.status(403)
                    .body("Only NGOs can view activity logs");
        }

        List<ActivityLog> logs =
                activityLogRepository.findAll();

        return ResponseEntity.ok(logs);
    }
}