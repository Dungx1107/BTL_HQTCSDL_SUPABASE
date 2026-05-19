# PHÂN TÍCH KIẾN TRÚC & TÀI LIỆU DỰ ÁN (PROJECT ANALYSIS)

Đây là tài liệu phân tích kỹ thuật chuyên sâu dành cho nhà phát triển (Developer/Maintainer) để hiểu trọn vẹn luồng hoạt động của hệ thống `Supabase Ultimate Showcase`.

---

## PHẦN 1 — PHÂN TÍCH KIẾN TRÚC TỔNG THỂ

Hệ thống được thiết kế theo mô hình **Tách rời Frontend/Backend (Decoupled Architecture)** kết hợp với **BaaS (Backend-as-a-Service)** thông qua Supabase.

### 1. Frontend (Giao diện người dùng)
- **Framework:** Next.js (App Router, React Server Components).
- **Styling:** TailwindCSS kết hợp với icon từ thư viện `lucide-react`.
- **Routing:** Hoạt động dựa trên thư mục `app/`. Các trang được gom nhóm trong `(dashboard)` để dùng chung Layout (có Sidebar) và chia sẻ luồng bảo vệ bằng Middleware.
- **State Management:** Quản lý state cục bộ bằng `useState`, `useEffect`. Dữ liệu từ DB được fetch trực tiếp thông qua Supabase Client thay vì dùng Redux.
- **Auth Handling:** Xử lý bằng gói `@supabase/ssr`. Quá trình kiểm tra phiên đăng nhập diễn ra ở cả Client (trình duyệt) và Server (Next.js Middleware) để đảm bảo không bị rò rỉ UI.
- **Realtime Handling:** Sử dụng `supabase.channel()` để đăng ký kết nối WebSockets tới bảng trong Database.
- **UI Structure:** Giao diện sử dụng kỹ thuật Glassmorphism (làm mờ nền `backdrop-blur`) và thiết kế thẻ Card bo góc viền tinh tế. Hệ thống thông báo lỗi/thành công (Toast) do thư viện `sonner` gánh vác.

### 2. Backend (Máy chủ xử lý tác vụ nặng)
Dự án **không** dùng Backend cho toàn bộ API, mà chỉ dùng cho các tác vụ phân tích nặng.
- **Framework:** Java Spring Boot.
- **API Structure:** Thiết kế chuẩn RESTful API.
- **Service/Controller Layer:** `AnalyticsController.java` xử lý các endpoint lấy thống kê.
- **Repository Layer:** Sử dụng Spring Data JPA (`SystemMetricRepository.java`, `DailySalesAnalyticsRepository.java`) để gọi xuống PostgreSQL.
- **Security:** Cho phép CORS (`@CrossOrigin`) để Next.js có thể gọi API. Việc bảo mật chủ yếu đẩy về phía Supabase JWT.

### 3. Database (Cơ sở dữ liệu)
- **Cốt lõi:** Supabase sử dụng PostgreSQL.
- **Bảng quan trọng:** `profiles` (lưu thông tin user), `direct_messages` (chat 1-1), `user_roles` (phân quyền).
- **Relations (Quan hệ):** Liên kết chặt chẽ bằng Khóa ngoại (Foreign Keys). Ví dụ: `direct_messages.sender_id` liên kết đến `profiles.id`.
- **RLS (Row Level Security):** Postgres khóa bảo mật ở mức độ Dòng. Các Policy quy định chặt chẽ: Ai được gọi câu lệnh SELECT, INSERT, UPDATE, DELETE cho từng bảng.
- **Realtime Subscriptions:** Database sử dụng extension `pg_realtime`. Khi có thao tác INSERT vào bảng (vd `direct_messages`), Postgres tự động bắn tín hiệu WebSocket lên thẳng trình duyệt Frontend mà không cần qua Server Node.js/Java trung gian.

---

## PHẦN 2 — ROLE SYSTEM (HỆ THỐNG PHÂN QUYỀN)

### 1. Quyền Admin (Administrator)
Admin (role_id = 1) là quản trị viên hệ thống.

#### 1.1. Xem thống kê (Analytics Dashboard)
- **Route URL:** `/dashboard`
- **File frontend:** `frontend/src/app/(dashboard)/dashboard/page.tsx`
- **API backend:** `backend/src/main/java/com/showcase/backend/controllers/AnalyticsController.java` (gọi `/api/analytics/metrics`)
- **Flow hoạt động:** Middleware Next.js kiểm tra `user_roles`. Nếu là Admin thì render giao diện, giao diện gọi API sang Spring Boot, Spring Boot query DB (với materialized views) rồi trả về dữ liệu.

#### 1.2. Xem toàn bộ Orders (RLS Demo)
- **Route URL:** `/rls-playground`
- **File frontend:** `frontend/src/app/(dashboard)/rls-playground/page.tsx`
- **RLS policy:** `"Users can view own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin())`. Vì mệnh đề `is_admin()` trả về TRUE, Admin thấy toàn bộ dữ liệu.

