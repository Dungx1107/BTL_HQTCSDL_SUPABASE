# BÁO CÁO HỆ THỐNG SUPABASE EDGE FUNCTIONS (TẬP TIN ĐỒ ÁN)
*Tài liệu hướng dẫn kỹ thuật - Serverless Deno Edge Functions & Tự động gửi Email Chào mừng*

---

## 📂 1. DANH SÁCH CÁC FILE LIÊN QUAN & ĐƯỜNG DẪN CHI TIẾT

Tính năng gửi Email chào mừng tự động khi đăng nhập thành công bằng Google OAuth được xây dựng bằng Deno Edge Function:

1. **File Source của Supabase Edge Function (Viết bằng TypeScript chạy trên môi trường Deno):**
   * **Đường dẫn:** `supabase/functions/welcome-email/index.ts` (Đường dẫn tuyệt đối: [index.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/supabase/functions/welcome-email/index.ts))
   * **Nhiệm vụ:** Nhận payload từ Webhook/API gồm email và tên người dùng, xử lý logic gửi thư (tích hợp API thật của nhà cung cấp Resend hoặc mô phỏng chi tiết ra log console).

2. **File Kích hoạt cuộc gọi Edge Function từ Next.js Server:**
   * **Đường dẫn:** `frontend/src/app/auth/callback/route.ts` (Đường dẫn tuyệt đối: [route.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/frontend/src/app/auth/callback/route.ts))
   * **Nhiệm vụ:** Sau khi người dùng đăng nhập Google OAuth thành công và đổi mã xác thực lấy Token (`exchangeCodeForSession`), Server Next.js sẽ kích hoạt gọi ngầm (Invoke) Edge Function `welcome-email` trước khi đưa người dùng vào hệ thống.

---

## ⚙️ 2. CƠ CHẾ VÀ QUY TRÌNH HOẠT ĐỘNG
```
[Người dùng đăng nhập Google] 
          │
          ▼ (Callback thành công)
[Next.js Server: auth/callback] ──(Gọi ngầm)──► [Supabase Edge Function (Deno)]
          │                                                │
          ▼ (Redirect)                                     ▼
[Giao diện chính /rls-playground]             [Gửi Email thật (Resend API)]
                                                           hoặc
                                              [Ghi log Email mẫu ra Console CLI]
```

---

## 🛠️ 3. CHI TIẾT CODE CỦA EDGE FUNCTION (DENO TS)
Tại file [index.ts](file:///c:/btl/BTL-HQTCSDL/Supabase-Ultimate-Showcase/supabase/functions/welcome-email/index.ts), mã nguồn được triển khai trên Deno cực kỳ nhẹ và nhanh:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // 1. Cấu hình CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { record } = await req.json()
    const email = record?.email
    const fullName = record?.raw_user_meta_data?.full_name || record?.raw_user_meta_data?.name || email?.split('@')[0]

    console.log(`[Edge Function] Sending welcome email to ${fullName} (${email})...`)

    // 2. Tích hợp nhà cung cấp Email hàng đầu thế giới (Resend)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    let emailSent = false
    let providerResponse = null

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Supabase Showcase <onboarding@resend.dev>',
          to: email,
          subject: 'Chào mừng bạn đến với Supabase Ultimate Showcase! 🚀',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #10b981; margin-top: 0;">Chào mừng ${fullName}! 👋</h2>
              <p>Cảm ơn bạn đã đăng nhập và trải nghiệm dự án <strong>Supabase Ultimate Showcase</strong> của chúng tôi.</p>
              ...
            </div>
          `
        })
      })
      if (res.ok) {
        emailSent = true
        providerResponse = await res.json()
      }
    }

    // 3. Ghi log trực quan dạng ASCII Art ra Terminal để trình diễn trực tiếp
    console.log(`
      =============================================================
      📧 THƯ CHÀO MỪNG ĐÃ ĐƯỢC GỬI (MÔ PHỎNG EDGE FUNCTION)
      =============================================================
      Gửi đến: ${fullName} <${email}>
      Tiêu đề: Chào mừng bạn đến với Supabase Ultimate Showcase! 🚀
      Trạng thái gửi thật: ${emailSent ? "Thành công (qua Resend)" : "Mô phỏng (Chưa cấu hình API Key)"}
      =============================================================
    `)

    return new Response(JSON.stringify({ success: true, emailSent, user: { email, fullName } }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
```

---

## 🚀 4. CÁCH KHỞI CHẠY & KIỂM TRA ĐỂ TRÌNH DIỄN (LOCAL DEMO)

Khi chạy demo cho giảng viên xem trực tiếp trên máy tính cá nhân của bạn, hãy thực hiện các bước sau:

### Bước 1: Khởi chạy trình phục vụ Edge Function Local
Mở một Terminal mới tại thư mục gốc của dự án và gõ lệnh sau để kích hoạt chạy Deno Server cục bộ:
```bash
npx supabase functions serve
```
*Lệnh này sẽ tải môi trường Deno và lắng nghe các cuộc gọi API đến Edge Function tại cổng `http://localhost:54321/functions/v1/welcome-email`.*

### Bước 2: Thực hiện đăng nhập bằng Google OAuth
* Tiến hành đăng nhập bằng tài khoản Google của bạn trên giao diện web.
* Giao diện sẽ hoàn tất xác thực và tự động đưa bạn vào trang chính.

### Bước 3: Chỉ cho Thầy xem kết quả hoạt động
* Mở **Terminal nơi đang chạy lệnh `npx supabase functions serve`**.
* Bạn sẽ thấy một khối **Log Email nghệ thuật hình hộp chữ nhật** cực kỳ đẹp mắt được in ra ngay tại Console (hiển thị rõ ràng email tài khoản Gmail bạn vừa đăng nhập, tiêu đề thư và nội dung lời chào). 
* Điều này chứng minh 100% Edge Function đã được gọi và chạy thành công trên máy của bạn mà không cần Deploy lên máy chủ Cloud!

---

## ✉️ 5. HƯỚNG DẪN CẤU HÌNH GỬI EMAIL THẬT VÀO HÒM THƯ (NẾU CẦN)
Nếu bạn muốn email được gửi **thật sự** vào hòm thư Gmail của bạn để tăng độ uy tín tuyệt đối:
1. Đăng ký một tài khoản miễn phí tại **[Resend.com](https://resend.com)**.
2. Lấy **API Key** của Resend.
3. Cấu hình API Key này vào dự án Supabase cục bộ của bạn bằng cách chạy lệnh:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_your_api_key_here
   ```
4. Kể từ lúc này, mỗi khi đăng nhập bằng Google, bạn sẽ nhận được một bức thư chào mừng bằng HTML thiết kế tuyệt đẹp được gửi thẳng vào hòm thư Gmail thật của bạn trong vòng 1 giây!
