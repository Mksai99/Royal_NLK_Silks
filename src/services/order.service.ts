import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuthService } from "./auth.service";
import crypto from "crypto";
import type { Order, OrderStatus, PaymentStatus } from "@/types/database.types";

export interface PlaceOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod: "upi" | "bank_transfer" | "cod";
  paymentScreenshotUrl?: string;
  couponCode?: string;
}

// Generate human-readable order number
async function generateOrderNumber(): Promise<string> {
  const admin = createAdminClient();
  const year = new Date().getFullYear();
  const { count } = await admin
    .from("orders")
    .select("*", { count: "exact", head: true });
  return `RNLKS-${year}-${String((count ?? 0) + 1).padStart(5, "0")}`;
}

export const OrderService = {

  async place(orderData: PlaceOrderData): Promise<Order> {
    const admin = createAdminClient();
    const user = await AuthService.getUser();

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity, 0
    );
    const orderNumber = await generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        user_id: user?.id ?? null,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        subtotal,
        discount_amount: 0,
        shipping_amount: 0,
        tax_amount: 0,
        total_amount: subtotal,
        status: "pending",
        payment_status: "pending",
        payment_method: orderData.paymentMethod,
        payment_screenshot_url: orderData.paymentScreenshotUrl ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      id: crypto.randomUUID(),
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);
    if (itemsError) throw new Error(itemsError.message);

    // Create payment record
    await admin.from("payments").insert({
      id: crypto.randomUUID(),
      order_id: order.id,
      amount: subtotal,
      method: orderData.paymentMethod,
      status: "pending",
      screenshot_url: orderData.paymentScreenshotUrl ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return order as Order;
  },

  async getById(id: string): Promise<Order | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Order;
  },

  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("order_number", orderNumber)
      .single();
    if (error) return null;
    return data as Order;
  },

  async listByUserId(userId: string): Promise<Order[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data as Order[];
  },

  // ── Admin operations ───────────────────────────────────────────────────────

  async adminList(page = 1, pageSize = 50) {
    const admin = createAdminClient();
    const from = (page - 1) * pageSize;
    const { data, error, count } = await admin
      .from("orders")
      .select("*, order_items(*), payments(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    return { data: data as Order[], total: count ?? 0 };
  },

  async updateStatus(orderId: string, status: OrderStatus, adminNote?: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .update({
        status,
        ...(adminNote !== undefined && { admin_note: adminNote }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, verifiedById?: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Update payment record too
    await admin.from("payments").update({
      status: paymentStatus,
      verified_by: verifiedById ?? null,
      verified_at: verifiedById ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("order_id", orderId);

    return data;
  },

  async addTrackingNumber(orderId: string, trackingNumber: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};
