# Cài đặt & Khởi chạy dự án

Hướng dẫn này giải thích chi tiết cách khởi chạy **Supabase Ultimate Showcase** trên máy tính cá nhân của bạn.

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18+ (LTS)
- **Java**: Phiên bản JDK 17 hoặc 21+
- **Docker & Docker Desktop**: Bắt buộc phải cài đặt và đang mở chạy ngầm.
- **Supabase CLI**: Công cụ dòng lệnh (chạy `npx supabase@2.98.2 start` trực tiếp).
- **Maven**: (Không bắt buộc cài đặt vì dự án đã có sẵn `mvnw`).

## 1. Khởi động Supabase (CSDL Local)

Mở một cửa sổ Terminal (PowerShell) tại thư mục gốc `Supabase-Ultimate-Showcase`.

```bash
# Khởi động toàn bộ dịch vụ Supabase ở máy tính của bạn
npx supabase@2.98.2 start
```
Lệnh này sẽ tải về và chạy các container Docker bao gồm: PostgreSQL, GoTrue (Đăng nhập), Storage, Realtime và pgvector.
Sau khi chạy xong, nó sẽ in ra một bảng màu xanh lá chứa thông tin (API URL, `anon` key, DB URL, Studio URL).

## 2. Cấu hình biến môi trường

### Frontend (`frontend/.env.local`)
Tạo file `frontend/.env.local` (nếu chưa có) và thêm 2 dòng sau:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<lấy_chuỗi_anon_key_trên_màn_hình_terminal_dán_vào_đây>
```

*(Lưu ý: Nếu bạn muốn test chức năng Đăng nhập bằng Google, hãy tạo file `.env` ở thư mục gốc và cung cấp `GOOGLE_CLIENT_ID` và `GOOGLE_SECRET`)*.

### Backend (`backend/src/main/resources/application.yml`)
Backend cần kết nối thẳng vào Database. Mật khẩu mặc định của Supabase Local luôn là `postgres`.
Cấu hình đã được tự động thiết lập sẵn trong `application.yml` như sau:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://127.0.0.1:54322/postgres
    username: postgres
    password: postgres
```

## 3. Khởi chạy Backend (Java)

Mở thêm một tab Terminal mới, trỏ vào thư mục `backend`:
```bash
cd backend
./mvnw clean spring-boot:run
```
Đợi một lát, Backend API sẽ chạy ở cổng `http://localhost:8081`.

## 4. Khởi chạy Frontend (Next.js)

Mở thêm một tab Terminal mới, trỏ vào thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Giao diện người dùng sẽ chạy ở `http://localhost:3000`.

## 5. Khám phá Supabase Studio Local
Truy cập vào trang quản trị CSDL Supabase (Studio) tại `http://localhost:54323` để xem trực tiếp các bảng dữ liệu, test lệnh SQL, cấu hình RLS và xem files đã tải lên Storage.
