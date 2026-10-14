package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final SessionService sessionService;

    public ReportController(ReportService reportService, SessionService sessionService) {
        this.reportService = reportService;
        this.sessionService = sessionService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");

        Map<String, Long> report = new HashMap<>();

        report.put("totalVolunteers", reportService.getTotalVolunteers());
        report.put("totalRequirements", reportService.getTotalRequirements());
        report.put("totalApplications", reportService.getTotalApplications());

        return ResponseEntity.ok(report);
    }
}
