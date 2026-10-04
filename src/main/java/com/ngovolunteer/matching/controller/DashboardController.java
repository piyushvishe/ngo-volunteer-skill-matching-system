package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/counts")
    public ResponseEntity<?> getCounts() {

        Map<String, Long> counts = new HashMap<>();

        counts.put("volunteers", dashboardService.getVolunteerCount());
        counts.put("requirements", dashboardService.getRequirementCount());
        counts.put("applications", dashboardService.getApplicationCount());

        return ResponseEntity.ok(counts);
    }
}