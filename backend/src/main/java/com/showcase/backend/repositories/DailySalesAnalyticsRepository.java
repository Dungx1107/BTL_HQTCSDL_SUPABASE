package com.showcase.backend.repositories;

import com.showcase.backend.entities.DailySalesAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailySalesAnalyticsRepository extends JpaRepository<DailySalesAnalytics, LocalDate> {
    List<DailySalesAnalytics> findAllByOrderBySaleDateDesc();

    @Modifying
    @Transactional
    @Query(value = "REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_sales_analytics", nativeQuery = true)
    void refreshMaterializedView();
}
