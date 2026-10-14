package com.ngovolunteer.matching.service;

import com.ngovolunteer.matching.entity.Assignment;
import com.ngovolunteer.matching.repository.AssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentService(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }
    public List<Assignment> getAssignmentsByNgoUserId(Long userId) {
        return assignmentRepository.findByRequirementNgoUserId(userId);
    }
    public List<Assignment> getAssignmentsByVolunteerUserId(Long userId) {
        return assignmentRepository.findByVolunteerUserId(userId);
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id).orElse(null);
    }

    public Assignment updateAssignment(Long id, Assignment assignment) {
        Assignment existingAssignment =
                assignmentRepository.findById(id).orElse(null);

        if (existingAssignment == null) {
            return null;
        }

        String status = assignment.getStatus() == null ? "" : assignment.getStatus().trim().toUpperCase();
        if (!java.util.Set.of("ASSIGNED", "CANCELLED").contains(status))
            throw new IllegalArgumentException("Invalid assignment status; completion is recorded through participation");
        existingAssignment.setStatus(status);

        return assignmentRepository.save(existingAssignment);
    }

    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
}
