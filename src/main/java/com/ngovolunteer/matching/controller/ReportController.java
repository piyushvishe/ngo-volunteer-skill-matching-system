package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {

        Map<String, Long> report = new HashMap<>();

        report.put("totalVolunteers", reportService.getTotalVolunteers());
        report.put("totalRequirements", reportService.getTotalRequirements());
        report.put("totalApplications", reportService.getTotalApplications());

        return ResponseEntity.ok(report);
    }
}