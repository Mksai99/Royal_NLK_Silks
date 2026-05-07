-- ══════════════════════════════════════════════════════════════════════════════
-- ROYAL NLK SILKS — Supabase Complete Database Migration
-- Run this SQL in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('upi', 'bank_transfer', 'cod');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE stock_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── Profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'customer',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Store Config ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS store (
  id                    TEXT PRIMARY KEY DEFAULT 'default',
  name                  TEXT NOT NULL DEFAULT 'ROYAL NLK SILKS',
  address               TEXT NOT NULL DEFAULT 'Shanthi Nagar, Dharmavaram - 515671',
  phone                 TEXT NOT NULL DEFAULT '8282824929',
  email                 TEXT NOT NULL DEFAULT 'royalnlksilks@gmail.com',
  instagram             TEXT NOT NULL DEFAULT 'https://www.instagram.com/royal_nlksilks_dmm',
  whatsapp              TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/FhazGo5r8FcJ21vLiWqzLZ',
  logo_url              TEXT,
  accent_color          TEXT NOT NULL DEFAULT '#C9972B',
  upi_qr_url            TEXT,
  upi_id                TEXT,
  payment_instructions  TEXT,
  hero_image            TEXT,
  hero_headline         TEXT NOT NULL DEFAULT 'Royal Elegance in Every Thread',
  hero_subtext          TEXT NOT NULL DEFAULT 'Discover the finest Handloom Silk Sarees from Dharmavaram',
  hero_cta              TEXT NOT NULL DEFAULT 'Shop Now',
  announcement_text     TEXT NOT NULL DEFAULT 'Free delivery on orders above ₹999',
  announcement_visible  BOOLEAN NOT NULL DEFAULT true,
  about_text            TEXT,
  about_image           TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO store (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ─── Categories ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  image_url     TEXT,
  parent_id     TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_visible    BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Seed categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Kanchipuram Silk', 'kanchipuram-silk', 'The gold standard of south Indian silk with rich luster and durability.', 1),
  ('Banarasi Weaves', 'banarasi-weaves', 'Exquisite hand-woven patterns from Varanasi with gold and silver brocade.', 2),
  ('Dharmavaram Silk', 'dharmavaram-silk', 'Magnificent handlooms with double-sided gold zari borders.', 3),
  ('Soft Silk', 'soft-silk', 'Lightweight and elegant sarees perfect for everyday grace.', 4),
  ('Designer Collection', 'designer-collection', 'Contemporary takes on traditional motifs for the modern woman.', 5)
ON CONFLICT (slug) DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  category_id     TEXT NOT NULL REFERENCES categories(id),
  price           DECIMAL(10,2) NOT NULL,
  compare_price   DECIMAL(10,2),
  cost_price      DECIMAL(10,2),
  sku             TEXT UNIQUE,
  stock_qty       INT NOT NULL DEFAULT 0,
  stock_status    stock_status NOT NULL DEFAULT 'in_stock',
  images          TEXT[] NOT NULL DEFAULT '{}',
  is_visible      BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival  BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  weight          DECIMAL(8,2),
  meta_title      TEXT,
  meta_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- ─── Orders ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number         TEXT UNIQUE NOT NULL,
  user_id              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name        TEXT NOT NULL,
  customer_email       TEXT NOT NULL,
  customer_phone       TEXT NOT NULL,
  shipping_address     JSONB NOT NULL DEFAULT '{}',
  subtotal             DECIMAL(10,2) NOT NULL,
  discount_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount           DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount         DECIMAL(10,2) NOT NULL,
  status               order_status NOT NULL DEFAULT 'pending',
  payment_status       payment_status NOT NULL DEFAULT 'pending',
  payment_method       payment_method NOT NULL DEFAULT 'upi',
  payment_screenshot_url TEXT,
  coupon_id            TEXT REFERENCES coupons(id) ON DELETE SET NULL,
  admin_note           TEXT,
  tracking_number      TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES products(id),
  product_name  TEXT NOT NULL,
  product_image TEXT,
  quantity      INT NOT NULL DEFAULT 1,
  unit_price    DECIMAL(10,2) NOT NULL,
  total_price   DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ─── Cart ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cart_items (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- ─── Wishlist ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wishlist (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- ─── Addresses ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS addresses (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         TEXT NOT NULL DEFAULT 'Home',
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  pincode       TEXT NOT NULL,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ─── Reviews ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  body        TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- ─── Inventory ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id      TEXT NOT NULL REFERENCES products(id),
  quantity_change INT NOT NULL,
  reason          TEXT NOT NULL DEFAULT 'adjustment',
  reference_id    TEXT,
  note            TEXT,
  created_by      UUID NOT NULL REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_created ON inventory(created_at DESC);

-- ─── Coupons ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   discount_type NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses        INT,
  uses_count      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- ─── Payments ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id        TEXT UNIQUE NOT NULL REFERENCES orders(id),
  amount          DECIMAL(10,2) NOT NULL,
  method          payment_method NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  transaction_id  TEXT,
  screenshot_url  TEXT,
  verified_by     UUID REFERENCES profiles(id),
  verified_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ─── Gallery ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gallery_images (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  image_url     TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- ── Profiles RLS ──────────────────────────────────────────────────────────────
-- Users can read/update their own profile; admins can read all
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (is_admin());

-- ── Store RLS ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "store_public_read" ON store;
CREATE POLICY "store_public_read" ON store FOR SELECT USING (true);

DROP POLICY IF EXISTS "store_admin_update" ON store;
CREATE POLICY "store_admin_update" ON store FOR UPDATE USING (is_admin());

-- ── Categories RLS ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  USING (is_visible = true OR is_admin());

DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (is_admin());

-- ── Products RLS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT
  USING (is_visible = true OR is_admin());

DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products FOR ALL USING (is_admin());

-- ── Orders RLS ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orders_user_own" ON orders;
CREATE POLICY "orders_user_own" ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
CREATE POLICY "orders_insert_auth" ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (is_admin());

-- ── Order Items RLS ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "order_items_read" ON order_items;
CREATE POLICY "order_items_read" ON order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR is_admin())
  ));

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);

-- ── Cart RLS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cart_user_own" ON cart_items;
CREATE POLICY "cart_user_own" ON cart_items FOR ALL USING (user_id = auth.uid());

-- ── Wishlist RLS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "wishlist_user_own" ON wishlist;
CREATE POLICY "wishlist_user_own" ON wishlist FOR ALL USING (user_id = auth.uid());

-- ── Addresses RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "addresses_user_own" ON addresses;
CREATE POLICY "addresses_user_own" ON addresses FOR ALL USING (user_id = auth.uid());

-- ── Reviews RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_visible = true OR is_admin());

DROP POLICY IF EXISTS "reviews_user_write" ON reviews;
CREATE POLICY "reviews_user_write" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_user_update" ON reviews;
CREATE POLICY "reviews_user_update" ON reviews FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (is_admin());

-- ── Inventory RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "inventory_admin_only" ON inventory;
CREATE POLICY "inventory_admin_only" ON inventory FOR ALL USING (is_admin());

-- ── Coupons RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "coupons_auth_read" ON coupons;
CREATE POLICY "coupons_auth_read" ON coupons FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- ── Payments RLS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_read_own" ON payments;
CREATE POLICY "payments_read_own" ON payments FOR SELECT
  USING (is_admin() OR EXISTS (
    SELECT 1 FROM orders WHERE orders.id = payments.order_id
    AND orders.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "payments_admin_update" ON payments;
CREATE POLICY "payments_admin_update" ON payments FOR UPDATE USING (is_admin());

-- ── Gallery RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "gallery_public_read" ON gallery_images;
CREATE POLICY "gallery_public_read" ON gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "gallery_admin_all" ON gallery_images;
CREATE POLICY "gallery_admin_all" ON gallery_images FOR ALL USING (is_admin());

-- ══════════════════════════════════════════════════════════════════════════════
-- Storage Buckets
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('profile-images', 'profile-images', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "banners_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "banners_admin_write" ON storage.objects FOR ALL
  USING (bucket_id = 'banners' AND is_admin());

CREATE POLICY "profile_images_owner" ON storage.objects FOR ALL
  USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ══════════════════════════════════════════════════════════════════════════════
-- Updated at trigger
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','categories','products','orders','cart_items','addresses','reviews','inventory','coupons','payments','store']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_%1$s_updated_at ON %1$s', tbl);
    EXECUTE format('CREATE TRIGGER set_%1$s_updated_at BEFORE UPDATE ON %1$s FOR EACH ROW EXECUTE FUNCTION set_updated_at()', tbl);
  END LOOP;
END;
$$;
