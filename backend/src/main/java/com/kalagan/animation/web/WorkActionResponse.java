package com.kalagan.animation.web;

import com.kalagan.animation.model.WorkAction;

import java.time.LocalDateTime;

public class WorkActionResponse {
    private Long id;
    private Long workItemId;
    private String actionType;
    private String actor;
    private LocalDateTime occurredAt;

    public static WorkActionResponse from(WorkAction action) {
        WorkActionResponse response = new WorkActionResponse();
        response.setId(action.getId());
        response.setWorkItemId(action.getWorkItem().getId());
        response.setActionType(action.getActionType());
        response.setActor(action.getActor());
        response.setOccurredAt(action.getOccurredAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkItemId() {
        return workItemId;
    }

    public void setWorkItemId(Long workItemId) {
        this.workItemId = workItemId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getActor() {
        return actor;
    }

    public void setActor(String actor) {
        this.actor = actor;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(LocalDateTime occurredAt) {
        this.occurredAt = occurredAt;
    }
}
