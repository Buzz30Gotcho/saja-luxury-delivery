-- =====================================================
-- LOCALSHOP - COMPLETE DATABASE SETUP (MERGED & FINAL)
-- Fusion du script French/Smart Triggers + Revised/Fixed
-- =====================================================

-- =====================================================
-- 0. PRÉPARATION - Extensions et suppression sécurisée
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Suppression des triggers
DROP TRIGGER IF EXISTS on_delivery_mission_change ON public.delivery_missions CASCADE;
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders CASCADE;
DROP TRIGGER IF EXISTS notify_on_order_taken ON public.orders CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops CASCADE;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders CASCADE;
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses CASCADE;
DROP TRIGGER IF EXISTS update_shop_staff_updated_at ON public.shop_staff CASCADE;
DROP TRIGGER IF EXISTS update_delivery_persons_updated_at ON public.delivery_persons CASCADE;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews CASCADE;
DROP TRIGGER IF EXISTS update_user_stats_on_order ON public.orders CASCADE;

-- Suppression des fonctions
DROP FUNCTION IF EXISTS public.handle_delivery_sync() CASCADE;
DROP FUNCTION IF EXISTS public.create_order_notifications() CASCADE;
DROP FUNCTION IF EXISTS public.notify_order_taken() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_order_stats() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;

-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.delivery_missions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.delivery_persons CASCADE;
DROP TABLE IF EXISTS public.shop_staff CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.delivery_zones CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.shops CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;
DROP TABLE IF EXISTS public.global_stats CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Suppression des types
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.staff_role CASCADE;
DROP TYPE IF EXISTS public.vehicle_type CASCADE;

-- =====================================================
-- 1. TYPES ET ENUMS
-- =====================================================

-- Statuts de commande (version française pour l'UI + compatibilité)
CREATE TYPE public.order_status AS ENUM (
    'en_attente',           -- pending
    'confirmee',            -- confirmed
    'preparation',          -- preparing
    'pret_pour_livraison',  -- ready_for_delivery
    'en_livraison',         -- in_delivery
    'livree',               -- delivered
    'annulee'               -- cancelled
);

CREATE TYPE public.user_role AS ENUM ('customer', 'shop_owner', 'admin', 'delivery_person');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.notification_type AS ENUM ('order_update', 'promotion', 'system', 'delivery', 'new_product');
CREATE TYPE public.staff_role AS ENUM ('owner', 'manager', 'employee');
CREATE TYPE public.vehicle_type AS ENUM ('bike', 'scooter', 'car', 'motorcycle');

-- =====================================================
-- 2. TABLES PRINCIPALES
-- =====================================================

-- Table des profils utilisateurs
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
    marketing_emails BOOLEAN DEFAULT false,
    role public.user_role NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rgpd_user_consent TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table RGPD - consentements utilisateurs
CREATE TABLE public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL,
    granted BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des boutiques
CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    delivery_time_display TEXT GENERATED ALWAYS AS (
        CASE
            WHEN delivery_time_min = delivery_time_max THEN delivery_time_min::text || ' min'
            ELSE delivery_time_min::text || '-' || delivery_time_max::text || ' min'
        END
    ) STORED,
    delivery_fee DECIMAL(10, 2) DEFAULT 2.50,
    minimum_order DECIMAL(10, 2) DEFAULT 10.00,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES auth.users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des produits
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Table des commandes
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_city TEXT,
    delivery_postal_code TEXT,
    delivery_instructions TEXT,
    status public.order_status DEFAULT 'en_attente',
    total_amount DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    shop_id UUID REFERENCES public.shops (id) NOT NULL,
    payment_method TEXT DEFAULT 'card',
    payment_status public.payment_status DEFAULT 'pending',
    estimated_delivery_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des articles de commande
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des missions de livraison
CREATE TABLE public.delivery_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_person_id UUID REFERENCES auth.users (id),
    order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
    courier_name TEXT,
    status TEXT NOT NULL DEFAULT 'accepted', -- 'accepted', 'delivered'
    pickup_lat NUMERIC(10, 8),
    pickup_lng NUMERIC(11, 8),
    dropoff_lat NUMERIC(10, 8),
    dropoff_lng NUMERIC(11, 8),
    courier_lat NUMERIC(10, 8),
    courier_lng NUMERIC(11, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (order_id) -- Une seule mission par commande
);

-- Table des notifications
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    related_entity_id UUID,
    related_entity_type TEXT,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des zones de livraison
CREATE TABLE public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE NOT NULL,
    zone_name TEXT NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    minimum_order DECIMAL(10, 2) DEFAULT 0,
    estimated_time TEXT,
    polygon_points JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des adresses utilisateurs
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'France',
    is_default BOOLEAN DEFAULT false,
    instructions TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table du personnel des boutiques
CREATE TABLE public.shop_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users (id) NOT NULL,
    role public.staff_role NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    hired_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (shop_id, user_id)
);

