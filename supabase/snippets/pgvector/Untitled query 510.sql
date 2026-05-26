-- 1. Xóa hàm cũ để tránh xung đột
DROP FUNCTION IF EXISTS match_documents;

-- 2. Xóa sạch dữ liệu cũ trong bảng để đưa cột về trạng thái trống (Tránh lỗi ép kiểu dữ liệu)
TRUNCATE TABLE public.documents;

-- 3. Bây giờ thay đổi cấu trúc cột lên 768 chiều sẽ thành công 100%
ALTER TABLE public.documents 
ALTER COLUMN embedding TYPE vector(768);

-- 4. Khởi tạo lại hàm tìm kiếm khoảng cách Cosine khớp với 768 chiều
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;