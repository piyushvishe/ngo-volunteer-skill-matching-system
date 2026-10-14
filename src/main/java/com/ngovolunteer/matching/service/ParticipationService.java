package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Participation;
import com.ngovolunteer.matching.repository.ParticipationRepository;
import com.ngovolunteer.matching.repository.AssignmentRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final AssignmentRepository assignmentRepository;

    public ParticipationService(ParticipationRepository participationRepository, AssignmentRepository assignmentRepository) {
        this.participationRepository = participationRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public Participation complete(Long assignmentId, Long volunteerUserId, Integer hours) {
        if (hours == null || hours < 1 || hours > 24) throw new IllegalArgumentException("Hours must be between 1 and 24");
        var assignment = assignmentRepository.findByIdAndVolunteerUserId(assignmentId, volunteerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        try {
            var requirement = assignment.getRequirement();
            var times = requirement.getTime().split("-");
            if (times.length < 2) throw new IllegalArgumentException();
            var endTime = java.time.LocalTime.parse(times[1].trim(), java.time.format.DateTimeFormatter.ofPattern("h:mm a", java.util.Locale.US));
            var end = java.time.LocalDate.parse(requirement.getDate()).atTime(endTime);
            if (java.time.LocalDateTime.now().isBefore(end)) throw new IllegalArgumentException("The activity has not ended yet");
        } catch (IllegalArgumentException e) {
            if ("The activity has not ended yet".equals(e.getMessage())) throw e;
            throw new IllegalArgumentException("Assignment date or end time is invalid");
        }
        if (participationRepository.existsByAssignmentId(assignmentId))
            return participationRepository.findByAssignmentId(assignmentId).orElseThrow();
        assignment.setStatus("COMPLETED");
        assignmentRepository.save(assignment);
        Participation participation = new Participation();
        participation.setAssignment(assignment);
        participation.setStatus("COMPLETED");
        participation.setHours(hours);
        participation.setCompletedAt(java.time.LocalDateTime.now().toString());
        return participationRepository.save(participation);
    }

    @Transactional
    public Participation rate(Long participationId, Long ngoUserId, Integer rating) {
        if (rating == null || rating < 1 || rating > 5) throw new IllegalArgumentException("Rating must be between 1 and 5");
        Participation p = participationRepository.findById(participationId).orElseThrow(() -> new IllegalArgumentException("Participation not found"));
        if (!p.getAssignment().getRequirement().getNgo().getUser().getId().equals(ngoUserId)) throw new IllegalArgumentException("Participation not found");
        p.setRating(rating);
        return participationRepository.save(p);
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
