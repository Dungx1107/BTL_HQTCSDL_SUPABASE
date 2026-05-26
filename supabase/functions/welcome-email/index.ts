import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Welcome-email function loaded.")

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Lấy API Key của Resend từ biến môi trường (nếu có cấu hình)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    let emailSent = false
    let providerResponse = null

    if (RESEND_API_KEY) {
      // Nếu có Resend API Key, tiến hành gửi email thật
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
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã đăng nhập và trải nghiệm dự án <strong>Supabase Ultimate Showcase</strong> của chúng tôi.</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dự án này là minh chứng trực quan cho các tính năng nâng cao của PostgreSQL và Supabase:</p>
              <ul style="color: #475569; padding-left: 20px; line-height: 1.6;">
                <li><strong>🔒 Row Level Security (RLS):</strong> Phân quyền dòng bảo mật.</li>
                <li><strong>💬 Realtime WebSockets Chat:</strong> Chat đồng bộ hóa tức thì.</li>
                <li><strong>🧠 pgvector AI Search:</strong> Tìm kiếm ngữ nghĩa bằng AI.</li>
                <li><strong>⚡ Edge Functions (Deno):</strong> Chính là email tự động bạn đang nhận!</li>
              </ul>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">
                Đây là email tự động gửi từ Supabase Edge Function khi tài khoản được xác thực.
              </p>
            </div>
          `
        })
      })
      if (res.ok) {
        emailSent = true
        providerResponse = await res.json()
      }
    }

    // Luôn ghi nhận log chi tiết ra console của Supabase để demo trực quan cho thầy xem
    console.log(`
      =============================================================
      📧 THƯ CHÀO MỪNG ĐÃ ĐƯỢC GỬI (MÔ PHỎNG EDGE FUNCTION)
      =============================================================
      Gửi đến: ${fullName} <${email}>
      Tiêu đề: Chào mừng bạn đến với Supabase Ultimate Showcase! 🚀
      Trạng thái gửi thật: ${emailSent ? "Thành công (qua Resend)" : "Mô phỏng (Chưa cấu hình API Key)"}
      -------------------------------------------------------------
      Nội dung thư:
      Xin chào ${fullName},
      Cảm ơn bạn đã trải nghiệm hệ thống xác thực Google OAuth.
      Sự kiện này đã kích hoạt Supabase Edge Function chạy trên nền tảng
      Deno Deploy cực kỳ mượt mà!
      =============================================================
    `)

    return new Response(JSON.stringify({ 
      success: true, 
      emailSent,
      message: `Welcome email processed successfully for ${email}`,
      user: { email, fullName },
      providerResponse
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error: any) {
    console.error(`[Edge Function Error]: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})