-- Table des livreurs
CREATE TABLE public.delivery_persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) NOT NULL,
    vehicle_type public.vehicle_type,
    vehicle_plate TEXT,
    is_available BOOLEAN DEFAULT true,
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    rating DECIMAL(2, 1) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    insurance_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des favoris utilisateurs
CREATE TABLE public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, shop_id),
    UNIQUE (user_id, product_id),
    CHECK (
        (shop_id IS NOT NULL AND product_id IS NULL)
        OR (shop_id IS NULL AND product_id IS NOT NULL)
    )
);

-- Table du panier
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- Table des avis et notations
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users (id) NOT NULL,
    shop_id UUID REFERENCES public.shops (id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products (id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders (id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (shop_id IS NOT NULL AND product_id IS NULL)
        OR (shop_id IS NULL AND product_id IS NOT NULL)
    )
);

-- Table des statistiques globales
CREATE TABLE public.global_stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_users INT DEFAULT 0,
    total_shops INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(14, 2) DEFAULT 0,
    avg_order_value DECIMAL(12, 2) DEFAULT 0,
    active_shops_7d INT DEFAULT 0,
    active_users_7d INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (date)
);

-- =====================================================
-- 3. INDEXES
-- =====================================================

-- Shops
CREATE INDEX IF NOT EXISTS idx_shops_category ON public.shops (category);
CREATE INDEX IF NOT EXISTS idx_shops_city ON public.shops (city);
CREATE INDEX IF NOT EXISTS idx_shops_active ON public.shops (is_active);
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops (owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_created ON public.shops (created_at);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products (shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products (is_available);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products (created_at);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders (shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items (product_id);

-- Delivery missions
CREATE INDEX IF NOT EXISTS idx_delivery_missions_order_id ON public.delivery_missions (order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_missions_delivery_person ON public.delivery_missions (delivery_person_id);

-- Users / Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles (default_city);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON public.user_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON public.reviews (shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_shop_staff_user ON public.shop_staff (user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_persons_available ON public.delivery_persons (is_available);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items (user_id);

-- =====================================================
-- 4. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction : créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    meta_role text;
    safe_role public.user_role;
BEGIN
    meta_role := NEW.raw_user_meta_data->>'role';
    IF meta_role IS NULL OR meta_role NOT IN ('customer', 'shop_owner', 'admin', 'delivery_person') THEN
        safe_role := 'customer';
    ELSE
        safe_role := meta_role::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, display_user, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', safe_role);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction : mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shop_staff_updated_at BEFORE UPDATE ON public.shop_staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_persons_updated_at BEFORE UPDATE ON public.delivery_persons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction : statistiques utilisateur sur les commandes
CREATE OR REPLACE FUNCTION public.update_user_order_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.user_id IS NOT NULL THEN
            UPDATE public.profiles
            SET
                total_orders = COALESCE(total_orders, 0) + 1,
                total_spent = COALESCE(total_spent, 0) + COALESCE(NEW.total_amount, 0)
            WHERE id = NEW.user_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'livree' AND NEW.user_id IS NOT NULL THEN
            UPDATE public.profiles
            SET total_spent = COALESCE(total_spent, 0) + (COALESCE(NEW.total_amount, 0) - COALESCE(OLD.total_amount, 0))
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_on_order
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_user_order_stats();

-- =====================================================
-- TRIGGER A : Synchronisation Mission -> Commande
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_delivery_sync()
RETURNS trigger AS $$
BEGIN
    -- Si une mission est créée : le coursier a accepté la livraison
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.orders
        SET status = 'en_livraison'
        WHERE id = NEW.order_id;
    END IF;

    -- Si une mission passe à 'delivered' : marquer la commande comme livrée
    IF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
            UPDATE public.orders
            SET status = 'livree'
            WHERE id = NEW.order_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_delivery_mission_change
AFTER INSERT OR UPDATE ON public.delivery_missions
FOR EACH ROW EXECUTE FUNCTION public.handle_delivery_sync();

-- =====================================================
-- TRIGGER B : Notifications automatiques pour le client
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_order_notifications()
RETURNS trigger AS $$
BEGIN
    -- Commande en cours de livraison
    IF NEW.status = 'en_livraison' AND OLD.status <> 'en_livraison' THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_entity_id, related_entity_type)
        VALUES (
            NEW.user_id,
            'delivery',
            'Votre commande arrive ! 🚀',
            'Un coursier a récupéré votre colis et est en route.',
            NEW.id,
            'order'
        );
    END IF;

    -- Commande livrée
    IF NEW.status = 'livree' AND OLD.status <> 'livree' THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_entity_id, related_entity_type)
        VALUES (
            NEW.user_id,
            'delivery',
            'Commande livrée ! ✅',
            'Votre commande a été livrée. Bon appétit !',
            NEW.id,
            'order'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.create_order_notifications();

-- =====================================================
-- TRIGGER C : Notification à la prise en charge par le coursier
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_order_taken()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'en_livraison' AND OLD.status = 'pret_pour_livraison' THEN
        INSERT INTO public.notifications (user_id, type, title, message, related_entity_id, related_entity_type)
        VALUES (
            NEW.user_id,
            'delivery',
            'Votre commande est en cours de livraison',
            'Un coursier a pris en charge votre commande.',
            NEW.id,
            'order'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_order_taken
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_order_taken();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_stats ENABLE ROW LEVEL SECURITY;

-- Fonction utilitaire : rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- USER CONSENTS
CREATE POLICY "Users can view own consents" ON public.user_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consents" ON public.user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
        OR (auth.uid() IS NULL AND EXISTS (SELECT 1 FROM auth.users WHERE id = profiles.id))
    );

-- SHOPS
CREATE POLICY "shops_select_all" ON public.shops FOR SELECT USING (is_active = true);
CREATE POLICY "shops_insert_own" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shops_update_own" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "shops_delete_own" ON public.shops FOR DELETE USING (auth.uid() = owner_id);

-- PRODUCTS
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (is_available = true);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.owner_id = auth.uid())
);

-- ORDERS
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Commandes prêtes à livrer : visibles par les coursiers
CREATE POLICY "courier_can_see_ready_orders" ON public.orders
    FOR SELECT USING (status = 'pret_pour_livraison');

-- Admin : accès complet aux commandes
CREATE POLICY "admin_can_select_all_orders" ON public.orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- DELIVERY MISSIONS
CREATE POLICY "Coursiers can see available missions" ON public.delivery_missions
    FOR SELECT USING (true);
CREATE POLICY "Coursiers can manage their missions" ON public.delivery_missions
    FOR ALL USING (auth.uid() = delivery_person_id);
CREATE POLICY "delivery_missions_select_own" ON public.delivery_missions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = delivery_missions.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- USER ADDRESSES
CREATE POLICY "user_addresses_own" ON public.user_addresses FOR ALL USING (auth.uid() = user_id);

-- USER FAVORITES
CREATE POLICY "user_favorites_own" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);

-- CART ITEMS
CREATE POLICY "Users can manage their own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "reviews_select_published" ON public.reviews FOR SELECT USING (is_published = true);
CREATE POLICY "reviews_own" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin_can_select_all_notifications" ON public.notifications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- SHOP STAFF
CREATE POLICY "shop_staff_shop_owner" ON public.shop_staff FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = shop_staff.shop_id AND shops.owner_id = auth.uid())
);

