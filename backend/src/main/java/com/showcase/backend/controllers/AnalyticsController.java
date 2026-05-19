package com.showcase.backend.controllers;

import com.showcase.backend.entities.DailySalesAnalytics;
import com.showcase.backend.entities.SystemMetric;
import com.showcase.backend.repositories.DailySalesAnalyticsRepository;
import com.showcase.backend.repositories.SystemMetricRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*") // Allow frontend to call
public class AnalyticsController {

    @Autowired
    private SystemMetricRepository systemMetricRepository;

    @Autowired
    private DailySalesAnalyticsRepository dailySalesAnalyticsRepository;

    @GetMapping("/metrics")
    public ResponseEntity<List<SystemMetric>> getSystemMetrics() {
        return ResponseEntity.ok(systemMetricRepository.findTop20ByOrderByRecordedAtDesc());
    }

    @GetMapping("/sales")
    public ResponseEntity<List<DailySalesAnalytics>> getDailySales() {
        return ResponseEntity.ok(dailySalesAnalyticsRepository.findAllByOrderBySaleDateDesc());
    }

    @PostMapping("/sales/refresh")
    public ResponseEntity<Map<String, String>> refreshSalesAnalytics() {
        try {
            dailySalesAnalyticsRepository.refreshMaterializedView();
            return ResponseEntity.ok(Map.of("message", "Materialized view refreshed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
