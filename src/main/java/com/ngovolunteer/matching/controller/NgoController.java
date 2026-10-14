package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Ngo;
import com.ngovolunteer.matching.service.NgoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.ngovolunteer.matching.service.SessionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/ngos")
public class NgoController {

    private final NgoService ngoService;
    private final SessionService sessionService;

    public NgoController(NgoService ngoService, SessionService sessionService) {
        this.ngoService = ngoService;
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<?> createNgo(@RequestBody Ngo ngo) {
        return ResponseEntity.status(403).body("NGO profiles are created during registration");
    }

    @GetMapping
    public ResponseEntity<?> getAllNgos(HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.ok(ngoService.getAllNgos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNgoById(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Ngo ngo = ngoService.getNgoById(id);
        if (ngo == null) return ResponseEntity.notFound().build();
        if (!sessionService.hasRole(session,"NGO") || !ngo.getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(ngo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNgo(@PathVariable Long id, @RequestBody Ngo ngo, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        Ngo existing = ngoService.getNgoById(id);
        if (!sessionService.hasRole(session,"NGO") || existing == null || !existing.getUser().getId().equals(sessionService.getLoggedInUserId(session))) return ResponseEntity.status(403).body("Access denied");
        existing.setOrganisationName(ngo.getOrganisationName()); existing.setDomain(ngo.getDomain());
        return ResponseEntity.ok(ngoService.updateNgo(id, existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNgo(@PathVariable Long id, HttpSession session) {
        if (!sessionService.isLoggedIn(session)) return ResponseEntity.status(401).body("Not logged in");
        return ResponseEntity.status(403).body("NGO account deletion is not supported");
    }
}
