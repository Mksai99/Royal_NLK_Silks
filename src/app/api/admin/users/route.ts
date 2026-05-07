import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/services/auth.service";

// GET /api/admin/users — admin only
export async function GET() {
  const user = await AuthService.getUser();
  const role = user?.user_metadata?.role;
  if (!user || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const profiles = await prisma.profile.findMany({
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users: profiles });
}

// PATCH /api/admin/users — update user role
export async function PATCH(req: NextRequest) {
  const user = await AuthService.getUser();
  const role = user?.user_metadata?.role;
  if (!user || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id, role: newRole } = await req.json();
  if (!id || !newRole) return NextResponse.json({ error: "ID and role required" }, { status: 400 });

  // Update in profiles table
  const profile = await prisma.profile.update({
    where: { id },
    data: { role: newRole as any },
    select: { id: true, email: true, name: true, role: true },
  });

  // Also update Supabase Auth metadata
  try {
    await AuthService.setUserRole(id, newRole);
  } catch (e) {
    // Non-critical — profile table is the source of truth
    console.warn("Failed to update Supabase Auth metadata:", e);
  }

  return NextResponse.json({ success: true, user: profile });
}

// DELETE /api/admin/users — delete a user
export async function DELETE(req: NextRequest) {
  const currentUser = await AuthService.getUser();
  const role = currentUser?.user_metadata?.role;
  if (!currentUser || (role !== "admin" && role !== "super_admin")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  // Delete from profiles table
  await prisma.profile.delete({ where: { id } });

  // Also delete from Supabase Auth
  try {
    await AuthService.deleteUser(id);
  } catch (e) {
    console.warn("Failed to delete from Supabase Auth:", e);
  }

  return NextResponse.json({ success: true });
}
