import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Updates the Supabase session in middleware.
 * Called on every request to keep the session fresh.
 * Returns the response with refreshed cookies.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST call getUser() to keep token fresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ── Admin route protection ───────────────────────────────────────
  if (path.startsWith("/admin") && path !== "/admin-login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      return NextResponse.redirect(url);
    }

    // Check role from user metadata
    const role = user.user_metadata?.role as string | undefined;
    if (role !== "admin" && role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ── Checkout protection — redirect to login if not authenticated ─
  if (path.startsWith("/checkout") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from login/register ───────────
  if ((path === "/login" || path === "/register" || path === "/admin-login") && user) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || (path === "/admin-login" ? "/admin" : "/");
    const url = request.nextUrl.clone();
    url.pathname = callbackUrl;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
