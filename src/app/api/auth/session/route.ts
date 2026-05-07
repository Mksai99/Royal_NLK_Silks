import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/auth/session — returns the current Supabase user (or null)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name ?? "",
        role: user.user_metadata?.role ?? "customer",
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// POST /api/auth/session — logout
export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  return NextResponse.json({ success: true });
}
