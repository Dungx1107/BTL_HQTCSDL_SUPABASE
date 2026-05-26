-- 1. Thêm 20,000 sản phẩm mẫu đa dạng phân khúc và danh mục
INSERT INTO products (name, description, price, stock)
SELECT 
  -- Đa dạng hóa tên sản phẩm bằng cách kết hợp Ngành hàng + Hãng + Hậu tố ngẫu nhiên
  (ARRAY['Laptop', 'Smartphone', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Smartwatch', 'Router', 'Storage Drive', 'Tablet'])[floor(random() * 10 + 1)] || ' ' ||
  (ARRAY['Pro', 'Ultra', 'X', 'Alpha', 'Elite', 'Gaming', 'Prime', 'Mini', 'Plus', 'Air'])[floor(random() * 10 + 1)] || ' ' || 
  'Series-' || s.i AS name,
  
  -- Đa dạng hóa mô tả sản phẩm
  'Enterprise grade ' || 
  (ARRAY['high performance', 'energy saving', 'ergonomic design', 'next-gen architecture'])[floor(random() * 4 + 1)] || 
  ' device. Serial hardware code: ' || md5(s.i::text) AS description,
  
  -- Phân cấp giá từ giá rẻ ($10) đến cao cấp ($2500) sử dụng lũy thừa ngẫu nhiên để phân bổ đều
  (POWER(random(), 2) * 2490 + 10)::numeric(10,2) AS price,
  
  -- Số lượng tồn kho ngẫu nhiên từ 0 (hết hàng) đến 500
  floor(random() * 501)::int AS stock
FROM generate_series(1, 20000) s(i);


-- 2. Thêm 50,000 đơn hàng để tạo áp lực tải thực tế cho JOIN và AGGREGATION
-- Tỷ lệ đơn hàng lớn hơn giúp kiểm tra khả năng tối ưu Index của PostgreSQL v17
INSERT INTO orders (user_id, total_amount, status, created_at)
SELECT 
  -- Lấy ngẫu nhiên user_id từ bảng profiles (giả định bảng profiles đã có dữ liệu)
  (SELECT id FROM profiles ORDER BY random() LIMIT 1),
  
  -- Tổng tiền đơn hàng
  (random() * 1500 + 5)::numeric(10,2) AS total_amount,
  
  -- Trạng thái đơn hàng phân bổ theo tỷ lệ (completed chiếm đa số để thực tế hơn)
  (ARRAY['pending', 'completed', 'completed', 'shipped', 'cancelled'])[floor(random() * 5 + 1)] AS status,
  
  -- Phân bổ thời gian ngẫu nhiên trong vòng 90 ngày gần nhất
  NOW() - (random() * interval '90 days')
FROM generate_series(1, 50000) s(i);