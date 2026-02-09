package com.kalagan.animation.repository;

import com.kalagan.animation.model.WorkAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkActionRepository extends JpaRepository<WorkAction, Long> {
    List<WorkAction> findAllByOrderByOccurredAtDesc();
}
