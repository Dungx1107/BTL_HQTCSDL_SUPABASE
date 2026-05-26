-- Thêm nhanh 1000 sản phẩm mẫu bằng vòng lặp ngẫu nhiên
INSERT INTO products (name, description, price, stock)
SELECT 
  'Product Model ' || i,
  'High performance sample product description for benchmark testing number ' || i,
  (random() * 500 + 10)::numeric(10,2),
  (random() * 200 + 5)::int
FROM generate_series(1, 1000) s(i);

-- Thêm nhanh 10000 đơn hàng ngẫu nhiên để test áp lực lệnh JOIN và AGGREGATION
INSERT INTO orders (user_id, total_amount, status, created_at)
SELECT 
  -- Lấy ngẫu nhiên một user_id hiện có trong bảng profiles
  (SELECT id FROM profiles ORDER BY random() LIMIT 1),
  (random() * 1000 + 15)::numeric(10,2),
  (ARRAY['pending', 'completed', 'shipped'])[floor(random() * 3 + 1)],
  NOW() - (random() * interval '30 days')
FROM generate_series(1, 10000) s(i);