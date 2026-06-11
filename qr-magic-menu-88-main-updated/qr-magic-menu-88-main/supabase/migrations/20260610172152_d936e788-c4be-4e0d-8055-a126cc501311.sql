
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('owner','kitchen','cashier');
CREATE TYPE public.order_status AS ENUM ('pending','preparing','ready','paid','cancelled');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ RESTAURANTS ============
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT SELECT ON public.restaurants TO anon;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_restaurants_updated BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, restaurant_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.user_restaurant_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_restaurant_access(_user_id uuid, _restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants WHERE id = _restaurant_id AND owner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND restaurant_id = _restaurant_id
  );
$$;

-- ============ POLICIES: restaurants ============
CREATE POLICY "Public can view active restaurants" ON public.restaurants
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Owner can manage own restaurant" ON public.restaurants
  FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ============ POLICIES: profiles ============
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- ============ POLICIES: user_roles ============
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restaurant staff manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_restaurant_access(auth.uid(), restaurant_id))
  WITH CHECK (public.has_restaurant_access(auth.uid(), restaurant_id));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,3) NOT NULL DEFAULT 0,
  emoji TEXT,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restaurant staff manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_restaurant_access(auth.uid(), restaurant_id))
  WITH CHECK (public.has_restaurant_access(auth.uid(), restaurant_id));

-- ============ TABLES ============
CREATE TABLE public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  number INT NOT NULL,
  qr_code_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tables TO authenticated;
GRANT SELECT ON public.tables TO anon;
GRANT ALL ON public.tables TO service_role;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tables_updated BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Public read tables" ON public.tables
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Restaurant staff manage tables" ON public.tables
  FOR ALL TO authenticated
  USING (public.has_restaurant_access(auth.uid(), restaurant_id))
  WITH CHECK (public.has_restaurant_access(auth.uid(), restaurant_id));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  table_number INT,
  status public.order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10,3) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- anyone can create an order for an active restaurant (customer flow, no auth)
CREATE POLICY "Anyone can create order" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.is_active = true));
-- staff can read/update their restaurant's orders
CREATE POLICY "Staff read restaurant orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_restaurant_access(auth.uid(), restaurant_id));
CREATE POLICY "Staff update restaurant orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_restaurant_access(auth.uid(), restaurant_id))
  WITH CHECK (public.has_restaurant_access(auth.uid(), restaurant_id));
-- allow anon to read just-placed order (by id) for confirmation screen
CREATE POLICY "Public read orders" ON public.orders
  FOR SELECT TO anon USING (true);

-- ============ ORDER ITEMS ============
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,3) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public read order items" ON public.order_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage order items" ON public.order_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.has_restaurant_access(auth.uid(), o.restaurant_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.has_restaurant_access(auth.uid(), o.restaurant_id)));

-- ============ SIGNUP TRIGGER ============
-- Auto-create profile + restaurant + owner role from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_restaurant_id UUID;
  v_restaurant_name TEXT;
  v_full_name TEXT;
BEGIN
  v_restaurant_name := COALESCE(NEW.raw_user_meta_data->>'restaurant_name', 'Mon restaurant');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  INSERT INTO public.restaurants (owner_id, name)
  VALUES (NEW.id, v_restaurant_name)
  RETURNING id INTO v_restaurant_id;

  INSERT INTO public.profiles (id, full_name, restaurant_id)
  VALUES (NEW.id, v_full_name, v_restaurant_id);

  INSERT INTO public.user_roles (user_id, role, restaurant_id)
  VALUES (NEW.id, 'owner', v_restaurant_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ REALTIME ============
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
