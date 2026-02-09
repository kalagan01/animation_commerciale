package com.kalagan.animation.web;

import com.kalagan.animation.model.WorkAction;
import com.kalagan.animation.model.WorkItem;
import com.kalagan.animation.service.WorkQueueAgent;
import com.kalagan.animation.service.WorkQueueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WorkQueueController {
    private final WorkQueueService workQueueService;
    private final WorkQueueAgent workQueueAgent;

    public WorkQueueController(WorkQueueService workQueueService, WorkQueueAgent workQueueAgent) {
        this.workQueueService = workQueueService;
        this.workQueueAgent = workQueueAgent;
    }

    @PostMapping("/work-items")
    public ResponseEntity<WorkItemResponse> create(@RequestBody WorkItemRequest request) {
        WorkItem item = workQueueService.createWorkItem(request.getTitle(), request.getSupervisor());
        return ResponseEntity.ok(WorkItemResponse.from(item));
    }

    @PostMapping("/work-items/{id}/assign")
    public ResponseEntity<WorkItemResponse> assign(@PathVariable Long id, @RequestBody AssignRequest request) {
        WorkItem item = workQueueService.assignWorkItem(id, request.getAgent());
        return ResponseEntity.ok(WorkItemResponse.from(item));
    }

    @PostMapping("/work-items/{id}/complete")
    public ResponseEntity<WorkItemResponse> complete(@PathVariable Long id, @RequestBody AssignRequest request) {
        WorkItem item = workQueueService.completeWorkItem(id, request.getAgent());
        return ResponseEntity.ok(WorkItemResponse.from(item));
    }

    @PostMapping("/agent/next")
    public ResponseEntity<WorkItemResponse> assignNext(@RequestBody AssignRequest request) {
        WorkItem item = workQueueAgent.pickNext(request.getAgent());
        return ResponseEntity.ok(WorkItemResponse.from(item));
    }

    @GetMapping("/work-items")
    public ResponseEntity<List<WorkItemResponse>> listQueue() {
        List<WorkItemResponse> items = workQueueService.listQueue().stream()
                .map(WorkItemResponse::from)
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/audit")
    public ResponseEntity<List<WorkActionResponse>> audit() {
        List<WorkAction> actions = workQueueService.listAudit();
        List<WorkActionResponse> responses = actions.stream()
                .map(WorkActionResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }
}
