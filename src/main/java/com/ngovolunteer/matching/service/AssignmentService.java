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

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id).orElse(null);
    }

    public Assignment updateAssignment(Long id, Assignment assignment) {
        Assignment existingAssignment =
                assignmentRepository.findById(id).orElse(null);

        if (existingAssignment == null) {
            return null;
        }

        existingAssignment.setRequirement(assignment.getRequirement());
        existingAssignment.setVolunteer(assignment.getVolunteer());
        existingAssignment.setStatus(assignment.getStatus());
        existingAssignment.setAssignedAt(assignment.getAssignedAt());

        return assignmentRepository.save(existingAssignment);
    }

    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
}