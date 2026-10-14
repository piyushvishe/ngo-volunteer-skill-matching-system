package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SessionService sessionService;

    public DashboardController(DashboardService dashboardService, SessionService sessionService) {
        this.dashboardService = dashboardService;
        this.sessionService = sessionService;
    }

    @GetMapping("/counts")
    public ResponseEntity<?> getCounts(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");

        Map<String, Long> counts = new HashMap<>();

        counts.put("volunteers", dashboardService.getVolunteerCount());
        counts.put("requirements", dashboardService.getRequirementCount());
        counts.put("applications", dashboardService.getApplicationCount());

        return ResponseEntity.ok(counts);
    }
}
