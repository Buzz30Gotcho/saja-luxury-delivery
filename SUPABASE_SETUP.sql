-- =====================================================
-- SUPABASE DATABASE SETUP - SHOP IN LINE
-- E-COMMERCE WITH ORDERS TRACKING
-- =====================================================

-- Extension pour gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CLEANUP - Supprimer les anciennes tables/fonctions
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP FUNCTION IF EXISTS public.update_updated_at_column () CASCADE;

DROP FUNCTION IF EXISTS public.current_user_role () CASCADE;

DROP TABLE IF EXISTS public.order_items CASCADE;

DROP TABLE IF EXISTS public.orders CASCADE;

DROP TABLE IF EXISTS public.reviews CASCADE;

DROP TABLE IF EXISTS public.user_favorites CASCADE;

DROP TABLE IF EXISTS public.delivery_zones CASCADE;

DROP TABLE IF EXISTS public.shop_staff CASCADE;

DROP TABLE IF EXISTS public.user_addresses CASCADE;

DROP TABLE IF EXISTS public.products CASCADE;

DROP TABLE IF EXISTS public.shops CASCADE;

DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TABLE IF EXISTS public.user_consents CASCADE;

DROP TABLE IF EXISTS public.cart_items CASCADE;

DROP TABLE IF EXISTS public.notifications CASCADE;

DROP TABLE IF EXISTS public.global_stats CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;

DROP TYPE IF EXISTS public.payment_status CASCADE;

-- =====================================================
-- CREATION DES TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('customer', 'shop_owner', 'admin', 'delivery_person');

CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready_for_delivery', 'in_delivery', 'delivered', 'cancelled');

CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- =====================================================
-- 1. PROFILES (User Profiles)
-- =====================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    display_user TEXT,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    default_address TEXT,
    default_city TEXT,
    default_postal_code TEXT,
    default_country TEXT DEFAULT 'France',
    newsletter_subscribed BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    role user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. SHOPS (Boutiques)
-- =====================================================

CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    delivery_time_min INTEGER DEFAULT 30,
    delivery_time_max INTEGER DEFAULT 45,
    delivery_fee DECIMAL(10, 2) DEFAULT 2.50,
    minimum_order DECIMAL(10, 2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES auth.users (id),
    delivery_available BOOLEAN DEFAULT true,
    pickup_available BOOLEAN DEFAULT false,
    is_open BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCTS (Produits)
-- =====================================================

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    gender TEXT,
    description TEXT,
    category TEXT,
    ingredients TEXT,
    allergens TEXT,
    weight DECIMAL(10, 2),
    unit TEXT,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. ORDERS (CRUCIAL TABLE - Commandes)
-- =====================================================

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status order_status DEFAULT 'confirmed',
    shipping_details JSONB NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. CART ITEMS (Panier)
-- =====================================================

CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- =====================================================
-- 6. ADDITIONAL TABLES
-- =====================================================

CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'France',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, shop_id)
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL,
    granted BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. INDEXES (Performance)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops (category);

CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops (city);

CREATE INDEX IF NOT EXISTS idx_shops_active ON public.shops (is_active);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops (owner_id);

CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products (shop_id);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);

CREATE INDEX IF NOT EXISTS idx_products_available ON public.products (is_available);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at);

CREATE INDEX IF NOT EXISTS idx_orders_transaction ON public.orders (transaction_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items (user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON public.user_addresses (user_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites (user_id);

-- =====================================================
-- 8. FUNCTIONS(Fonctions)
-- =====================================================

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_user, newsletter_subscribed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'newsletter_subscribed')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- ==== PROFILES ====
CREATE POLICY "profiles_select_own" ON public.profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "profiles_update_own" ON public.profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "profiles_insert_own" ON public.profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- ==== SHOPS ====
CREATE POLICY "shops_select_all" ON public.shops FOR
SELECT USING (is_active = true);

CREATE POLICY "shops_insert_own" ON public.shops FOR
INSERT
WITH
    CHECK (auth.uid () = owner_id);

CREATE POLICY "shops_update_own" ON public.shops FOR
UPDATE USING (auth.uid () = owner_id);

-- ==== PRODUCTS ====
CREATE POLICY "products_select_all" ON public.products FOR
SELECT USING (is_available = true);

CREATE POLICY "products_insert_own" ON public.products FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.shops
            WHERE
                shops.id = products.shop_id
                AND shops.owner_id = auth.uid ()
        )
    );

CREATE POLICY "products_update_own" ON public.products FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM public.shops
        WHERE
            shops.id = products.shop_id
            AND shops.owner_id = auth.uid ()
    )
);

