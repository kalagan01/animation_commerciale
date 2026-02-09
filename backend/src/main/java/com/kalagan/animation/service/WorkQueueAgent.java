package com.kalagan.animation.service;

import com.kalagan.animation.model.WorkItem;
import org.springframework.stereotype.Component;

@Component
public class WorkQueueAgent {
    private final WorkQueueService workQueueService;

    public WorkQueueAgent(WorkQueueService workQueueService) {
        this.workQueueService = workQueueService;
    }

    public WorkItem pickNext(String agentName) {
        return workQueueService.assignNextWorkItem(agentName);
    }
}
