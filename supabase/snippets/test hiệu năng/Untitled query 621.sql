EXPLAIN ANALYZE
SELECT 
    o.id AS order_id,
    p.full_name AS customer_name,
    o.total_amount,
    o.status,
    o.created_at
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 5000;