-- GLOBAL STATS (admin uniquement)
CREATE POLICY "global_stats_admin_only" ON public.global_stats FOR ALL USING (false);

-- =====================================================
-- 6. DONNÉES D'EXEMPLE
-- =====================================================

INSERT INTO public.shops (
    name, category, description, image, address, city, postal_code,
    latitude, longitude, delivery_fee, minimum_order, delivery_time_min, delivery_time_max
)
VALUES
-- PARIS (4)
(
    'Maison Élégance Paris', 'Vêtements',
    'Vêtements tendance pour homme et femme - collections actuelles',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_clothes.jpg',
    '45 Avenue de la Mode', 'Paris', '75001',
    48.8566, 2.3522, 3.50, 30.00, 20, 40
),
(
    'Atelier Rivoli', 'Vêtements',
    'Basiques intemporels de qualité',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_atelier_rivoli_.jpg',
    '78 Rue du Textile', 'Paris', '75002',
    48.8660, 2.3430, 2.50, 25.00, 15, 30
),
(
    'Maison Velocity', 'Chaussures',
    'Chaussures exclusives pour femmes',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/boutique_maison_velocity.jpeg',
    '12 Rue Oberkampf', 'Paris', '75011',
    48.8640, 2.3780, 4.50, 60.00, 20, 40
),
(
    'Maison Vendôme', 'Accessoires',
    'Bijoux tendance',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_maison_vendome.jpg',
    '5 Place Vendôme', 'Paris', '75001',
    48.8675, 2.3290, 2.00, 20.00, 15, 25
),

