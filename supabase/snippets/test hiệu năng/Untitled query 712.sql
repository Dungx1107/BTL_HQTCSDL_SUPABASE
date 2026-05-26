EXPLAIN ANALYZE
SELECT id, name, price, stock 
FROM public.products 
WHERE name LIKE '%Gaming%';