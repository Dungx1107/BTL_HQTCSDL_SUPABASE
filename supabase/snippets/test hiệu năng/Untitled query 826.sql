EXPLAIN ANALYZE
INSERT INTO public.orders (user_id, total_amount, status, created_at)
SELECT 
    (SELECT id FROM public.profiles ORDER BY random() LIMIT 1),
    (random() * 500 + 5)::numeric(10,2),
    'completed',
    NOW() - (random() * interval '10 days')
FROM generate_series(1, 10000);