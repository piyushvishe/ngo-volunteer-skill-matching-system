package com.ngovolunteer.matching.dto;

public class AssignmentResponseDTO {
    private Long id, volunteerId, requirementId;
    private String status, assignedAt, volunteerName, ngoName, requirementTitle, location, date, time, description;
    public AssignmentResponseDTO(com.ngovolunteer.matching.entity.Assignment a) {
        var r = a.getRequirement(); var v = a.getVolunteer();
        id=a.getId(); volunteerId=v.getId(); requirementId=r.getId(); status=a.getStatus(); assignedAt=a.getAssignedAt();
        volunteerName=v.getUser().getName(); ngoName=r.getNgo().getOrganisationName(); requirementTitle=r.getTitle();
        location=r.getLocation(); date=r.getDate(); time=r.getTime(); description=r.getTaskDescription();
    }
    public Long getId(){return id;} public Long getVolunteerId(){return volunteerId;} public Long getRequirementId(){return requirementId;}
    public String getStatus(){return status;} public String getAssignedAt(){return assignedAt;} public String getVolunteerName(){return volunteerName;}
    public String getNgoName(){return ngoName;} public String getRequirementTitle(){return requirementTitle;} public String getLocation(){return location;}
    public String getDate(){return date;} public String getTime(){return time;} public String getDescription(){return description;}
}
