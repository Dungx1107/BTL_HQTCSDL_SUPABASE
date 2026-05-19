package com.showcase.backend.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "system_metrics")
public class SystemMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cpu_usage")
    private BigDecimal cpuUsage;

    @Column(name = "memory_usage")
    private BigDecimal memoryUsage;

    @Column(name = "active_users")
    private Integer activeUsers;

    @Column(name = "recorded_at", insertable = false, updatable = false)
    private ZonedDateTime recordedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BigDecimal getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(BigDecimal cpuUsage) { this.cpuUsage = cpuUsage; }
    public BigDecimal getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(BigDecimal memoryUsage) { this.memoryUsage = memoryUsage; }
    public Integer getActiveUsers() { return activeUsers; }
    public void setActiveUsers(Integer activeUsers) { this.activeUsers = activeUsers; }
    public ZonedDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(ZonedDateTime recordedAt) { this.recordedAt = recordedAt; }
}
