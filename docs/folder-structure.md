# Cấu trúc thư mục dự án

Ứng dụng này được chia thành 3 trụ cột chính: Frontend (Giao diện), Backend (API Xử lý), và Database (Cơ sở dữ liệu).

```text
Supabase-Ultimate-Showcase/
├── docs/                      # Tài liệu hướng dẫn dự án
├── supabase/                  # Cấu hình Supabase & Trạng thái CSDL
│   ├── migrations/            # Các kịch bản SQL (Tạo Bảng, Hàm, Trigger, RLS)
│   ├── seed.sql               # Dữ liệu mẫu tự động thêm vào khi khởi chạy CSDL
│   └── config.toml            # File cấu hình của Supabase CLI
├── backend/                   # Backend Enterprise bằng Spring Boot (Java)
│   ├── src/main/java/com/showcase/backend/
│   │   ├── controllers/       # Định nghĩa các REST APIs (vd: Phân tích số liệu)
│   │   ├── services/          # Xử lý logic nghiệp vụ phức tạp
│   │   ├── repositories/      # Các kho lưu trữ Spring Data JPA
│   │   ├── entities/          # Các mô hình thực thể (Models) ánh xạ với bảng CSDL
│   │   └── config/            # Cấu hình bảo mật & phân quyền (CORS/Security)
│   └── pom.xml                # Quản lý thư viện Maven
├── frontend/                  # Giao diện người dùng bằng Next.js
│   ├── src/
│   │   ├── app/               # Hệ thống định tuyến Next.js App Router (Các trang Web)
│   │   ├── components/        # Các thành phần React dùng chung (shadcn/ui, Layout)
│   │   ├── lib/               # Các hàm tiện ích (Khởi tạo kết nối Supabase, helpers)
│   │   └── styles/            # CSS toàn cục và các chỉ thị Tailwind
│   ├── package.json           # Quản lý thư viện Node.js
│   └── tailwind.config.ts     # Cấu hình giao diện Tailwind CSS
└── docker/                    # (Tùy chọn) Docker Compose dành cho môi trường Backend
```
