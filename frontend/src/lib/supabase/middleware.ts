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

  const protectedRoutes = ['/dashboard', '/chat', '/rls-playground', '/ai-search', '/storage', '/benchmark']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to entrypoint if logged in and trying to access auth routes
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Role-Based Access Control (RBAC)
  // Only Admin (role_id = 1) can access the Analytics Dashboard (/dashboard)
  if (user && request.nextUrl.pathname === '/dashboard') {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id)
      .single()

    // Role ID 1 is Admin
    const isAdmin = roleData?.role_id === 1

    if (!isAdmin) {
      // Normal users are redirected to the database playground (RLS Playground)
      const url = request.nextUrl.clone()
      url.pathname = '/rls-playground'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
