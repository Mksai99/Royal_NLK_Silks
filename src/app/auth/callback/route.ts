import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route — handles:
 * 1. Email confirmation links
 * 2. OAuth (Google) redirects
 * 3. Password reset redirects
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // ─── Ensure Profile Exists ───
      // This acts as a fallback if the Supabase database trigger isn't set up
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
            role: (data.user.user_metadata?.role as any) || "customer",
          } as any);
        }
      } catch (profileError) {
        console.error("Error ensuring profile exists:", profileError);
      }

      // Always redirect to the origin to maintain cookie consistency
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code error — redirect to error page
  return NextResponse.redirect(`${origin}/auth/error`);
}
