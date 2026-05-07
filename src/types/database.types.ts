/**
 * Auto-generated Supabase database types.
 * After running `supabase gen types typescript`, replace this file.
 * 
 * For now, these are manually defined to match the Prisma schema.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "admin" | "super_admin";
export type OrderStatus = "pending" | "processing" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "verified" | "rejected" | "refunded";
export type PaymentMethod = "upi" | "bank_transfer" | "cod";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at">;
        Update: Partial<Omit<OrderItem, "id" | "created_at">>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CartItem, "id" | "created_at">>;
      };
      wishlist: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, "id" | "created_at">;
        Update: never;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Address, "id" | "created_at">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
      inventory: {
        Row: Inventory;
        Insert: Omit<Inventory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Inventory, "id" | "created_at">>;
      };
      coupons: {
        Row: Coupon;
        Insert: Omit<Coupon, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Coupon, "id" | "created_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payment, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      stock_status: StockStatus;
    };
  };
}

// ─── Model Interfaces ─────────────────────────────────────────────────────────

export interface Profile {
  id: string;           // References auth.users.id
  email: string;
  name: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category_id: string;
  price: number;
  compare_price?: number | null;
  cost_price?: number | null;
  sku?: string | null;
  stock_qty: number;
  stock_status: StockStatus;
  images: string[];         // Array of image URLs
  is_visible: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  tags?: string[] | null;
  weight?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Json;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_screenshot_url?: string | null;
  coupon_id?: string | null;
  admin_note?: string | null;
  tracking_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;         // e.g. "Home", "Work"
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;        // 1–5
  title?: string | null;
  body?: string | null;
  is_verified: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity_change: number;    // +N for addition, -N for sale/removal
  reason: string;             // "sale", "restock", "adjustment", "return"
  reference_id?: string | null; // order_id or purchase_order_id
  note?: string | null;
  created_by: string;          // admin user id
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number | null;
  max_uses?: number | null;
  uses_count: number;
  is_active: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string | null;
  screenshot_url?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Request / Response types ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
