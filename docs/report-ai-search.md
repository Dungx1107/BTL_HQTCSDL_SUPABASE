# Báo cáo Kỹ thuật: Hệ thống Tìm kiếm Ngữ nghĩa (AI Semantic Search)

Tài liệu này phân tích chuyên sâu về kiến trúc, cách triển khai code và hướng dẫn nâng cấp đối với tính năng Tìm kiếm bằng AI (Semantic Search) sử dụng `pgvector` và `Transformers.js` trong dự án.

---

## 1. Tổng quan công nghệ (Overview)

Khác với các hệ thống tìm kiếm truyền thống sử dụng từ khóa (Keyword-based) như `SQL LIKE %...%` hay `Full-text search` (chỉ trả về kết quả khi gõ chính xác từ), hệ thống này có khả năng **"hiểu"** ý nghĩa của câu nói. 
Ví dụ: Gõ `"màn hình bự"`, hệ thống vẫn trả về `"4K Monitor"` vì nó hiểu hai khái niệm này tương đồng với nhau trong không gian đa chiều.

Để làm được điều này mà **không cần mất tiền mua API của OpenAI**, hệ thống sử dụng một mô hình AI cục bộ (Local Model) nhúng thẳng vào máy chủ Next.js kết hợp với cơ sở dữ liệu vector của PostgreSQL.

### Vai trò cốt lõi của Supabase trong tính năng này:
Thay vì phải tự xây dựng một Vector Database riêng lẻ (như Pinecone hay Milvus) rất đắt đỏ và phức tạp, **Supabase cung cấp sẵn sức mạnh của PostgreSQL kết hợp với extension `pgvector`**. 
- Nó cho phép chúng ta lưu trữ mảng Vector thẳng vào bảng dữ liệu E-commerce (cột `embedding` trong bảng `documents`).
- Nó cho phép tìm kiếm cực nhanh thông qua Index **HNSW** (Hierarchical Navigable Small World).
- Nó cung cấp khả năng viết hàm **RPC (Remote Procedure Call)** để tính toán thuật toán khoảng cách Cosine ngay ở tầng Database mà không cần tải dữ liệu rác về Server Frontend.

---

## 2. Luồng hoạt động (Architecture Flow)

Toàn bộ quy trình diễn ra trong vỏn vẹn `~1` giây theo 5 bước:
1. **Người dùng** nhập từ khóa vào ô tìm kiếm trên trình duyệt.
2. **Frontend** gửi từ khóa đó lên một API nội bộ của Next.js (`/api/embed`).
3. **Next.js Server** sử dụng thư viện `@xenova/transformers` để nạp mô hình ngôn ngữ `all-MiniLM-L6-v2`. Mô hình này "đọc" từ khóa và chuyển đổi nó thành một mảng gồm **384 con số thập phân** (được gọi là Vector Embedding).
4. **Next.js** cầm mảng 384 số này, gọi một hàm RPC (Remote Procedure Call) xuống CSDL Supabase.
5. **PostgreSQL** dùng Extension `pgvector` và thuật toán HNSW để quét toàn bộ CSDL. Nó đo "Khoảng cách Cosine" giữa vector câu hỏi và vector của dữ liệu. Khoảng cách càng ngắn = ý nghĩa càng giống nhau. Cuối cùng trả về kết quả.

---

## 3. Chi tiết Mã nguồn (Code Implementation)

### 3.1. Tầng Database (Cơ sở dữ liệu & Thuật toán)
- **Tệp định nghĩa:** `supabase/migrations/20240101000000_initial_schema.sql`
- **Khởi tạo:** Bật extension vector: `create extension if not exists "vector";`
- **Bảng dữ liệu (`public.documents`):**
  Lưu ý cột `embedding` được ép kiểu là `vector(384)` vì mô hình AI cục bộ chỉ sinh ra mảng 384 chiều (nếu dùng OpenAI sẽ là 1536).
  ```sql
  create table public.documents (
      id uuid primary key,
      title varchar(255) not null,
      content text not null,
      embedding vector(384) -- Chứa mảng số AI
  );
  -- Tạo Index HNSW để tăng tốc độ quét hàng triệu bản ghi
  create index on public.documents using hnsw (embedding vector_cosine_ops);
  ```
