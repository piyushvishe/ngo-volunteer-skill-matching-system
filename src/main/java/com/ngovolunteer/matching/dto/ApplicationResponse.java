package com.ngovolunteer.matching.dto;

public class ApplicationResponse {

    private Long id;
    private Long volunteerId;
    private Long requirementId;
    private String status;
    private String volunteerName, volunteerEmail, volunteerPhone, requirementTitle, location, date, time, description;

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

    public ApplicationResponse(com.ngovolunteer.matching.entity.Application a) {
        this(a.getId(), a.getVolunteer().getId(), a.getRequirement().getId(), a.getStatus());
        var v=a.getVolunteer(); var r=a.getRequirement();
        volunteerName=v.getUser().getName(); volunteerEmail=v.getUser().getEmail(); volunteerPhone=v.getUser().getPhone();
        requirementTitle=r.getTitle(); location=r.getLocation(); date=r.getDate(); time=r.getTime(); description=r.getTaskDescription();
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
    public String getVolunteerName(){return volunteerName;} public String getVolunteerEmail(){return volunteerEmail;}
    public String getVolunteerPhone(){return volunteerPhone;} public String getRequirementTitle(){return requirementTitle;}
    public String getLocation(){return location;} public String getDate(){return date;} public String getTime(){return time;} public String getDescription(){return description;}
}
