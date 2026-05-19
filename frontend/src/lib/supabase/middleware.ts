import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if logged in and trying to access auth routes
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Basic RBAC for /dashboard/analytics or /dashboard itself if we want it to be admin only.
  // Wait, the plan was to protect Analytics. Let's redirect users away from analytics.
  if (user && request.nextUrl.pathname === '/dashboard') {
    // We need to know if they are an admin. We can check their role.
    // However, querying user_roles in middleware is tricky because we need the supabase client to query.
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .single()

    // Assuming role_id 1 is admin.
    const isAdmin = roleData?.role_id === 1

    if (!isAdmin) {
      // Normal users shouldn't see the Analytics dashboard. Redirect to chat.
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/chat'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
