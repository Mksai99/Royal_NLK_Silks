import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { AuthService } from "@/services/auth.service";

// PATCH /api/orders/[id] — admin updates order
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const role = await AuthService.getUserRole();
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    if (body.status) await OrderService.updateStatus(id, body.status, body.adminNote);
    if (body.paymentStatus) await OrderService.updatePaymentStatus(id, body.paymentStatus);
    if (body.trackingNumber) await OrderService.addTrackingNumber(id, body.trackingNumber);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// GET /api/orders/[id] — get single order
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Check if it's an order number (starts with RNLKS) or a UUID
    let order;
    if (id.startsWith("RNLKS-")) {
      order = await OrderService.getByOrderNumber(id);
    } else {
      order = await OrderService.getById(id);
    }

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // For tracking, we allow public access if you have the full Order ID/Number
    // But we redact sensitive info if not authorized
    const role = await AuthService.getUserRole();
    const user = await AuthService.getUser();
    
    const isOwner = user?.id === order.user_id;
    const isAdmin = role === "admin" || role === "super_admin";

    if (!isOwner && !isAdmin) {
      // Redact sensitive info for public tracking
      const publicOrder = {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        customer_name: order.customer_name,
        admin_note: order.admin_note,
        order_items: (order as any).order_items,
        total_amount: order.total_amount,
      };
      return NextResponse.json({ order: publicOrder });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
