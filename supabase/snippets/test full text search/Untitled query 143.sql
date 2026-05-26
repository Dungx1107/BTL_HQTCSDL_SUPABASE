EXPLAIN ANALYZE
SELECT 
  name, 
  price,
  ts_rank(fts_tokens, to_tsquery('english', 'gaming & laptop')) AS relevance_score
FROM public.products
WHERE fts_tokens @@ to_tsquery('english', 'gaming & laptop')
ORDER BY relevance_score DESC;