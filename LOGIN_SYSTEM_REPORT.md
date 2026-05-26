# BÁO CÁO HỆ THỐNG ĐĂNG NHẬP VÀ PHÂN QUYỀN ĐIỀU HƯỚNG DỰ ÁN
*Tài liệu hướng dẫn kỹ thuật - Hệ thống xác thực Supabase SSR & Next.js App Router*

---

## 📂 1. DANH SÁCH CÁC FILE ĐƯỢC CHỈNH SỬA & ĐƯỜNG DẪN CHI TIẾT

Trong hệ thống xác thực và điều hướng của dự án, các file quan trọng nhất nằm tại các đường dẫn sau:

1. **File Middleware chính (Xử lý chặn route và điều hướng phân quyền):**
   * **Đường dẫn:** `frontend/src/lib/supabase/middleware.ts` (Đường dẫn tuyệt đối: [middleware.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/lib/supabase/middleware.ts))
   * **Nhiệm vụ:** Lớp bảo vệ trung gian (Middleware) kiểm tra phiên đăng nhập (`session`), phân biệt vai trò Admin và Người dùng thông thường từ bảng `user_roles` ở Database để điều hướng về đúng trang tương ứng.

2. **File API Callback (Nhận phản hồi từ Google OAuth):**
   * **Đường dẫn:** `frontend/src/app/auth/callback/route.ts` (Đường dẫn tuyệt đối: [route.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/app/auth/callback/route.ts))
   * **Nhiệm vụ:** Nhận token từ Google sau khi đăng nhập thành công, tạo phiên làm việc phía Server (`exchangeCodeForSession`), lưu Cookie và chuyển hướng người dùng về `/dashboard` để Middleware phân loại.

---

## ⚙️ 2. PHÂN TÍCH LOGIC ĐIỀU HƯỚNG MỚI ĐÃ ĐƯỢC CẬP NHẬT

### 🚀 Nguyên tắc Phân quyền (RBAC) & Điều hướng:
* **Admin duy nhất:** Tài khoản `admin@example.com` (có `role_id = 1` trong bảng `public.user_roles`).
* **Người dùng thông thường:** 
  * 3 tài khoản mặc định đăng nhập bằng email/mật khẩu (`user1@example.com`, `user2@example.com`, `user3@example.com`).
  * Tất cả các tài khoản đăng nhập bằng **Google OAuth** hoặc đăng ký mới khác (tự động gắn `role_id = 3` nhờ Trigger database `public.handle_new_user()`).

### 🗺️ Quy trình điều hướng sau khi Đăng nhập:
```
[Người dùng click Đăng nhập] 
          │
          ▼ (Google OAuth / Mật khẩu)
[Đăng nhập thành công?]
          │
          ▼ (Thành công)
[Điều hướng tạm thời về /dashboard]
          │
          ▼
[Next.js Middleware đánh chặn]
          │
          ▼
[Kiểm tra role_id của User?]
   ├─── (role_id = 1 Admin) ───► [Cho phép xem Bảng điều khiển /dashboard]
   └─── (role_id != 1 User) ──► [Điều hướng về RLS Playground /rls-playground]
```

---

## 🛠️ 3. NỘI DUNG CHI TIẾT ĐÃ THAY ĐỔI TRONG FILE MIDDLEWARE
Tại file [middleware.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/lib/supabase/middleware.ts), logic đã được chuẩn hóa lại toàn bộ như sau:

```typescript
// 1. Định nghĩa tất cả các Router cần được bảo vệ (Bắt buộc đăng nhập mới được xem)
const protectedRoutes = ['/dashboard', '/chat', '/rls-playground', '/ai-search', '/storage', '/benchmark']
const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')

// 2. Chặn nếu chưa đăng nhập mà cố tình truy cập trang bảo mật
if (isProtectedRoute && !user) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

// 3. Nếu đã đăng nhập mà truy cập trang /login hoặc /auth thì tự động đẩy về hệ thống chính
if (isAuthRoute && user) {
  const url = request.nextUrl.clone()
  url.pathname = '/dashboard'
  return NextResponse.redirect(url)
}

// 4. KIỂM TRA QUYỀN TRUY CẬP (RBAC) TẠI ĐIỂM ĐÓN /dashboard
if (user && request.nextUrl.pathname === '/dashboard') {
  // Lấy role_id từ database
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', user.id)
    .single()

  const isAdmin = roleData?.role_id === 1 // Chỉ role_id = 1 mới là Admin

  if (!isAdmin) {
    // Nếu là Người dùng thông thường (bao gồm Google OAuth) -> Đẩy về trang Database (RLS Playground)
    const url = request.nextUrl.clone()
    url.pathname = '/rls-playground' // 🌟 Giải quyết lỗi 404 cũ (bỏ segment /dashboard/)
    return NextResponse.redirect(url)
  }
}
```

