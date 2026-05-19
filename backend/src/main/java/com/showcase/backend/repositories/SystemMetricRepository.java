package com.showcase.backend.repositories;

import com.showcase.backend.entities.SystemMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, Long> {
    List<SystemMetric> findTop20ByOrderByRecordedAtDesc();
}
