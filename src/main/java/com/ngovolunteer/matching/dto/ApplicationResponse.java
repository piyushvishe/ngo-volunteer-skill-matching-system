package com.ngovolunteer.matching.dto;

public class ApplicationResponse {

    private Long id;
    private Long volunteerId;
    private Long requirementId;
    private String status;

    public ApplicationResponse() {
    }

    public ApplicationResponse(
            Long id,
            Long volunteerId,
            Long requirementId,
            String status) {

        this.id = id;
        this.volunteerId = volunteerId;
        this.requirementId = requirementId;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getVolunteerId() {
        return volunteerId;
    }

    public Long getRequirementId() {
        return requirementId;
    }

    public String getStatus() {
        return status;
    }
}