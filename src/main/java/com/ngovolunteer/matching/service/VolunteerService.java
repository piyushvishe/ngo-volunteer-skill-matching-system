package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Volunteer;
import com.ngovolunteer.matching.repository.VolunteerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;

    public VolunteerService(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    public Volunteer createVolunteer(Volunteer volunteer) {
        return volunteerRepository.save(volunteer);
    }

    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    public Volunteer getVolunteerById(Long id) {
        return volunteerRepository.findById(id).orElse(null);
    }

    public Volunteer updateVolunteer(Long id, Volunteer volunteer) {
        Volunteer existingVolunteer = volunteerRepository.findById(id).orElse(null);

        if (existingVolunteer == null) {
            return null;
        }

        existingVolunteer.setLocation(volunteer.getLocation());
        existingVolunteer.setAvailability(volunteer.getAvailability());
        existingVolunteer.setUser(volunteer.getUser());

        return volunteerRepository.save(existingVolunteer);
    }

    public void deleteVolunteer(Long id) {
        volunteerRepository.deleteById(id);
    }
}