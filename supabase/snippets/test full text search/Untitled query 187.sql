SELECT name, description
FROM public.products
WHERE fts_tokens @@ to_tsquery('english', 'play & game');