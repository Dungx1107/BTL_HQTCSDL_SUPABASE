package com.showcase.backend.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_sales_analytics")
public class DailySalesAnalytics {

    @Id
    @Column(name = "sale_date")
    private LocalDate saleDate;

    @Column(name = "total_orders")
    private Long totalOrders;

    @Column(name = "total_revenue")
    private BigDecimal totalRevenue;

    // Getters and Setters
    public LocalDate getSaleDate() { return saleDate; }
    public void setSaleDate(LocalDate saleDate) { this.saleDate = saleDate; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
