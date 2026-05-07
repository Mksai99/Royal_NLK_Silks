import { NextRequest, NextResponse } from "next/server";
import { loginUser, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await loginUser(email.trim().toLowerCase(), password);
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "user" | "admin",
    });

    return NextResponse.json({
      success: true,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
