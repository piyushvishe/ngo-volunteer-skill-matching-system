package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Participation;
import com.ngovolunteer.matching.service.ParticipationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participations")
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService) {
        this.participationService = participationService;
    }

    @PostMapping
    public Participation createParticipation(@RequestBody Participation participation) {
        return participationService.createParticipation(participation);
    }

    @GetMapping
    public List<Participation> getAllParticipations() {
        return participationService.getAllParticipations();
    }

    @GetMapping("/{id}")
    public Participation getParticipationById(@PathVariable Long id) {
        return participationService.getParticipationById(id);
    }

    @PutMapping("/{id}")
    public Participation updateParticipation(
            @PathVariable Long id,
            @RequestBody Participation participation) {
        return participationService.updateParticipation(id, participation);
    }

    @DeleteMapping("/{id}")
    public void deleteParticipation(@PathVariable Long id) {
        participationService.deleteParticipation(id);
    }
}