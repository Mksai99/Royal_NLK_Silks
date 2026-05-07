import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/services/auth.service";

// GET /api/categories — public list
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { products: true } } }
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST /api/categories — admin only
export async function POST(req: NextRequest) {
  try {
    const role = await AuthService.getUserRole();
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name, description, imageUrl, displayOrder } = await req.json();
    if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const supabase = await createClient(); // Service role would be better for admin but server client works if RLS allows
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug, description, image_url: imageUrl, display_order: displayOrder ?? 0 })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, category: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