-- BORDEAUX (4)
(
    'Maison Montaigne', 'Mixte',
    'Boutique lifestyle complète',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_mixte.jpg',
    '34 Rue Sainte-Catherine', 'Bordeaux', '33000',
    44.8378, -0.5792, 4.50, 50.00, 20, 35
),
(
    'Élite Performance', 'Mixte',
    'Sportswear et lifestyle',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_mixte_1.jpg',
    '67 Cours Victor Hugo', 'Bordeaux', '33000',
    44.8350, -0.5730, 3.50, 45.00, 20, 40
),
(
    'Galerie du Cuir', 'Chaussures',
    'Sneakers grandes marques',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_galerie_cuir.jpeg',
    '123 Rue Sainte-Catherine', 'Bordeaux', '33000',
    44.8378, -0.5792, 4.00, 40.00, 25, 45
),
(
    'Atelier Maroquin', 'Accessoires',
    'Articles en cuir',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_accessories.jpg',
    '91 Quai des Chartrons', 'Bordeaux', '33100',
    44.8500, -0.5700, 3.00, 30.00, 15, 30
),

-- CANNES (3)
(
    'Maison Indigo', 'Vêtements',
    'Spécialiste du jean',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_maison_indigo.webp',
    '22 Rue d’Antibes', 'Cannes', '06400',
    43.5528, 7.0174, 3.00, 35.00, 20, 35
),
(
    'Cannes Prestige', 'Chaussures',
    'Chaussures haut de gamme',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shoes_luxe.jpg',
    '56 Rue d’Antibes', 'Cannes', '06400',
    43.5528, 7.0174, 5.00, 80.00, 30, 60
),
(
    'Noir Avenue', 'Vêtements',
    'Streetwear moderne',
    'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_mixte.jpg',
    '12 Rue Meynadier', 'Cannes', '06400',
    43.5535, 7.0150, 3.50, 25.00, 20, 40
);

-- Produits
INSERT INTO public.products (shop_id, name, price, image, gender, description, category, stock_quantity) VALUES

