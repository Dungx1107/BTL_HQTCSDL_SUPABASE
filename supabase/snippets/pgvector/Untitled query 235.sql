-- 1. Xóa hàm cũ để cấu hình lại
DROP FUNCTION IF EXISTS match_documents;

-- 2. Khởi tạo lại hàm với cấu trúc trả về tự động khớp theo bảng documents
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,       -- Đã chuyển sang bigint cho khớp với cấu trúc bảng mặc định của Supabase
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
    (1 - (documents.embedding <=> query_embedding))::float AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;