import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // ÉP CỐ ĐỊNH: Bỏ qua param bên ngoài, luôn luôn điều hướng về /dashboard tổng quan
  const next = '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Bỏ qua nếu gọi từ Server Component
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Gọi Edge Function welcome-email để gửi thư chào mừng trong nền
      try {
        await supabase.functions.invoke('welcome-email', {
          body: { 
            record: {
              email: data.user.email,
              raw_user_meta_data: data.user.user_metadata
            }
          }
        })
      } catch (funcErr) {
        console.error("[Auth Callback] Failed to invoke welcome-email function:", funcErr)
      }

      // Điều hướng về http://localhost:3000/dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`)
}