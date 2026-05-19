# Hướng Dẫn Cài Đặt Chi Tiết (Installation Guide)

Để khởi chạy dự án **Supabase Ultimate Showcase** hoàn chỉnh trên máy tính của bạn, bạn cần thiết lập 2 phần chính: Môi trường trên máy tính (Local Environment) và Môi trường Supabase.

---

## PHẦN 1: CÁC PHẦN MỀM CẦN CÀI ĐẶT TRÊN MÁY TÍNH

Vì đây là dự án Fullstack hạng nặng, bạn phải chắc chắn máy tính đã cài đặt các công cụ sau:

### 1. Docker Desktop (Bắt buộc)
Supabase Local chạy toàn bộ các dịch vụ của nó (PostgreSQL, Realtime, Storage, GoTrue Auth) bên trong Docker containers.
- **Tải về:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Kiểm tra:** Mở ứng dụng Docker Desktop lên và đảm bảo nó đang ở trạng thái **Running** (biểu tượng cá voi xanh ở thanh taskbar hoặc góc màn hình).

### 2. Node.js & npm (Bắt buộc)
Dùng để chạy Frontend (Next.js) và Supabase CLI.
- **Tải về:** [Node.js (Bản LTS)](https://nodejs.org/)
- **Kiểm tra:** Mở terminal gõ `node -v` và `npm -v`.

### 3. Supabase CLI (Bắt buộc)
Đây là công cụ dòng lệnh để giao tiếp với Supabase.
- **Cài đặt:** Mở terminal (CMD hoặc PowerShell chạy với quyền Admin) và gõ:
  ```bash
  npm install -g supabase
  ```
- **Kiểm tra:** Gõ `supabase -v`.

### 4. Java JDK 21 (Bắt buộc cho Backend)
Vì Backend viết bằng Spring Boot 3.3.x và Java 21, bạn cần JDK 21.
- **Tải về:** [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21) hoặc [Eclipse Temurin JDK 21](https://adoptium.net/).
- **Kiểm tra:** Gõ `java -version` và `javac -version` trong terminal.

---

## PHẦN 2: THIẾT LẬP SUPABASE & KHỞI CHẠY DỰ ÁN

Điểm đặc biệt của dự án này là **bạn không cần phải lên trang web supabase.com để tạo dự án!** Mọi thứ đã được tôi code sẵn trong các file cấu hình và migration, nó sẽ tự động chạy 100% trên máy (Local) của bạn.

### Bước 1: Khởi động Supabase Local
1. Mở PowerShell hoặc Terminal.
2. Di chuyển vào thư mục gốc của dự án:
   ```powershell
   cd c:\btl\year3-semester1\HQTCSDL\Supabase\Supabase-Ultimate-Showcase
   ```
3. Chạy lệnh khởi động Supabase:
   ```powershell
   npx supabase start
   ```
   > ⏳ *Lưu ý: Lần đầu tiên chạy lệnh này sẽ mất khoảng 5-10 phút vì Docker phải tải các images của PostgreSQL, Realtime, v.v. về máy.*

4. Sau khi hoàn tất, terminal sẽ in ra một bảng xanh lá cây chứa các thông tin cực kỳ quan trọng:
   - **API URL:** `http://127.0.0.1:54321`
   - **anon key:** `eyJhb... (một chuỗi rất dài)`
   - **Studio URL:** `http://127.0.0.1:54323`

### Bước 2: Thiết lập Biến Môi Trường (Mấu chốt)
Ứng dụng Frontend (Next.js) cần biết địa chỉ của Supabase Local.
1. Mở thư mục `frontend/`.
2. Tạo một file mới tên là `.env.local` (nếu chưa có).
3. Dán 2 thông tin bạn vừa nhận được ở trên vào file này:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=chuỗi_anon_key_dài_ngoằng_của_bạn_copy_vào_đây
   ```

### Bước 3: Áp dụng Cơ Sở Dữ Liệu (Migrations & Seed)
Vì tôi đã viết toàn bộ code tạo bảng, Role, RLS, và Triggers trong thư mục `supabase/migrations`, bạn chỉ cần chạy 1 lệnh để ép tất cả các thiết kế đó vào CSDL:
```powershell
npx supabase db reset
```
*Lệnh này sẽ tạo tất cả các bảng (orders, products, messages...) và tự động chèn dữ liệu mẫu (Seed Data) mà tôi đã chuẩn bị sẵn để bạn có biểu đồ hiển thị.*

### Bước 4: Khởi động giao diện (Frontend)
1. Mở một Tab Terminal mới (giữ Tab Supabase vẫn chạy).
2. Trỏ vào thư mục frontend và chạy lệnh cài đặt:
   ```powershell
   cd frontend
   npm install
   ```
3. Chạy Server Giao Diện:
   ```powershell
   npm run dev
   ```
4. Mở trình duyệt truy cập: **`http://localhost:3000`**

### Bước 5: Khởi động Backend (Spring Boot - Tùy chọn)
Nếu bạn muốn biểu đồ Benchmark và Analytics hoạt động hoàn hảo 100% (gọi qua Spring Boot thay vì gọi trực tiếp lên Supabase), hãy bật Backend:
1. Mở một Tab Terminal thứ 3.
2. Trỏ vào thư mục backend và chạy:
   ```powershell
   cd backend
   ./mvnw spring-boot:run
   ```
*Backend sẽ chạy ở `http://localhost:8080`. Frontend đã được tôi code sẵn để tự động kết nối.*

---

## 💡 CÁCH SỬ DỤNG STUDIO CỦA SUPABASE
Để chứng minh cho thầy giáo thấy hệ thống chạy trên PostgreSQL thật, bạn hãy mở trình duyệt và truy cập vào đường dẫn:
**`http://localhost:54323`**

Đây là bảng điều khiển (Dashboard) chính thức của Supabase dành cho Local. Tại đây bạn có thể:
- Click vào **Table Editor** để xem 12+ bảng dữ liệu tôi đã tạo.
- Click vào **SQL Editor** để chạy thử câu lệnh `EXPLAIN ANALYZE`.
- Click vào **Storage** để thấy bucket `public-files` chứa các file bạn tải lên từ trang Web.
- Click vào **Authentication** để xem danh sách tài khoản người dùng đã đăng ký.