---

## 📝 4. DANH SÁCH TÀI KHOẢN DÙNG ĐỂ KIỂM THỬ (TEST ACCOUNTS)

Dữ liệu seed trong database local của bạn cấu hình sẵn các tài khoản sau để bạn test:

| Loại tài khoản | Email | Mật khẩu | Điểm hạ cánh sau khi đăng nhập | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Admin duy nhất** | `admin@example.com` | `admin123` | `/dashboard` (Bảng điều khiển Analytics) | Toàn quyền, thấy menu Analytics |
| **Demo User 1** | `user1@example.com` | `123456` | `/rls-playground` (Chỗ database) | Người dùng thường, ẩn menu Analytics |
| **Demo User 2** | `user2@example.com` | `123456` | `/rls-playground` (Chỗ database) | Người dùng thường, ẩn menu Analytics |
| **Demo User 3** | `user3@example.com` | `123456` | `/rls-playground` (Chỗ database) | Người dùng thường, ẩn menu Analytics |
| **Google OAuth** | *Tài khoản Gmail của bạn* | *Xác thực Google* | `/rls-playground` (Chỗ database) | Người dùng thường, ẩn menu Analytics |

---

## 🔍 5. TẠI SAO ĐĂNG NHẬP GOOGLE LẠI BỊ 404 TRƯỚC ĐÓ?
* **Lỗi đường dẫn:** Route nhóm `(dashboard)` trong Next.js không tạo tiền tố. Trang chat nằm ở `/chat`, trang RLS nằm ở `/rls-playground`. Code cũ điều hướng về `/dashboard/chat` khiến Next.js trả về trang **404**.
* **Khắc phục:** Đã cấu hình Middleware đẩy người dùng thông thường về đúng `/rls-playground` và Admin về đúng `/dashboard`. Tất cả các route được bảo vệ chặt chẽ và không còn bị lặp vô hạn.

---

## 🌟 6. TÍNH NĂNG XEM THÔNG TIN CÁ NHÂN TƯƠNG TÁC (PROFILE MODAL)
Để tăng tính thuyết phục của đồ án và cung cấp đầy đủ các tính năng nâng cao, tôi đã tích hợp thêm **Hệ thống xem thông tin chi tiết người dùng dưới dạng Modal tương tác (Popup)** ở thanh Sidebar bên trái:

### 📍 Đường dẫn file giao diện:
* **Đường dẫn:** `frontend/src/components/layout/sidebar.tsx` (Đường dẫn tuyệt đối: [sidebar.tsx](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/components/layout/sidebar.tsx))

### 🎯 Cơ chế hoạt động của tính năng:
1. **Hiển thị Avatar & Tên động:** 
   * Nếu người dùng đăng nhập bằng **Google OAuth**, hệ thống sẽ tự động trích xuất ảnh đại diện (`avatar_url` / `picture`) từ Google của họ và hiển thị dạng ảnh tròn chuyên nghiệp kèm theo Tên hiển thị đầy đủ của họ ở góc dưới thanh Sidebar.
   * Nếu là tài khoản Email thông thường, hệ thống hiển thị icon cá nhân mặc định.
2. **Kích hoạt Modal chi tiết:** 
   * Vùng hiển thị thông tin cá nhân ở Sidebar đã được cấu hình thành nút bấm tương tác (`cursor-pointer hover:bg-zinc-200/80`). 
   * Khi người dùng nhấp chọn, một **Modal (Popup) chi tiết** thiết kế theo chuẩn Glassmorphism tuyệt đẹp sẽ hiển thị.
3. **Các thông số kỹ thuật được trình bày trong Modal (Cực kỳ ghi điểm với giảng viên):**
   * **Avatar phóng lớn & Họ tên.**
   * **Badge Phân quyền:** Đánh dấu bằng màu sắc nổi bật (`Administrator` màu đỏ/cam, `Standard User` màu xanh lục).
   * **Địa chỉ Email** của tài khoản.
   * **Phương thức đăng nhập:** Trực quan hóa rõ ràng xem tài khoản này đăng nhập bằng `Google OAuth` hay `Email & Password` (Lấy trực tiếp từ metadata nhà cung cấp).
   * **Mã định danh (User ID):** Trích xuất UUID duy nhất của tài khoản từ Supabase Auth, hỗ trợ nút **Sao chép nhanh (Copy to Clipboard)** có hiệu ứng phản hồi trực quan. Đây là điểm cộng lớn thể hiện tính ứng dụng cơ sở dữ liệu thực tế.
   * **Lần đăng nhập gần nhất:** Format thời gian Việt Nam (`dd/mm/yyyy hh:mm:ss`) trực quan.

