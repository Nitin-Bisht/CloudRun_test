import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // To properly work with Server Components in Next.js, we must use createServerClient in Middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Update request cookies for the current request
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        // Create new response object to apply the cookie updates
        supabaseResponse = NextResponse.next({
          request,
        })
        // Apply cookies to the response
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session if expired and gets the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProviderRoute = pathname === "/provider" || pathname.startsWith("/provider/")

  // Public routes that don't need auth (but also users shouldn't visit if logged in)
  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/signup') || 
                      pathname.startsWith('/forgot-password') || 
                      pathname.startsWith('/reset-password')

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Protected routes check
  const isProtected = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/admin') || 
                      isProviderRoute

  // Redirect unauthenticated users
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect_to', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based protection
  if (user && (pathname.startsWith('/admin') || isProviderRoute)) {
    // Fetch user profile to check role securely
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // Something went wrong, redirect to login
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }

    if (pathname.startsWith('/admin') && profile.role !== 'admin') {
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/unauthorized'
      return NextResponse.redirect(unauthorizedUrl)
    }

    if (isProviderRoute && profile.role !== 'provider' && profile.role !== 'admin') {
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/unauthorized'
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  return supabaseResponse
}