-- PARIS
((SELECT id FROM public.shops WHERE name = 'Maison Élégance Paris'), 'Robe Élégante Soirée', 89.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_robe.jpeg', 'femme', 'Robe longue en soie pour occasions spéciales', 'Robes', 15),
((SELECT id FROM public.shops WHERE name = 'Maison Élégance Paris'), 'Costume Classique Homme', 199.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_costume2piece.jpg', 'homme', 'Costume deux pièces en laine premium', 'Costumes', 10),
((SELECT id FROM public.shops WHERE name = 'Maison Élégance Paris'), 'Blazer Tailleur', 129.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_Blazer_Tailleur.avif', 'femme', 'Blazer élégant pour tenue professionnelle', 'Vestes', 12),

((SELECT id FROM public.shops WHERE name = 'Atelier Rivoli'), 'chemise chambray cravate cropped', 690, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/chemise_miu_miu.webp', 'femme', 'chemise chambray cravate cropped', 'chemises', 50),
((SELECT id FROM public.shops WHERE name = 'Atelier Rivoli'), 'Pull Col Rond Laine', 79.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_Pull_Col_Rond_Laine.jpg', 'femme', 'Pull en laine mérinos confortable', 'Pulls', 30),
((SELECT id FROM public.shops WHERE name = 'Atelier Rivoli'), 'Chemise Oxford Bleue Femme', 45.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_chemiseOxfordBleue.webp', 'femme', 'Chemise classique en coton oxford', 'Chemises', 20),

((SELECT id FROM public.shops WHERE name = 'Maison Velocity'), 'Escarpins Limited Edition', 299.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/escarpin_femme_maison_velocity.avif', 'femme', 'Escarpins édition limitée en cuir noir', 'Escarpins', 3),

((SELECT id FROM public.shops WHERE name = 'Maison Velocity'), 'Sandales Cuir Femme - Édition Signature', 179.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/sandale_cuir_maison_velocity.avif', 'femme', 'Sandales en cuir véritable de couleur talc (blanc poudré), finition haut de gamme et design élégant', 'Sandales', 8),

((SELECT id FROM public.shops WHERE name = 'Maison Velocity'), 'Sandales Cuir Femme - Édition Signature', 179.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/sandale_cuir_metalise_maison_velocity.avif', 'femme', 'Sandales plates en cuir métallisé', 'Sandales', 9),

((SELECT id FROM public.shops WHERE name = 'Maison Vendôme'), 'Collier Élégant Argent', 45.90, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e', 'femme', 'Collier en argent avec pendentif', 'Bijoux', 25),
((SELECT id FROM public.shops WHERE name = 'Maison Vendôme'), 'Boucles d Oreilles Cristal', 29.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/shop_accessoire_boucle_oreille.jpeg', 'femme', 'Boucles d oreilles cristal scintillant', 'Bijoux', 40),
((SELECT id FROM public.shops WHERE name = 'Maison Vendôme'), 'Montre Minimaliste', 89.90, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49', 'homme', 'Montre bracelet cuir minimaliste', 'Montres', 12),

-- BORDEAUX
((SELECT id FROM public.shops WHERE name = 'Maison Montaigne'), 'Sweat à Capuche Streetwear', 69.90, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', 'unisexe', 'Sweat capuche style streetwear', 'Sweats', 25),
((SELECT id FROM public.shops WHERE name = 'Maison Montaigne'), 'Baskets Urban White', 119.90, 'https://images.unsplash.com/photo-1542280756-74b2f55e73ab', 'unisexe', 'Baskets urban lifestyle blanches', 'Baskets', 20),
((SELECT id FROM public.shops WHERE name = 'Maison Montaigne'), 'Veste Denim Destroyed', 89.90, 'https://images.unsplash.com/photo-1551028719-00167b16eac5', 'unisexe', 'Veste denim effet destroyed', 'Vestes', 15),

((SELECT id FROM public.shops WHERE name = 'Élite Performance'), 'Survêtement Technique', 79.90, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7', 'unisexe', 'Survêtement technique pour training', 'Sportswear', 20),
((SELECT id FROM public.shops WHERE name = 'Élite Performance'), 'Baskets Running Pro', 129.90, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', 'unisexe', 'Baskets de running professionnelles', 'Chaussures sport', 15),
((SELECT id FROM public.shops WHERE name = 'Élite Performance'), 'Olinda Jeckt', 546, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/olinda_jacket_elite_performance.webp', 'femme', 'Coloris Coffee Cream - finition élégante et douce', 'Vêtements', 17),

((SELECT id FROM public.shops WHERE name = 'Galerie du Cuir'), 'Chaussures derby en cuir avec des détails de surpiqûre', 199, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/chaussure_cuir_noir.jpeg', 'homme', 'Baskets en cuir véritable blanc', 'Baskets', 18),
((SELECT id FROM public.shops WHERE name = 'Galerie du Cuir'), 'Escarpins Noirs Élégants', 89.90, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', 'femme', 'Escarpins noirs pour tenue chic', 'Escarpins', 12),
((SELECT id FROM public.shops WHERE name = 'Galerie du Cuir'), 'Sandales Été Tressées', 59.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/sandale_tressee_ete%20(1).jpg', 'unisexe', 'Sandales tressées pour l été', 'Sandales', 15),

((SELECT id FROM public.shops WHERE name = 'Atelier Maroquin'), 'Sac à Main Cuir Noir', 149.90, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', 'femme', 'Sac à main en cuir noir design moderne', 'Sacs', 15),
((SELECT id FROM public.shops WHERE name = 'Atelier Maroquin'), 'Ceinture Cuir Vintage', 34.90, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 'unisexe', 'Ceinture en cuir véritable vintage', 'Ceintures', 30),
((SELECT id FROM public.shops WHERE name = 'Atelier Maroquin'), 'Portefeuille Cuir Brun', 49.90, 'https://images.unsplash.com/photo-1627123424574-724758594e93', 'unisexe', 'Portefeuille en cuir brun élégant', 'Accessoires', 25),

-- CANNES
((SELECT id FROM public.shops WHERE name = 'Maison Indigo'), 'Jean Slim Délavé', 59.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_Jean_Slim_Delave.jpg', 'homme', 'Jean slim délavé confortable', 'Jeans', 25),
((SELECT id FROM public.shops WHERE name = 'Maison Indigo'), 'Jean Droit Noir', 65.90, 'https://images.unsplash.com/photo-1582418702059-97ebafb35d09', 'femme', 'Jean droit couleur noir élégant', 'Jeans', 18),
((SELECT id FROM public.shops WHERE name = 'Maison Indigo'), 'Jean Boyfriend Femme', 69.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_clothe_JeanBoyfriendFemme.webp', 'femme', 'Jean boyfriend confortable pour femme', 'Jeans', 22),

((SELECT id FROM public.shops WHERE name = 'Cannes Prestige'), 'Bottes Cuir Marron', 259.90, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f', 'femme', 'Bottes en cuir marron qualité premium', 'Bottes', 8),
((SELECT id FROM public.shops WHERE name = 'Cannes Prestige'), 'Derby Cuir Brun', 189.90, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4', 'homme', 'Derby en cuir brun pour homme', 'Chaussures homme', 10),
((SELECT id FROM public.shops WHERE name = 'Cannes Prestige'), 'Escarpins Louboutin', 450.90, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2', 'femme', 'Escarpins rouge signature', 'Escarpins', 5),

((SELECT id FROM public.shops WHERE name = 'Noir Avenue'), 'Hoodie Oversize Street', 59.90, 'https://vsofxamdhxaxxedrmyxy.supabase.co/storage/v1/object/public/shop/product_hoodie_montpellier.jpg', 'unisexe', 'Hoodie oversize style streetwear premium', 'Sweats', 20);

-- =====================================================
-- FIN DU SCRIPT
-- Copiez TOUT le script dans l'éditeur SQL de Supabase et exécutez-le.
-- =====================================================
