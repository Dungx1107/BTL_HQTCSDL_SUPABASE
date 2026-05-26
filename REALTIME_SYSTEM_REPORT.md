# BÁO CÁO HỆ THỐNG REALTIME CHAT (TẬP TIN ĐỒ ÁN)
*Tài liệu hướng dẫn kỹ thuật - Cơ chế PostgreSQL Realtime & WebSockets qua Supabase*

---

## 📂 1. DANH SÁCH CÁC FILE LIÊN QUAN & ĐƯỜNG DẪN CHI TIẾT

Trong tính năng Realtime Chat 1-1, mã nguồn được chia làm 2 lớp chính:

1. **File Cấu hình Cơ sở dữ liệu (Database Schema, RLS & Realtime Publication):**
   * **Đường dẫn:** `supabase/migrations/20240101000002_demo_accounts_and_chat.sql` (Đường dẫn tuyệt đối: [20240101000002_demo_accounts_and_chat.sql](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/supabase/migrations/20240101000002_demo_accounts_and_chat.sql))
   * **Nhiệm vụ:** Tạo bảng tin nhắn, thiết lập bảo mật Row Level Security (RLS) để chỉ người gửi/người nhận mới được xem, và đăng ký bảng vào ấn phẩm `supabase_realtime` để phát sự kiện.

2. **File Giao diện người dùng (React Client-Side Realtime Subscription):**
   * **Đường dẫn:** `frontend/src/app/(dashboard)/chat/page.tsx` (Đường dẫn tuyệt đối: [page.tsx](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/app/%28dashboard%29/chat/page.tsx))
   * **Nhiệm vụ:** Kết nối WebSocket tới Supabase, đăng ký lắng nghe sự kiện `INSERT` trên bảng tin nhắn trong thời gian thực, cập nhật giao diện ngay lập tức mà không cần F5.

---

## ⚙️ 2. CƠ CHẾ HOẠT ĐỘNG CỦA HỆ THỐNG REALTIME

Hệ thống Realtime hoạt động dựa trên sự kết hợp giữa **PostgreSQL Replication** và **WebSockets**:

```
 [Người dùng A] ──► (Gửi tin nhắn) ──► [Bảng database: direct_messages]
                                                   │
                                                   ▼ (Gây ra sự kiện INSERT)
 [Người dùng B] ◄── [WebSocket Channel] ◄── [Supabase Realtime Engine]
 (Nhận tin nhắn tức thì)
```

1. Khi người dùng gửi tin nhắn, một câu lệnh `INSERT` được thực thi vào bảng `direct_messages`.
2. Trình lắng nghe ghi chép của PostgreSQL (WAL - Write Ahead Log) phát hiện thay đổi và gửi sự kiện đến **Supabase Realtime**.
3. **Supabase Realtime** truyền sự kiện này qua kết nối **WebSockets** trực tiếp đến trình duyệt của những người dùng đang mở trang chat.

---

## 🛠️ 3. CHI TIẾT CODE TẠI CƠ SỞ DỮ LIỆU (DATABASE LEVEL)
Tại file [20240101000002_demo_accounts_and_chat.sql](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/supabase/migrations/20240101000002_demo_accounts_and_chat.sql), cơ sở dữ liệu được thiết lập như sau:

```sql
-- 1. Tạo bảng lưu trữ tin nhắn nhắn 1-1
create table public.direct_messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references public.profiles(id) on delete cascade not null,
    receiver_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Kích hoạt Row Level Security (Bảo mật tầng CSDL)
alter table public.direct_messages enable row level security;

-- 3. Tạo chính sách bảo mật: Chỉ Người gửi hoặc Người nhận mới có quyền ĐỌC tin nhắn
create policy "Users can view their own direct messages"
on public.direct_messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- 4. Tạo chính sách bảo mật: Chỉ có thể GỬI tin nhắn dưới danh nghĩa chính mình
create policy "Users can send messages"
on public.direct_messages for insert
with check (auth.uid() = sender_id);

-- 5. KÍCH HOẠT REALTIME: Đăng ký bảng direct_messages vào ấn bản Realtime của Supabase
alter publication supabase_realtime add table public.direct_messages;
```

---

## 💻 4. CHI TIẾT CODE TẠI FRONTEND (CLIENT-SIDE)
Tại file [page.tsx](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/app/%28dashboard%29/chat/page.tsx), Client kết nối WebSocket để lắng nghe sự kiện:

```typescript
useEffect(() => {
  if (!activeUserId || !currentUser) return;

  // 1. Định nghĩa hàm fetch toàn bộ lịch sử chat giữa 2 người ban đầu
  const fetchMessages = async () => {
    const { data } = await supabase
      .from("direct_messages")
      .select(`
        id, content, created_at, sender_id, receiver_id,
        sender:profiles!sender_id ( id, full_name, avatar_url )
      `)
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeUserId}),and(sender_id.eq.${activeUserId},receiver_id.eq.${currentUser.id})`)
      .order("created_at", { ascending: true });
    
    if (data) {
      setMessages(data as any);
    }
    setTimeout(() => scrollToBottom(), 100);
  };

  fetchMessages();

  // 2. KẾT NỐI REALTIME WEBSOCKET: Đăng ký lắng nghe sự thay đổi
  const channel = supabase
    .channel(`direct_messages_${currentUser.id}_${activeUserId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT", // Chỉ lắng nghe sự kiện thêm mới tin nhắn
        schema: "public",
        table: "direct_messages",
      },
      async (payload) => {
        const newMsg = payload.new as DirectMessage;
        
        // Lọc phía Client: Đảm bảo tin nhắn thuộc về cuộc hội thoại giữa 2 người này
        const isRelevant = 
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeUserId) ||
          (newMsg.sender_id === activeUserId && newMsg.receiver_id === currentUser.id);

        if (!isRelevant) return;

        // Truy vấn thêm Avatar & Họ tên của người gửi để hiển thị đẹp mắt
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newMsg.sender_id)
          .single();
        
        if (profile) {
          newMsg.sender = profile as Profile;
        }
        
        // Cập nhật State React để tin nhắn tự động hiển thị lên giao diện tức thì!
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(() => scrollToBottom(), 100);
      }
    )
    .subscribe(); // Bắt đầu kết nối WebSocket

  // 3. CLEANUP: Ngắt kết nối WebSocket khi người dùng đổi phòng chat hoặc thoát trang
  return () => {
    supabase.removeChannel(channel);
  };
}, [activeUserId, currentUser, supabase]);
```

---

## 🏆 5. CÁC ĐIỂM GHI ĐIỂM CỰC MẠNH VỚI GIẢNG VIÊN TRONG PHẦN NÀY
* **Bảo mật tuyệt đối (RLS):** Người dùng khác không thể "hít" lén hay đọc tin nhắn của phòng chat bằng cách gọi API bẩn, vì CSDL PostgreSQL chặn ngay tại tầng dữ liệu (`using (auth.uid() = sender_id or auth.uid() = receiver_id)`).
* **Tiết kiệm tài nguyên:** Sử dụng cơ chế lắng nghe sự thay đổi (Pub/Sub) qua WebSockets, hoàn toàn không sử dụng kỹ thuật liên tục gọi API (Short Polling) gây quá tải server.
* **Đồng bộ hóa tức thì:** Trải nghiệm người dùng đạt mức mượt mà nhất giống như Facebook Messenger hay Telegram.