-- ==== ORDERS (IMPORTANT) ====
-- Users can view their own orders
CREATE POLICY "orders_select_own" ON public.orders FOR
SELECT USING (auth.uid () = user_id);

-- Service role backend can insert orders (no RLS check because service role bypasses RLS)
-- Regular users can insert their own orders
CREATE POLICY "orders_insert_own" ON public.orders FOR
INSERT
WITH
    CHECK (
        auth.uid () = user_id
        OR auth.role () = 'service_role'
    );

-- ==== CART ITEMS ====
CREATE POLICY "cart_items_users_own" ON public.cart_items FOR ALL USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

-- ==== USER ADDRESSES ====
CREATE POLICY "user_addresses_own" ON public.user_addresses FOR ALL USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

-- ==== USER FAVORITES ====
CREATE POLICY "user_favorites_own" ON public.user_favorites FOR ALL USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

-- ==== REVIEWS ====
CREATE POLICY "reviews_select_published" ON public.reviews FOR
SELECT USING (true);

CREATE POLICY "reviews_insert_own" ON public.reviews FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- ==== USER CONSENTS ====
CREATE POLICY "user_consents_own" ON public.user_consents FOR ALL USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

-- =====================================================
-- 10. SAMPLE DATA (Données d'exemple)
-- =====================================================

-- Shops
INSERT INTO
    public.shops (
        name,
        category,
        description,
        image,
        address,
        city,
        postal_code,
        delivery_fee,
        minimum_order
    )
VALUES (
        'Fashion Store Paris',
        'Vêtements',
        'Vêtements tendance pour homme et femme',
        'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Fashion+Shop',
        '45 Avenue de la Mode',
        'Montpellier',
        '75001',
        3.50,
        30.00
    ),
    (
        'Basic & Co',
        'Vêtements',
        'Basiques intemporels de qualité',
        'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Basic+Shop',
        '78 Rue du Textile',
        'Montpellier',
        '75002',
        2.50,
        25.00
    ),
    (
        'Shoe Paradise',
        'Chaussures',
        'Collection exclusive de chaussures',
        'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Shoe+Shop',
        '123 Boulevard des Chaussures',
        'Montpellier',
        '75004',
        4.00,
        40.00
    ),
    (
        'Urban Style',
        'Mixte',
        'Boutique lifestyle complète',
        'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Urban+Shop',
        '34 Rue Urban',
        'Montpellier',
        '75007',
        4.50,
        50.00
    ),
    (
        'Leather Goods',
        'Accessoires',
        'Sacs, ceintures et accessoires',
        'https://via.placeholder.com/400x200/f3f4f6/9ca3af?text=Leather+Shop',
        '91 Rue du Cuir',
        'Montpellier',
        '75009',
        3.00,
        30.00
    );

-- Products
INSERT INTO
    public.products (
        shop_id,
        name,
        price,
        image,
        gender,
        description,
        category,
        stock_quantity
    )
VALUES (
        (
            SELECT id
            FROM public.shops
            WHERE
                name = 'Fashion Store Paris'
            LIMIT 1
        ),
        'Robe Élégante Soirée',
        89.90,
        'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Robe',
        'femme',
        'Robe longue en soie pour occasions spéciales',
        'Robes',
        15
    ),
    (
        (
            SELECT id
            FROM public.shops
            WHERE
                name = 'Basic & Co'
            LIMIT 1
        ),
        'T-shirt Coton Bio Blanc',
        24.90,
        'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=T-shirt',
        'homme',
        'T-shirt basique en coton biologique',
        'T-shirts',
        50
    ),
    (
        (
            SELECT id
            FROM public.shops
            WHERE
                name = 'Shoe Paradise'
            LIMIT 1
        ),
        'Baskets Cuir Blanches',
        129.90,
        'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Baskets',
        'unisexe',
        'Baskets en cuir véritable blanc',
        'Baskets',
        18
    ),
    (
        (
            SELECT id
            FROM public.shops
            WHERE
                name = 'Urban Style'
            LIMIT 1
        ),
        'Sweat à Capuche Streetwear',
        69.90,
        'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Sweat',
        'unisexe',
        'Sweat capuche style streetwear',
        'Sweats',
        25
    ),
    (
        (
            SELECT id
            FROM public.shops
            WHERE
                name = 'Leather Goods'
            LIMIT 1
        ),
        'Sac à Main Cuir Noir',
        149.90,
        'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=Sac',
        'femme',
        'Sac à main en cuir noir design moderne',
        'Sacs',
        15
    );

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
-- Voilà! Maintenant :
-- 1. Tes commandes vont s'enregistrer dans la table "orders"
-- 2. User peut voir ses propres commandes
-- 3. Tout fonctionne avec RLS
-- =====================================================