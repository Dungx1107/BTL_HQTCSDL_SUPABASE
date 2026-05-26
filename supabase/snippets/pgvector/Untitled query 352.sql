-- 1. Xóa hàm cũ để tránh xung đột cấu trúc
DROP FUNCTION IF EXISTS match_documents;

-- 2. Khởi tạo lại hàm với kiểu dữ liệu trả về khớp hoàn toàn với bảng
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title character varying(255), -- ĐÃ SỬA: Chuyển từ text thành character varying(255)
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
    (1 - (documents.embedding <=> query_embedding))::float AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;