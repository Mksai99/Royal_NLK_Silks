-- ══════════════════════════════════════════════════════════════════════════════
-- ROYAL NLK SILKS — Final Production Polish
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Restore Foreign Key to Auth (Logical link managed by Supabase)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Helper Functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- 3. Enable RLS on all tables
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

-- 4. Apply Policies (extracted from migration)
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "store_public_read" ON store;
CREATE POLICY "store_public_read" ON store FOR SELECT USING (true);
DROP POLICY IF EXISTS "store_admin_update" ON store;
CREATE POLICY "store_admin_update" ON store FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (is_visible = true OR is_admin());
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_visible = true OR is_admin());
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "orders_user_own" ON orders;
CREATE POLICY "orders_user_own" ON orders FOR SELECT USING (user_id = auth.uid() OR is_admin());
DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
CREATE POLICY "orders_insert_auth" ON orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "order_items_read" ON order_items;
CREATE POLICY "order_items_read" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin())));
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "cart_user_own" ON cart_items;
CREATE POLICY "cart_user_own" ON cart_items FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wishlist_user_own" ON wishlist;
CREATE POLICY "wishlist_user_own" ON wishlist FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "addresses_user_own" ON addresses;
CREATE POLICY "addresses_user_own" ON addresses FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_visible = true OR is_admin());
DROP POLICY IF EXISTS "reviews_user_write" ON reviews;
CREATE POLICY "reviews_user_write" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "reviews_user_update" ON reviews;
CREATE POLICY "reviews_user_update" ON reviews FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "inventory_admin_only" ON inventory;
CREATE POLICY "inventory_admin_only" ON inventory FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (is_admin());
DROP POLICY IF EXISTS "coupons_auth_read" ON coupons;
CREATE POLICY "coupons_auth_read" ON coupons FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "payments_read_own" ON payments;
CREATE POLICY "payments_read_own" ON payments FOR SELECT USING (is_admin() OR EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "payments_admin_update" ON payments;
CREATE POLICY "payments_admin_update" ON payments FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "gallery_public_read" ON gallery_images;
CREATE POLICY "gallery_public_read" ON gallery_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "gallery_admin_all" ON gallery_images;
CREATE POLICY "gallery_admin_all" ON gallery_images FOR ALL USING (is_admin());

-- 5. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('profile-images', 'profile-images', true, 2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
CREATE POLICY "product_images_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "banners_public_read" ON storage.objects;
CREATE POLICY "banners_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
DROP POLICY IF EXISTS "banners_admin_write" ON storage.objects;
CREATE POLICY "banners_admin_write" ON storage.objects FOR ALL USING (bucket_id = 'banners' AND is_admin());

-- 6. Updated At Triggers
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

-- 7. Auth Signup Sync Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
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
