import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { AuthService } from "@/services/auth.service";

// GET /api/products — public list with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const isFeatured = searchParams.get("featured") === "true";
  const isNewArrival = searchParams.get("newArrival") === "true";
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  try {
    const products = await ProductService.list({
      categoryId,
      isFeatured,
      isNewArrival,
      search,
      page,
      pageSize,
    });
    // Return structured response matching old UI expectation but with new data
    return NextResponse.json({ 
      products: products.data,
      total: products.total,
      page: products.page,
      totalPages: products.totalPages
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  try {
    const role = await AuthService.getUserRole();
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, categoryId, price, description, stockQty, images, isFeatured, isNewArrival, tags } = body;

    if (!name || !categoryId || !price || !slug) {
      return NextResponse.json({ error: "Name, slug, category, and price are required" }, { status: 400 });
    }

    const product = await ProductService.create({
      name,
      slug,
      categoryId,
      price: Number(price),
      description,
      stock_qty: stockQty ?? 0,
      stock_status: (stockQty ?? 0) > 0 ? "in_stock" : "out_of_stock",
      images: images || [],
      is_visible: true,
      is_featured: isFeatured ?? false,
      is_new_arrival: isNewArrival ?? false,
      tags: tags || [],
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create product" }, { status: 500 });
  }
}
