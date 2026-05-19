# Báo cáo Phân quyền & Tính năng: Vai trò Admin (Quản trị viên)

Tài liệu này giải thích chi tiết cách hệ thống xử lý quyền hạn, bảo mật và các tính năng cụ thể dành riêng cho vai trò `Admin`.

### Vai trò cốt lõi của Supabase đối với Admin:
Trong dự án này, **Supabase đóng vai trò là "Người gác cổng thép" (Gatekeeper)** thay thế hoàn toàn cho các thư viện JWT Auth và Middleware tự code phức tạp. 
- Supabase Auth tự động cấp phát, mã hóa và verify Token an toàn.
- CSDL Supabase cung cấp hệ thống Row Level Security (RLS) để chặn đứng mọi truy vấn phá hoại từ cấp độ cơ sở dữ liệu, cho dù API có bị hacker vượt qua.

## 1. Cơ chế phân quyền (RBAC) cho Admin

Vai trò Admin được định nghĩa trong cơ sở dữ liệu với `role_id = 1` (tham chiếu từ bảng `public.roles`). Khi Admin đăng nhập, toàn bộ hệ thống từ Frontend (Next.js) đến Backend (Supabase) đều cấp quyền cao nhất.

### 1.1. Middleware Bảo vệ Tuyến đường (Frontend)
- **Tệp xử lý:** `frontend/src/lib/supabase/middleware.ts`
- **Cách hoạt động:** 
  Khi người dùng truy cập vào `/dashboard` (Analytics), hệ thống Edge Middleware của Next.js sẽ chặn lại và truy vấn trực tiếp bảng `user_roles` từ Supabase. Nếu `role_id === 1`, Middleware cho phép đi tiếp. Nếu không, người dùng bị đẩy văng sang `/dashboard/chat`.

### 1.2. Row Level Security (Database)
- **Tệp xử lý:** `supabase/migrations/20240101000000_initial_schema.sql` (Phần số 7)
- **Hàm kiểm tra quyền Admin:** 
  Hệ thống sử dụng một hàm SQL `public.is_admin()` để tự động quét `role_id`.
- **Cách hoạt động trên bảng dữ liệu:**
  - **Sản phẩm (`products`):** Chỉ Admin mới có quyền Thêm/Sửa/Xóa (`insert`, `update`, `delete`). User thường chỉ được phép xem.
  - **Đơn hàng (`orders`):** Policy `Users can view own orders` kết hợp thêm điều kiện `or public.is_admin()`, giúp Admin có thể nhìn thấy xuyên thấu toàn bộ đơn hàng của tất cả mọi người trong hệ thống.

## 2. Các Tính năng Độc quyền của Admin

### 2.1. Xem Thống kê & Doanh thu (Analytics Dashboard)
- **Giao diện (Frontend):** `frontend/src/app/(dashboard)/dashboard/page.tsx`
- **Xử lý dữ liệu (Backend Spring Boot):** `backend/src/main/java/com/showcase/backend/controllers/AnalyticsController.java`
- **Cách hoạt động:** Màn hình này hiển thị các chỉ số hệ thống (CPU, RAM) và biểu đồ doanh thu theo ngày. Dữ liệu này được trích xuất từ các **Materialized View** (`daily_sales_analytics`) trong CSDL, giúp truy vấn hàng triệu bản ghi chỉ trong mili-giây.

### 2.2. Nhắn tin Realtime 1-1
- **Tệp xử lý:** `frontend/src/app/(dashboard)/chat/page.tsx`
- Admin có thể chat trực tiếp với bất kỳ người dùng nào thông qua công nghệ WebSockets tích hợp sẵn của Supabase (extension `pg_realtime`), tương tác 2 chiều trên bảng `direct_messages`.

## 3. Luồng hoạt động Demo
1. Đăng nhập với thông tin `admin@example.com` (pass: `admin123`).
2. Giao diện ngay lập tức mở ra trang **Analytics Dashboard** vì hệ thống nhận diện đúng Role.
3. Trong Sidebar bên trái, thẻ Profile Badge sẽ hiển thị chức danh **Administrator**.
4. Truy cập **RLS Playground**, Admin sẽ thấy toàn bộ đơn hàng của User 1, User 2, User 3 do quyền RLS cấp phép.