### 2. Quyền User (Người dùng tiêu chuẩn)
User (role_id = 3) là khách hàng hoặc nhân viên thường.

#### 2.1. Chat Realtime 1-1
- **Route URL:** `/chat`
- **File frontend:** `frontend/src/app/(dashboard)/chat/page.tsx`
- **Flow hoạt động:** Giao diện gọi bảng `profiles` để lấy list user (trừ bản thân). Khi chọn 1 user, nó query `direct_messages` và bật `supabase.channel()` lắng nghe dòng tin nhắn mới có mã người gửi/nhận trùng khớp.

#### 2.2. Tìm kiếm Ngữ nghĩa (AI Semantic Search)
- **Route URL:** `/ai-search`
- **File frontend:** `frontend/src/app/(dashboard)/ai-search/page.tsx`
- **Database Backend:** Hàm SQL `public.match_documents()` trong Postgres.
- **Flow hoạt động:** Biến đổi từ khóa truy vấn thành mảng Vector, dùng extension `pgvector` và thuật toán HNSW để quét toàn bộ dữ liệu văn bản và tính khoảng cách Cosine Similarity, trả về kết quả gần giống ngữ nghĩa nhất.

#### 2.3. Bị chặn Analytics (Bảo vệ Route)
- **File xử lý:** `frontend/src/lib/supabase/middleware.ts`
- **Flow hoạt động:** Nếu User truy cập `/dashboard`, Middleware sẽ chặn đứng ngay tại server Edge, thực thi lệnh HTTP Redirect 307 đẩy về `/dashboard/chat`. Tại thanh bên Sidebar, tính năng ẩn menu cũng dựa trên hàm `isAdmin`.

---

## PHẦN 3 — AUTHENTICATION FLOW (LUỒNG ĐĂNG NHẬP)

- **Login File:** `frontend/src/app/login/page.tsx`
- **Auth Provider:** Supabase Auth (GoTrue).
- **Storage Session:** Mật khẩu không bao giờ chạy qua code Backend. Frontend gửi thẳng email/password lên Supabase. Supabase trả về JWT Token và Next.js lưu vào Cookie trình duyệt (thông qua `@supabase/ssr`).

### Google Login (OAuth Flow)
- Nút "Sign in with Google" gọi hàm `supabase.auth.signInWithOAuth()`.
- Supabase mở trang cấp quyền của Google. Khi thành công, Google đẩy về URL Callback.
- **Callback file:** `frontend/src/app/auth/callback/route.ts`. File này nhận Authorization Code, đổi thành Session Token, lưu vào Cookie rồi Redirect vào Dashboard.

### Middleware / Guard
- **File:** `frontend/src/middleware.ts` (trỏ đến `lib/supabase/middleware.ts`).
- **Nhiệm vụ:** Bảo vệ mọi Route bắt đầu bằng `/dashboard`. Chưa đăng nhập -> đá về `/login`. Đăng nhập rồi nhưng vào nhầm trang Auth -> đá về `/dashboard`.

### Logout
- Hàm xử lý nằm trong `frontend/src/components/layout/sidebar.tsx` (Nút Logout). Gọi `supabase.auth.signOut()`, xóa Cookie và đẩy về trang đăng nhập. Hiện thông báo Toast "Logged out".

---

## PHẦN 4 — REALTIME SYSTEM

### 1. Chat Realtime (Trực tuyến)
- Hoạt động bằng WebSockets thông qua `pg_realtime`.
- Khi User A bấm gửi tin nhắn, Frontend bắn lệnh `INSERT INTO direct_messages`.
- Database ghi nhận dòng mới. Cấu hình Publication (`alter publication supabase_realtime add table public.direct_messages;`) sẽ đẩy báo hiệu dòng mới lên máy chủ Realtime.
- Máy chủ đẩy WebSocket về Client B. Hàm `.on('postgres_changes', ...)` trong `chat/page.tsx` của Client B chộp được payload mới và thêm vào giao diện (UI) mà không cần tải lại trang.

---

## PHẦN 5 — DATABASE DOCUMENTATION

| Bảng (Table) | Mục đích (Purpose) | Các cột quan trọng | Tính năng sử dụng |
| --- | --- | --- | --- |
| `profiles` | Lưu tên, hình đại diện của User khi đăng ký | `id` (PK, Auth UUID), `full_name` | Chat, Hiển thị tên |
| `user_roles` | Phân quyền bảo mật RBAC | `user_id` (FK), `role_id` (FK) | Middleware, Admin RLS |
| `direct_messages` | Lưu tin nhắn cá nhân 1-1 | `sender_id`, `receiver_id`, `content` | Realtime Chat |
| `products` / `orders` | Dữ liệu E-Commerce thử nghiệm | `price`, `stock`, `user_id`, `status` | RLS Playground |
| `system_metrics` | Đo lường hiệu năng máy chủ | `cpu_usage`, `memory_usage` | Analytics Dashboard |