- **Hàm xử lý Tìm kiếm (`public.match_documents`):**
  Hàm này nhận vào Vector truy vấn, tính toán sự tương đồng (Similarity) bằng phép toán `<=>` (Cosine distance) của pgvector.
  ```sql
  1 - (documents.embedding <=> query_embedding) as similarity
  ```

### 3.2. Tầng Máy chủ API (Sinh Vector AI)
- **Tệp xử lý:** `frontend/src/app/api/embed/route.ts`
- **Cách hoạt động:** File này chứa một `PipelineSingleton` giúp tải mô hình AI `Xenova/all-MiniLM-L6-v2` duy nhất 1 lần vào RAM khi server khởi động (tránh giật lag). Khi nhận được Text, nó lập tức dùng AI để trích xuất ra mảng `Float32Array` (384 số) và trả về cho giao diện.

### 3.3. Tầng Giao diện (Người dùng)
- **Tệp xử lý:** `frontend/src/app/(dashboard)/ai-search/page.tsx`
- **Cách hoạt động:** Hàm `handleSearch` gửi yêu cầu lên `/api/embed`, lấy cục Vector về, rồi gọi tiếp hàm `supabase.rpc("match_documents", { query_embedding: embedding, ... })` để in kết quả ra màn hình.

### 3.4. Script Nạp dữ liệu (Data Seeding)
- **Tệp xử lý:** `frontend/scripts/seed-vectors.js`
- **Tác dụng:** CSDL ban đầu trống trơn. Script này đọc một mảng JSON các văn bản mẫu (Ví dụ: thông tin về Laptop, Bàn phím), tự động biến chúng thành Vector bằng AI, và cắm thẳng vào bảng `documents` với quyền `Service Role Key` (bỏ qua RLS bảo mật).

---

## 4. Hướng cải thiện & Nâng cấp hệ thống (Future Improvements)

Nếu bạn muốn mở rộng dự án này thành một hệ thống siêu cấp (Enterprise level), đây là những điểm có thể cải thiện:

### 4.1. Cải thiện độ chính xác (Sử dụng OpenAI / Cohere)
- **Vấn đề:** Mô hình `all-MiniLM-L6-v2` (384 chiều) rất nhẹ và miễn phí, nhưng khả năng hiểu tiếng Việt phức tạp hoặc văn bản siêu dài còn hạn chế.
- **Giải pháp:** Xóa bỏ API `/api/embed` nội bộ. Cài đặt thư viện `openai` của Node.js. Chỉnh lại CSDL thành `vector(1536)`. Khi gọi tìm kiếm, hãy gọi API `text-embedding-ada-002` hoặc `text-embedding-3-small` của OpenAI. Phí rất rẻ nhưng AI cực kỳ thông minh.

### 4.2. Tìm kiếm lai (Hybrid Search)
- **Vấn đề:** Đôi khi người dùng gõ mã sản phẩm (Ví dụ: `SKU-12345`). Semantic Search có thể tính toán ý nghĩa sai đối với các dải số/mã vạch.
- **Giải pháp:** Kết hợp **Full-Text Search (tsvector)** truyền thống của Postgres với **Semantic Search**. Bắn cả 2 truy vấn cùng lúc, sau đó dùng thuật toán RRF (Reciprocal Rank Fusion) để trộn điểm của cả 2 lại với nhau, mang lại kết quả đúng nhất cả về "ý nghĩa" lẫn "mã từ khóa".

### 4.3. Quản lý hàng đợi khi nhồi dữ liệu (Queue System)
- **Vấn đề:** Hiện tại script `seed-vectors.js` nạp bằng vòng lặp `for`. Nếu DB có 1 triệu sản phẩm, server Next.js sẽ bị quá tải RAM (Out of Memory) khi chạy AI để nhúng từng cái một.
- **Giải pháp:** Tách việc tạo Vector ra thành một Job chạy ngầm (Background Job). Sử dụng `BullMQ` hoặc tính năng Webhooks của Supabase để cứ khi nào có 1 Product mới được thêm vào DB -> Đẩy sang hàng đợi -> Máy chủ AI từ từ xử lý và tự động Update lại cột `embedding` sau.
