package com.kalagan.animation.web;

import com.kalagan.animation.model.WorkItem;
import com.kalagan.animation.model.WorkStatus;

public class WorkItemResponse {
    private Long id;
    private String title;
    private WorkStatus status;
    private String assignedTo;

    public static WorkItemResponse from(WorkItem item) {
        WorkItemResponse response = new WorkItemResponse();
        response.setId(item.getId());
        response.setTitle(item.getTitle());
        response.setStatus(item.getStatus());
        response.setAssignedTo(item.getAssignedTo());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public WorkStatus getStatus() {
        return status;
    }

    public void setStatus(WorkStatus status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
}
