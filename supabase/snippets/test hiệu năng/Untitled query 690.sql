EXPLAIN ANALYZE
SELECT id, name, price, stock 
FROM public.products 
WHERE price BETWEEN 1500 AND 2000 AND stock > 100;