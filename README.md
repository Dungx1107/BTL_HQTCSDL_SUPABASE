# 🚀 Supabase Ultimate Showcase

Đây là một dự án **Fullstack hoàn chỉnh** được thiết kế đặc biệt cho mục đích làm **Đồ án môn Hệ Quản Trị Cơ Sở Dữ Liệu (HQTCSDL)**. Dự án nhằm trình diễn toàn bộ những tính năng ưu việt, mạnh mẽ và hiện đại nhất của hệ quản trị cơ sở dữ liệu **PostgreSQL** kết hợp với hệ sinh thái **Supabase**.

---

## 🎯 Mục Tiêu Dự Án
- Trực quan hóa các khái niệm CSDL phức tạp (Triggers, Functions, RLS, Indexes, Materialized Views).
- Trình diễn sức mạnh Realtime và Vector database (AI) ngay tại tầng Database.
- Tích hợp một kiến trúc chuẩn Enterprise với **Next.js** (Frontend) và **Java Spring Boot** (Backend xử lý nghiệp vụ phức tạp).
- Cung cấp một ứng dụng có tính thẩm mỹ cực cao (Giao diện Dark Mode, Animation mượt mà) để tạo hiệu ứng "Wow" khi quay video demo.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router), React, TypeScript.
- **Styling:** Tailwind CSS v4, Lucide Icons, UI Glassmorphism.
- **Charts:** Recharts (Dành cho Dashboard).
- **Client:** `@supabase/supabase-js` và `@supabase/ssr` để quản lý Session và Realtime WebSocket.

### Backend (Tích hợp Enterprise)
- **Framework:** Java 21, Spring Boot 3.3.x.
- **Database Access:** Spring Data JPA (Hibernate).
- **Mục đích:** Xử lý các phép toán Aggregation nặng, Transaction an toàn, và mở rộng API phân tích (Analytics API).

### Database & Platform
- **Core:** PostgreSQL (Thông qua Supabase Local Stack).
- **Tính năng mở rộng:** `pgvector` (Vector Search), `pg_realtime` (WebSockets), `pg_stat_statements`.

---

## 🔥 Các Tính Năng Đã Demo (Showcase Features)

1. **🔒 Row Level Security (RLS) Playground:**
   - Phân quyền bảo mật ở **tầng cơ sở dữ liệu** thay vì API.
   - Demo: Admin nhìn thấy tất cả hóa đơn (`orders`), User chỉ nhìn thấy hóa đơn của chính mình. Kẻ gian không thể `DELETE` bằng công cụ ngoài nếu không có quyền.

2. **💬 Realtime Chat & Presence:**
   - Hoạt động nhờ cơ chế `postgres_changes`. Bất kỳ khi nào có dòng dữ liệu mới (`INSERT`) vào bảng `messages`, CSDL sẽ push sự kiện qua WebSocket để Frontend cập nhật ngay lập tức mà không cần F5.

3. **📊 Analytics Dashboard (Triggers & Views):**
   - Biểu đồ Dashboard cập nhật tự động.
   - Sử dụng `Materialized Views` để tối ưu hóa việc đọc dữ liệu phân tích nặng và kết hợp hàm `REFRESH CONCURRENTLY`.

4. **🧠 AI Semantic Search (pgvector):**
   - Demo tính năng lưu trữ Vector trong bảng `documents`.
   - Tìm kiếm ngữ nghĩa bằng thuật toán KNN/HNSW Index (Tìm kiếm bằng ý nghĩa thay vì khớp chính xác từ khóa).

5. **📁 Storage Manager:**
   - Quản lý File tĩnh (Tải lên ảnh/tài liệu).
   - Truy xuất Public/Signed URLs với RLS Policies áp dụng trực tiếp lên bucket.

6. **⚡ Performance Benchmark:**
   - Thử nghiệm độ trễ (Latency) API.
   - Minh họa cách CSDL xử lý các truy vấn JOIN phức tạp.

---

## ⚙️ Hướng Dẫn Cài Đặt Và Khởi Chạy (Local)

### Yêu cầu tiên quyết:
- Cài đặt **Node.js** (LTS).
- Cài đặt **Java JDK 21**.
- Cài đặt **Docker Desktop** (Phải đang chạy).
- Cài đặt **Supabase CLI** (`npm install -g supabase`).

### Bước 1: Khởi động Database (Supabase Local)
Mở terminal tại thư mục gốc `Supabase-Ultimate-Showcase`:
```bash
npx supabase start
```
*Lệnh này sẽ tải các Docker container cần thiết và thiết lập Database cùng các dữ liệu mẫu (Seed Data).*
*Lưu lại thông tin `API URL` và `anon key` xuất ra trên màn hình.*

### Bước 2: Khởi động Frontend
Cập nhật biến môi trường `.env.local` ở thư mục `frontend` bằng các Key có được từ Bước 1. Sau đó chạy:
```bash
cd frontend
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

### Bước 3: Khởi động Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
API sẽ chạy tại `http://localhost:8080`.

*(Hoặc đơn giản nhất, nếu môi trường hỗ trợ `make`, chỉ cần gõ lệnh `make setup` và `make start` ở thư mục gốc).*

---

## 📂 Kiến Trúc Thư Mục
- `/docs`: Tài liệu giải thích, kịch bản quay video demo.
- `/supabase/migrations`: Các kịch bản SQL (Tạo bảng, Trigger, Function, RLS).
- `/supabase/seed.sql`: Chèn dữ liệu mẫu 20+ bảng.
- `/frontend`: Mã nguồn giao diện người dùng.
- `/backend`: Mã nguồn xử lý nghiệp vụ Java.

**Sản phẩm được tối ưu để chinh phục giảng viên. Chúc bạn đạt điểm A+!** 🎓
