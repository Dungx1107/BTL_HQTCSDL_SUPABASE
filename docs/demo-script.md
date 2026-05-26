# Kịch bản Trình diễn (Demo Script)

Tài liệu này cung cấp hướng dẫn từng bước để bạn có thể thuyết trình hoặc quay video báo cáo môn **Hệ Quản Trị CSDL** một cách ấn tượng nhất. Toàn bộ kịch bản đã được tinh chỉnh để làm nổi bật hệ thống bảo mật phân quyền (RBAC) và chức năng Realtime 1-1.

---

## Chuẩn bị: Danh sách Tài khoản Demo
Trong suốt buổi trình diễn, hãy sử dụng 2 tài khoản sau để minh họa sự khác biệt về phân quyền:
- **Tài khoản Admin:** `admin@example.com` (Mật khẩu: `admin123`)
- **Tài khoản User 1:** `user1@example.com` (Mật khẩu: `123456`)

*(Lưu ý: Bạn nên mở 2 trình duyệt, một cái bình thường và một cái Ẩn danh (Incognito) để đăng nhập song song 2 tài khoản này)*.

---

## Bước 1: Trình diễn Middleware Bảo mật & Analytics (Điểm nhấn WOW)
1. **Bên cửa sổ Admin:** Đăng nhập bằng `admin@example.com`. Nhấp vào mục **Analytics Dashboard**. Chỉ cho thầy giáo thấy giao diện thống kê chi tiết.
2. **Bên cửa sổ User:** Đăng nhập bằng `user1@example.com`. Cố tình gõ trực tiếp URL `http://localhost:3000/dashboard` vào thanh địa chỉ.
3. **Kết quả:** Trình duyệt của User ngay lập tức bị "đá" (redirect) văng sang trang Chat, và hoàn toàn không thể truy cập Analytics.
4. **Điểm nhấn cần nói**: Khoe ngay hệ thống sử dụng **Next.js Edge Middleware kết hợp @supabase/ssr** để kiểm tra JWT Role ngay từ tầng Server trước cả khi trang web được tải, bảo mật tuyệt đối 100%.

## Bước 2: Nhắn tin trực tuyến riêng tư (Realtime Chat 1-1)
1. Mở tab **Chat** ở cả 2 cửa sổ trình duyệt (Admin và User 1).
2. Ở cửa sổ Admin, chọn tên "Demo User 1" từ danh sách bên trái. Ở cửa sổ User 1, chọn "System Admin".
3. Gõ và gửi tin nhắn qua lại giữa 2 tài khoản. Chú ý tính năng nhận diện "You" (Tin của mình màu xanh) và tên người kia (Màu trắng).
4. **Điểm nhấn cần nói**: Thay vì làm Chat Room chung chung, chúng ta làm **Direct Message (1-1)** phức tạp hơn rất nhiều. Giải thích cách Supabase xử lý WebSockets trực tiếp từ tầng CSDL thông qua extension `pg_realtime`, độ trễ cực thấp `< 50ms`.

## Bước 3: Trình diễn Bảo mật CSDL Dữ liệu (RLS Playground)
1. Truy cập vào trang **RLS Playground**. Bảng dữ liệu `Orders` sẽ hiện ra.
2. Ở cửa sổ `admin`, chứng minh rằng tài khoản admin có thể nhìn thấy *toàn bộ* đơn hàng của mọi người.
3. Ở cửa sổ `user`, chứng minh rằng người dùng này *chỉ có thể nhìn thấy* những đơn hàng do chính họ tạo ra.
4. Thử bấm nút `Xóa` hoặc `Sửa` một đơn hàng không thuộc quyền sở hữu, sẽ có thanh thông báo Toast màu đỏ báo lỗi từ chối.
5. **Điểm nhấn cần nói**: Nhấn mạnh đây là Row Level Security (RLS). Bảo mật được thiết lập ở tận tầng Database (CSDL), chứ không chỉ nằm ở tầng API như các dự án thông thường. Dù hacker có bypass qua API thì cũng bị Database khóa mõm.

## Bước 4: Khẳng định sức mạnh công nghệ với AI Semantic Search (pgvector)
*(Đây là phần "wow" nhất để ghi điểm tuyệt đối với thầy giáo).*

1. **Chuẩn bị:** Chuyển sang trang **AI Search** trên giao diện.
2. **Kịch bản nói (Gợi ý):** 
   > *"Thưa thầy, thông thường các hệ thống tìm kiếm dùng câu lệnh SQL `LIKE %...%` chỉ tìm được khi khớp đúng từng chữ cái. Nhưng hệ thống của nhóm em tích hợp AI và không gian Vector để hiểu được **ý nghĩa** của từ ngữ giống như con người."*
3. **Demo 1 (Tìm kiếm không trùng chữ nhưng cùng ngữ nghĩa):**
   - Gõ cụm từ: `"máy tính nhanh"` hoặc `"code mượt"`.
   - Kết quả: Hệ thống tự động phân tích và trả về **Laptop Pro** (Mặc dù trong mô tả sản phẩm không hề có chữ "máy tính nhanh" hay "code mượt").
4. **Demo 2 (Sức mạnh của mô hình đa ngôn ngữ / từ đồng nghĩa):**
   - Gõ cụm từ: `"màn hình bự"` hoặc `"big display"`.
   - Kết quả: Trả về **4K Monitor** với độ tương đồng (Similarity) cao.
5. **Demo 3 (Trải nghiệm làm việc/giải trí):**
   - Gõ cụm từ: `"gõ êm tay"` hoặc `"tập trung làm việc"`.
   - Kết quả: AI tự hiểu "gõ êm tay" thì cần **Mechanical Keyboard** (Bàn phím cơ), "tập trung" thì cần **Noise Cancelling Headphones** (Tai nghe chống ồn).
6. **Điểm nhấn chốt hạ (Kỹ thuật):** 
    - Giải thích cho thầy: *"Dữ liệu văn bản được gửi sang máy chủ AI cục bộ LM Studio chạy mô hình Nomic Embed v1.5 để biến đổi thành một mảng 768 chiều (Vector) có gắn tiền tố 'search_query: '. Sau đó, CSDL PostgreSQL sử dụng thuật toán siêu tốc HNSW của extension `pgvector` để quét và tính khoảng cách Cosine Similarity. Việc này giúp hệ thống tìm kiếm thông minh vượt trội, hỗ trợ ngữ nghĩa tiếng Việt tốt hơn rất nhiều và hoàn toàn bảo mật ngay trên hệ thống của mình!"*
## Bước 5: Hiệu năng & Đo kiểm (Benchmarking)
1. Mở trang **Benchmark**.
2. Chạy một truy vấn phức tạp (ví dụ: tổng hợp 10,000 bản ghi JSONB).
3. Hiển thị kết quả của lệnh `EXPLAIN ANALYZE` thô trực tiếp trên màn hình UI.
4. Cho thấy sự khác biệt về thời gian thực thi (Execution time) giữa việc truy vấn có Index và không có Index.
5. **Điểm nhấn cần nói**: Supabase thực chất vẫn là PostgreSQL nguyên bản. Chúng ta hoàn toàn có quyền truy cập vào các công cụ tinh chỉnh hiệu năng thô (raw performance tuning) mạnh mẽ nhất.

## Kết luận & Logout
- Bấm nút **Logout** góc dưới bên trái để chứng minh tính năng xóa Session Cookie hoạt động trơn tru.
- Lướt nhanh qua cấu trúc code (chia rõ Next.js Middleware ở Frontend và Spring Boot API ở Backend) nhằm chứng minh đây là một dự án **Enterprise Fullstack** đích thực.
