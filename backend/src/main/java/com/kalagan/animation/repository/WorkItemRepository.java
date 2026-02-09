package com.kalagan.animation.repository;

import com.kalagan.animation.model.WorkItem;
import com.kalagan.animation.model.WorkStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkItemRepository extends JpaRepository<WorkItem, Long> {
    List<WorkItem> findAllByOrderByIdAsc();

    Optional<WorkItem> findFirstByStatusOrderByIdAsc(WorkStatus status);
}
