import { NextRequest, NextResponse } from "next/server";
import { registerUser, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await registerUser(name.trim(), email.trim().toLowerCase(), password);
    await createSession({ id: user.id, email: user.email, name: user.name, role: "user" });

    return NextResponse.json({ success: true, name: user.name, email: user.email, role: "user" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