- **Foreign Keys:** Mọi ID người dùng trong các bảng đều được trỏ Khóa ngoại về bảng `profiles(id)`, bảo đảm tính toàn vẹn.
- **Triggers:** `handle_new_user()` tự động được kích hoạt khi có một User đăng ký mới bên `auth.users`. Nó sẽ copy UUID sang bảng `profiles` và mặc định gán `role_id = 3` (User) vào `user_roles`.
- **Materialized Views:** `daily_sales_analytics` lưu trữ ảnh chụp tổng doanh thu theo ngày giúp load Dashboard siêu nhanh. Spring Boot sẽ gọi hàm Refresh để làm mới bảng này.

---

## PHẦN 6 — BẢN ĐỒ DỰ ÁN (FILE MAP)

```text
📦 Supabase-Ultimate-Showcase
┣ 📂 frontend
┃ ┣ 📂 src
┃ ┃ ┣ 📂 app
┃ ┃ ┃ ┣ 📂 (dashboard)      <-- Các trang yêu cầu Đăng nhập
┃ ┃ ┃ ┃ ┣ 📂 ai-search      <-- Demo Semantic Search
┃ ┃ ┃ ┃ ┣ 📂 chat           <-- Realtime Chat 1-1
┃ ┃ ┃ ┃ ┣ 📂 dashboard      <-- Analytics (Admin Only)
┃ ┃ ┃ ┃ ┗ 📂 rls-playground <-- Demo Bảo mật DB
┃ ┃ ┃ ┣ 📂 auth/callback    <-- Route xử lý Google Login
┃ ┃ ┃ ┗ 📂 login            <-- Giao diện đăng nhập
┃ ┃ ┣ 📂 components
┃ ┃ ┃ ┗ 📂 layout
┃ ┃ ┃   ┗ 📜 sidebar.tsx    <-- Chứa logic ẩn/hiện menu & Nút Logout
┃ ┃ ┗ 📂 lib
┃ ┃   ┗ 📂 supabase
┃ ┃     ┣ 📜 client.ts      <-- Supabase instance cho Browser
┃ ┃     ┣ 📜 server.ts      <-- Supabase instance cho Server (Next.js)
┃ ┃     ┗ 📜 middleware.ts  <-- Logic kiểm tra Role & JWT Token
┣ 📂 backend                <-- Spring Boot API (Analytics Data)
┣ 📂 docs                   <-- Kịch bản trình diễn & Báo cáo PDF/MD
┗ 📂 supabase
  ┣ 📂 migrations           <-- Cấu trúc các bảng CSDL & RLS (Trái tim dự án)
  ┗ 📜 seed.sql             <-- Script tạo sẵn User, Role, Data mẫu
```

---

## PHẦN 7 — HƯỚNG DẪN DEBUG (GỠ LỖI)

Nếu dự án gặp trục trặc, hãy làm theo các bước kiểm tra sau:

1. **Lỗi Login (Site cannot be reached hoặc 404 Callback):**
   - Kiểm tra file `.env` đã có đúng `NEXT_PUBLIC_SUPABASE_URL` chưa.
   - Kiểm tra `app/auth/callback/route.ts` có trả về code `200` ở màn hình Console Network không. Nếu dùng Google Login, chắc chắn bạn đã cấu hình Redirect URI trên Google Cloud Console là `http://localhost:3000/auth/callback`.

2. **Lỗi Realtime Chat không nhảy tin nhắn mới:**
   - Mở Terminal chạy lệnh: `npx supabase status`. Đảm bảo service `supabase_realtime` đang có chữ `running`.
   - Vào DB kiểm tra xem lệnh `alter publication supabase_realtime add table public.direct_messages;` đã chạy thành công chưa.

3. **Lỗi RLS (Bị cấm thao tác Database dù là Admin):**
   - Đảm bảo tài khoản đăng nhập có đúng `role_id = 1` trong bảng `user_roles`.
   - Lỗi `403 Forbidden` thường do sai logic trong câu lệnh `create policy` bên thư mục `supabase/migrations`.

4. **Lỗi Database "Bảng không tồn tại" hoặc Dữ liệu rác:**
   - Supabase bị kẹt cache. Hãy đóng tất cả Terminal và chạy lệnh Reset tối thượng: `npx supabase db reset`. Lệnh này sẽ xóa sạch DB, đọc lại toàn bộ code SQL và nạp lại từ đầu.

---

## PHẦN 8 — DEMO GUIDE

Vui lòng tham khảo kịch bản thuyết trình chi tiết từng bước được lưu trong file `docs/demo-script.md`.
File đó đã vạch sẵn những gì cần nói, tab ẩn danh nào cần mở, và làm thế nào để "khoe" được các chức năng xịn xò với giáo viên.
