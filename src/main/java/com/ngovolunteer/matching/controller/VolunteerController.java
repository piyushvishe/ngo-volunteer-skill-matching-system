package com.ngovolunteer.matching.controller;

import com.ngovolunteer.matching.entity.Volunteer;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class VolunteerController {

    private final VolunteerRepository volunteerRepository;

    public VolunteerController(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    @PostMapping("/volunteer")
    public Volunteer createVolunteer(@RequestBody Volunteer volunteer) {
        return volunteerRepository.save(volunteer);
    }

    @GetMapping("/volunteers")
    public List<Volunteer> getVolunteers() {
        return volunteerRepository.findAll();
    }
}