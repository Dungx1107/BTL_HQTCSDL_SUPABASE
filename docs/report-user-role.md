# Báo cáo Phân quyền & Tính năng: Vai trò User (Người dùng thường)

Tài liệu này giải thích chi tiết cách hệ thống xử lý quyền hạn, bảo vệ an toàn dữ liệu và các tính năng cụ thể dành riêng cho vai trò `User` tiêu chuẩn.

### Vai trò cốt lõi của Supabase đối với User:
Đối với User, trải nghiệm mượt mà và an toàn là quan trọng nhất. Supabase đóng vai trò nền tảng ở hai mặt:
1. **Tính năng Realtime:** Thay vì phải code máy chủ Node.js + Socket.IO phức tạp và hay đứt kết nối, Supabase cung cấp extension `pg_realtime`. Tính năng chat 1-1 của User được bắn trực tiếp từ Postgres lên Frontend với độ trễ gần bằng 0.
2. **Quyền Riêng tư (RLS):** Supabase đảm bảo User A không bao giờ nhìn thấy Đơn hàng hoặc Tin nhắn của User B, nhờ vào các Policy lọc dữ liệu tự động ở mức phần cứng Database.

## 1. Cơ chế phân quyền (RBAC) cho User

Vai trò User được định nghĩa trong cơ sở dữ liệu với `role_id = 3`. Đây là quyền hạn mặc định khi một người dùng mới đăng ký hoặc được hệ thống tạo sẵn thông qua file `seed.sql`.

### 1.1. Middleware Chặn Truy Cập (Frontend)
- **Tệp xử lý:** `frontend/src/lib/supabase/middleware.ts`
- **Tệp giao diện Sidebar:** `frontend/src/components/layout/sidebar.tsx`
- **Cách hoạt động:** 
  1. Khi ở giao diện, Sidebar tự động ẩn mất nút "Analytics Dashboard" để tránh việc User vô tình bấm vào.
  2. Nếu User cố tình gõ đường dẫn `/dashboard` trên thanh địa chỉ, Edge Middleware sẽ quét JWT token và gọi DB để kiểm tra. Phát hiện không phải Admin, Middleware lập tức chuyển hướng (HTTP 307 Redirect) User sang trang `/dashboard/chat`.

### 1.2. Row Level Security (Database)
- **Tệp xử lý:** `supabase/migrations/20240101000000_initial_schema.sql`
- **Cách hoạt động bảo mật:**
  - **Sản phẩm (`products`):** User chỉ có quyền đọc (Select), hoàn toàn không có quyền Thêm/Sửa/Xóa.
  - **Đơn hàng (`orders`):** Database được gắn một Policy có tên `"Users can view own orders"`. Policy này chứa điều kiện `using (auth.uid() = user_id)`. Mọi truy vấn `SELECT * FROM orders` từ Frontend gửi xuống sẽ bị CSDL lọc và ép buộc chỉ trả về các dòng dữ liệu của chính người đang đăng nhập.

## 2. Các Tính năng Cốt lõi của User

### 2.1. Nhắn tin Realtime 1-1 (Direct Messages)
- **Tệp xử lý:** `frontend/src/app/(dashboard)/chat/page.tsx`
- **Cách hoạt động:** 
  - User có thể chọn bất kỳ ai trong hệ thống để nhắn tin riêng.
  - Dữ liệu được ghi vào `direct_messages`.
  - Frontend đăng ký kênh `supabase.channel(...)`. Có tin nhắn mới, giao diện lập tức render hiển thị ra màn hình (< 50ms) nhờ Postgres Realtime.

### 2.2. Kiểm thử bảo mật (RLS Playground)
- **Tệp xử lý:** `frontend/src/app/(dashboard)/rls-playground/page.tsx`
- User có thể cố tình sử dụng giao diện này để "hack" (Sửa / Xóa) đơn hàng không thuộc về mình. CSDL Supabase lập tức chặn lại và ném ra lỗi `403 Forbidden`, hiển thị thành Toast màu đỏ.

### 2.3. Tìm kiếm Ngữ nghĩa AI (Semantic Search)
- **Tệp xử lý (Frontend):** `frontend/src/app/(dashboard)/ai-search/page.tsx`
- **Tệp xử lý (Database/RPC):** `supabase/migrations/20240101000000_initial_schema.sql` (Phần số 4: `public.match_documents`)
- **Cách hoạt động:** 
  - Tính năng này sử dụng extension `pgvector` bên trong PostgreSQL.
  - User nhập từ khóa (Ví dụ: "máy tính nhanh"). Hệ thống lấy đoạn text đó biến đổi thành một mảng số Vector (Embedding).
  - PostgreSQL sẽ chạy hàm `match_documents` thực hiện thuật toán tính khoảng cách Cosine Similarity giữa Vector câu hỏi và Vector dữ liệu trong CSDL, trả về kết quả gần đúng nhất về mặt "Ý nghĩa" thay vì tìm theo kiểu "Khớp từng chữ" như SQL LIKE truyền thống.
*(Lưu ý: Tính năng này được dùng chung cho cả Admin).*
