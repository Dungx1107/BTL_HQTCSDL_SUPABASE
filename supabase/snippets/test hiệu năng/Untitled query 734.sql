EXPLAIN ANALYZE
SELECT 
    status,
    COUNT(id) AS total_orders,
    SUM(total_amount) AS total_revenue,
    ROUND(AVG(total_amount), 2) AS average_order_value
FROM public.orders
GROUP BY status;