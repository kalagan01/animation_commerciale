package com.kalagan.animation.service;

import com.kalagan.animation.model.WorkAction;
import com.kalagan.animation.model.WorkItem;
import com.kalagan.animation.model.WorkStatus;
import com.kalagan.animation.repository.WorkActionRepository;
import com.kalagan.animation.repository.WorkItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkQueueService {
    private final WorkItemRepository workItemRepository;
    private final WorkActionRepository workActionRepository;

    public WorkQueueService(WorkItemRepository workItemRepository, WorkActionRepository workActionRepository) {
        this.workItemRepository = workItemRepository;
        this.workActionRepository = workActionRepository;
    }

    @Transactional
    public WorkItem createWorkItem(String title, String supervisor) {
        WorkItem item = new WorkItem(title, WorkStatus.NEW);
        WorkItem saved = workItemRepository.save(item);
        audit(saved, "CREATE", supervisor);
        return saved;
    }

    @Transactional
    public WorkItem assignWorkItem(Long id, String agent) {
        WorkItem item = workItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work item not found"));
        item.setAssignedTo(agent);
        item.setStatus(WorkStatus.ASSIGNED);
        WorkItem saved = workItemRepository.save(item);
        audit(saved, "ASSIGN", agent);
        return saved;
    }

    @Transactional
    public WorkItem completeWorkItem(Long id, String agent) {
        WorkItem item = workItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Work item not found"));
        item.setAssignedTo(agent);
        item.setStatus(WorkStatus.COMPLETED);
        WorkItem saved = workItemRepository.save(item);
        audit(saved, "COMPLETE", agent);
        return saved;
    }

    @Transactional
    public WorkItem assignNextWorkItem(String agent) {
        WorkItem next = workItemRepository.findFirstByStatusOrderByIdAsc(WorkStatus.NEW)
                .orElseThrow(() -> new IllegalStateException("No new work items available"));
        next.setAssignedTo(agent);
        next.setStatus(WorkStatus.ASSIGNED);
        WorkItem saved = workItemRepository.save(next);
        audit(saved, "ASSIGN_NEXT", agent);
        return saved;
    }

    public List<WorkItem> listQueue() {
        return workItemRepository.findAllByOrderByIdAsc();
    }

    public List<WorkAction> listAudit() {
        return workActionRepository.findAllByOrderByOccurredAtDesc();
    }

    private void audit(WorkItem item, String actionType, String actor) {
        WorkAction action = new WorkAction(item, actionType, actor, LocalDateTime.now());
        workActionRepository.save(action);
    }
}
