-- 1. Thêm cột Generated Column tự động tính toán token tìm kiếm
ALTER TABLE public.products 
ADD COLUMN fts_tokens tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

-- 2. Tạo chỉ mục GIN để tối ưu hóa tốc độ truy vấn qua cấu trúc Inverted Index
CREATE INDEX idx_products_fts_tokens ON public.products USING gin(fts_tokens);

-- 3. Cập nhật lại thống kê nội bộ của PostgreSQL
ANALYZE public.products;