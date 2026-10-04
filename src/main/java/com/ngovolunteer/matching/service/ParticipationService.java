package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Participation;
import com.ngovolunteer.matching.repository.ParticipationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipationService {

    private final ParticipationRepository participationRepository;

    public ParticipationService(ParticipationRepository participationRepository) {
        this.participationRepository = participationRepository;
    }

    public Participation createParticipation(Participation participation) {
        return participationRepository.save(participation);
    }

    public List<Participation> getAllParticipations() {
        return participationRepository.findAll();
    }

    public Participation getParticipationById(Long id) {
        return participationRepository.findById(id).orElse(null);
    }

    public Participation updateParticipation(Long id, Participation participation) {
        Participation existingParticipation =
                participationRepository.findById(id).orElse(null);

        if (existingParticipation == null) {
            return null;
        }

        existingParticipation.setAssignment(participation.getAssignment());
        existingParticipation.setStatus(participation.getStatus());
        existingParticipation.setHours(participation.getHours());
        existingParticipation.setRating(participation.getRating());
        existingParticipation.setCompletedAt(participation.getCompletedAt());

        return participationRepository.save(existingParticipation);
    }

    public void deleteParticipation(Long id) {
        participationRepository.deleteById(id);
    }
}