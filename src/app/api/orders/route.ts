import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber") || undefined;

    if (orderNumber) {
      const order = await OrderService.getByOrderNumber(orderNumber);
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      
      // Security: verify order belongs to user or user is admin
      if (order.user_id !== user.id && user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'super_admin') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ order });
    }

    const orders = await OrderService.listByUserId(user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const order = await OrderService.place(body);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order creation failed" }, { status: 500 });
  }
}
